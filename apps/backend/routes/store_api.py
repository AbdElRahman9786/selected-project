from flask import Blueprint, jsonify, request
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from config import (
    PAYMOB_API_KEY,
    PAYMOB_CURRENCY,
    PAYMOB_IFRAME_ID,
    PAYMOB_INTEGRATION_ID,
    PAYMOB_PUBLIC_KEY,
    PAYMOB_REDIRECT_URL,
    PAYMOB_SECRET_KEY,
    PAYMOB_HMAC_SECRET,
)
from db import get_db_connection

store_bp = Blueprint('store', __name__)
PAYMOB_BASE_URL = 'https://accept.paymob.com/api'

PRODUCT_SELECT_COLUMNS = '''
    id, name, category, description, sizes, colors, color_names,
    in_stock, is_new, featured, price, old_price, image, images,
    badge, badge_text, rating, reviews, stock, category_id, image_url,
    created_at
'''


def get_db():
    return get_db_connection()


def _json_value(value, default):
    if value in (None, ''):
        return default
    if isinstance(value, (list, dict)):
        return value
    try:
        return json.loads(value)
    except Exception:
        return default


def _paymob_request(path, payload):
    data = json.dumps(payload).encode('utf-8')
    request = Request(
        f'{PAYMOB_BASE_URL}{path}',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )

    try:
        with urlopen(request, timeout=30) as response:
            body = response.read().decode('utf-8')
            return json.loads(body) if body else {}
    except HTTPError as exc:
        detail = exc.read().decode('utf-8') if exc.fp else ''
        try:
            parsed = json.loads(detail) if detail else {}
        except Exception:
            parsed = {'error': detail or str(exc)}
        raise RuntimeError(parsed.get('detail') or parsed.get('message') or parsed.get('error') or str(exc))
    except URLError as exc:
        raise RuntimeError(str(exc.reason))


def _get_paymob_auth_token():
    if not PAYMOB_API_KEY:
        raise RuntimeError('Paymob API key is not configured.')

    response = _paymob_request('/auth/tokens', {'api_key': PAYMOB_API_KEY})
    token = response.get('token')
    if not token:
        raise RuntimeError('Paymob auth token was not returned.')
    return token


def _build_paymob_billing_data(order, email, city):
    first_name = (order.get('first_name') or 'Customer').strip() or 'Customer'
    last_name = (order.get('last_name') or 'User').strip() or 'User'
    address = (order.get('address') or 'N/A').strip() or 'N/A'
    phone = (order.get('phone') or '00000000000').strip() or '00000000000'
    email = (email or 'customer@example.com').strip() or 'customer@example.com'
    city = (city or 'Cairo').strip() or 'Cairo'

    return {
        'email': email,
        'first_name': first_name[:50],
        'last_name': last_name[:50],
        'phone_number': phone[:20],
        'apartment': '1',
        'floor': '1',
        'street': address[:200],
        'building': '1',
        'shipping_method': 'standard',
        'postal_code': '00000',
        'city': city[:50],
        'country': 'EG',
        'state': 'N/A',
    }


def product_to_dict(row):
    return {
        'id':          row['id'],
        'name':        row['name'],
        'category':    row['category'],
        'price':       float(row['price'] or 0),
        'oldPrice':    float(row['old_price']) if row.get('old_price') not in (None, '') else None,
        'image':       row.get('image') or row.get('image_url'),
        'images':      _json_value(row.get('images'), []),
        'badge':       row.get('badge'),
        'badgeText':   row.get('badge_text'),
        'rating':      float(row.get('rating') or 0),
        'reviews':     row.get('reviews') or 0,
        'description': row.get('description'),
        'sizes':       _json_value(row.get('sizes'), []),
        'colors':      _json_value(row.get('colors'), []),
        'colorNames':  _json_value(row.get('color_names'), []),
        'inStock':     bool(row.get('in_stock')),
        'isNew':       bool(row.get('is_new')),
        'featured':    bool(row.get('featured')),
        'createdAt':   row.get('created_at').isoformat() if row.get('created_at') else None,
    }

# ───────────────────────────────────────────────

@store_bp.route('/api/health')
def health():
    try:
        conn = get_db()
        conn.close()
        return jsonify({"status": "healthy"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


# ── PRODUCTS ───────────────────────────────────────────────
@store_bp.route('/api/products')
def get_products():
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        query = f"SELECT {PRODUCT_SELECT_COLUMNS} FROM products WHERE 1=1"
        params = []

        category = request.args.get('category')
        if category and category != 'all':
            query += " AND category = %s"
            params.append(category)

        min_price = request.args.get('min_price', 0, type=float)
        max_price = request.args.get('max_price', 9999, type=float)
        query += " AND price BETWEEN %s AND %s"
        params.extend([min_price, max_price])

        search = request.args.get('search', '').strip()
        if search:
            like = f"%{search}%"
            query += " AND (name LIKE %s OR description LIKE %s OR category LIKE %s)"
            params.extend([like, like, like])

        sort = request.args.get('sort', 'featured')
        sort_map = {
            'featured': 'id ASC',
            'newest': 'is_new DESC, created_at DESC',
            'price-asc': 'price ASC',
            'price-desc': 'price DESC',
            'name-asc': 'name ASC',
            'rating': 'rating DESC',
        }

        query += f" ORDER BY {sort_map.get(sort, 'id ASC')}"

        cursor.execute(query, params)
        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "products": [product_to_dict(r) for r in rows],
            "total": len(rows)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── SINGLE PRODUCT ─────────────────────────────────────────
@store_bp.route('/api/products/<int:product_id>')
def get_product(product_id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(f"SELECT {PRODUCT_SELECT_COLUMNS} FROM products WHERE id = %s", (product_id,))
        row = cursor.fetchone()

        cursor.close()
        conn.close()

        if not row:
            return jsonify({"error": "Product not found"}), 404

        return jsonify(product_to_dict(row))

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── RELATED PRODUCTS ───────────────────────────────────────
@store_bp.route('/api/products/<int:product_id>/related')
def get_related(product_id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT category FROM products WHERE id=%s", (product_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Product not found"}), 404

        cursor.execute(
            f"SELECT {PRODUCT_SELECT_COLUMNS} FROM products WHERE category=%s AND id!=%s LIMIT 4",
            (row['category'], product_id)
        )

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "related": [product_to_dict(r) for r in rows]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── CART ADD  ───────────────────────────────────────
@store_bp.route('/api/cart', methods=['POST'])
def add_to_cart():
    try:
        data = request.get_json()

        session_id = data.get('session_id')
        product_id = data.get('product_id')
        quantity   = data.get('quantity', 1)
        size       = data.get('size')
        color      = data.get('color')

        if not session_id or not product_id:
            return jsonify({"error": "session_id and product_id required"}), 400

       
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT id, in_stock FROM products WHERE id=%s", (product_id,))
        product = cursor.fetchone()

        if not product:
            return jsonify({"error": "Product not found"}), 404

        if not product[1]:
            return jsonify({"error": "Product out of stock"}), 400

       
        if not isinstance(quantity, int) or quantity < 1 or quantity > 100:
            return jsonify({"error": "Invalid quantity"}), 400

        cursor.execute(
            """SELECT id FROM cart_items
               WHERE session_id=%s AND product_id=%s AND size<=>%s AND color<=>%s""",
            (session_id, product_id, size, color)
        )

        existing = cursor.fetchone()

        if existing:
            cursor.execute(
                "UPDATE cart_items SET quantity = quantity + %s WHERE id=%s",
                (quantity, existing[0])
            )
        else:
            cursor.execute(
                """INSERT INTO cart_items
                   (session_id, product_id, quantity, size, color)
                   VALUES (%s,%s,%s,%s,%s)""",
                (session_id, product_id, quantity, size, color)
            )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Added to cart"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── CART GET ───────────────────────────────────────────────
@store_bp.route('/api/cart')
def get_cart():
    try:
        session_id = request.args.get('session_id')
        if not session_id:
            return jsonify({"error": "session_id required"}), 400

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT ci.id, ci.quantity, ci.size, ci.color,
                   p.id, p.name, p.price, p.image, p.in_stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.session_id=%s
        """, (session_id,))

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        items = [{
            "cart_item_id": r[0],
            "quantity": r[1],
            "size": r[2],
            "color": r[3],
            "product_id": r[4],
            "name": r[5],
            "price": float(r[6]),
            "image": r[7],
            "inStock": bool(r[8]),
        } for r in rows]

        total = sum(i["price"] * i["quantity"] for i in items)

        return jsonify({"items": items, "total": round(total, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── NEWSLETTER ────────────────────────────────────────────
@store_bp.route('/api/newsletter', methods=['POST'])
def newsletter():
    try:
        email = request.get_json().get('email', '').strip()

        if not email or '@' not in email:
            return jsonify({"error": "Invalid email"}), 400

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT IGNORE INTO newsletter_subscribers (email) VALUES (%s)",
            (email,)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Subscribed"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── CART UPDATE ───────────────────────────────────────────
@store_bp.route('/api/cart/<int:item_id>', methods=['PUT'])
def update_cart_item(item_id):
    try:
        quantity = request.get_json().get('quantity', 1)

        if not isinstance(quantity, int) or quantity < 0:
            return jsonify({"error": "Invalid quantity"}), 400

        conn = get_db()
        cursor = conn.cursor()

        if quantity == 0:
            cursor.execute("DELETE FROM cart_items WHERE id=%s", (item_id,))
        else:
            cursor.execute(
                "UPDATE cart_items SET quantity=%s WHERE id=%s",
                (quantity, item_id)
            )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Updated"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── DELETE CART ITEM ──────────────────────────────────────
@store_bp.route('/api/cart/<int:item_id>', methods=['DELETE'])
def delete_cart_item(item_id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM cart_items WHERE id=%s", (item_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Deleted"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── CLEAR CART ────────────────────────────────────────────
@store_bp.route('/api/cart', methods=['DELETE'])
def clear_cart():
    try:
        session_id = request.args.get('session_id')

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM cart_items WHERE session_id=%s",
            (session_id,)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Cart cleared"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── VALIDATE COUPON ───────────────────────────────────────
@store_bp.route('/api/validate-coupon', methods=['POST'])
def validate_coupon():
    try:
        code = request.get_json().get('code', '').strip().upper()

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT discount_pct FROM coupons WHERE code=%s AND active=TRUE",
            (code,)
        )

        row = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({"valid": bool(row), "discount_pct": row[0] if row else 0})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@store_bp.route('/api/paymob/session', methods=['POST'])
def create_paymob_session():
    """Create a Paymob payment session using the v2 Intention API.

    Falls back to the legacy v1 API if no secret key is configured.
    """
    try:
        data = request.get_json(silent=True) or {}
        order_id = data.get('order_id')
        email = data.get('email')
        city = data.get('city')

        if not order_id:
            return jsonify({'error': 'order_id is required.'}), 400

        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                '''
                SELECT id, first_name, last_name, address, phone, total
                FROM orders
                WHERE id = %s
                ''',
                (order_id,),
            )
            order = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

        if not order:
            return jsonify({'error': 'Order not found.'}), 404

        amount_cents = int(round(float(order['total']) * 100))
        currency = PAYMOB_CURRENCY or 'EGP'
        redirect_url = f'{PAYMOB_REDIRECT_URL}?order_id={order_id}'
        billing = _build_paymob_billing_data(order, email, city)

        # ── Try new v2 Intention API first ──────────────────────────────
        if PAYMOB_SECRET_KEY and PAYMOB_INTEGRATION_ID:
            intention_payload = {
                'amount': amount_cents,
                'currency': currency,
                'payment_methods': [int(PAYMOB_INTEGRATION_ID)],
                'items': [
                    {
                        'name': 'Order #' + str(order_id),
                        'amount': amount_cents,
                        'description': 'Aboss store order',
                        'quantity': 1,
                    }
                ],
                'billing_data': billing,
                'customer': {
                    'first_name': billing['first_name'],
                    'last_name': billing['last_name'],
                    'email': billing['email'],
                    'phone_number': billing['phone_number'],
                },
                'redirection_url': redirect_url,
                'notification_url': redirect_url,
                'extras': {'order_id': str(order_id)},
            }

            intention_data = json.dumps(intention_payload).encode('utf-8')
            intention_req = Request(
                'https://accept.paymob.com/v1/intention/',
                data=intention_data,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Token {PAYMOB_SECRET_KEY}',
                },
                method='POST',
            )

            try:
                with urlopen(intention_req, timeout=30) as resp:
                    resp_body = resp.read().decode('utf-8')
                    intention_resp = json.loads(resp_body) if resp_body else {}
            except HTTPError as exc:
                detail = exc.read().decode('utf-8') if exc.fp else ''
                try:
                    parsed = json.loads(detail) if detail else {}
                except Exception:
                    parsed = {}
                err_msg = (
                    parsed.get('detail')
                    or parsed.get('message')
                    or parsed.get('error')
                    or detail
                    or str(exc)
                )
                return jsonify({'error': f'Paymob v2 error: {err_msg}'}), 502

            client_secret = intention_resp.get('client_secret')
            if not client_secret:
                return jsonify({
                    'error': 'Paymob v2 intention did not return a client_secret.',
                    'detail': intention_resp,
                }), 502

            public_key = PAYMOB_PUBLIC_KEY or ''
            payment_url = (
                f'https://accept.paymob.com/unifiedcheckout/'
                f'?publicKey={public_key}&clientSecret={client_secret}'
            )

            return jsonify({
                'payment_url': payment_url,
                'client_secret': client_secret,
                'redirect_url': redirect_url,
            }), 200

        # ── Fallback: legacy v1 API ─────────────────────────────────────
        if not PAYMOB_API_KEY:
            return jsonify({'error': 'No Paymob credentials configured (secret key or API key required).'}), 500

        if not PAYMOB_INTEGRATION_ID:
            return jsonify({'error': 'Paymob integration ID is not configured.'}), 500

        if not PAYMOB_IFRAME_ID:
            return jsonify({'error': 'Paymob iframe ID is not configured.'}), 500

        auth_token = _get_paymob_auth_token()

        paymob_order = _paymob_request('/ecommerce/orders', {
            'auth_token': auth_token,
            'delivery_needed': False,
            'amount_cents': amount_cents,
            'currency': currency,
            'items': [],
        })

        paymob_order_id = paymob_order.get('id')
        if not paymob_order_id:
            return jsonify({'error': 'Paymob order registration failed (legacy v1).'}), 502

        payment_key = _paymob_request('/acceptance/payment_keys', {
            'auth_token': auth_token,
            'amount_cents': amount_cents,
            'expiration': 3600,
            'order_id': paymob_order_id,
            'billing_data': billing,
            'currency': currency,
            'integration_id': int(PAYMOB_INTEGRATION_ID),
            'lock_order_when_paid': True,
            'redirection_url': redirect_url,
        })

        token = payment_key.get('token')
        if not token:
            return jsonify({'error': 'Paymob payment token was not returned (legacy v1).'}), 502

        payment_url = (
            f'https://accept.paymob.com/api/acceptance/iframes/'
            f'{PAYMOB_IFRAME_ID}?payment_token={token}'
        )

        return jsonify({
            'payment_url': payment_url,
            'payment_token': token,
            'paymob_order_id': paymob_order_id,
            'redirect_url': redirect_url,
        }), 200

    except RuntimeError as exc:
        return jsonify({'error': str(exc)}), 502
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


# ── ORDERS 
@store_bp.route('/api/orders', methods=['POST'])
def place_order():
    try:
        data = request.get_json()

        user_id   = data.get('user_id')
        session_id = data.get('session_id')
        first_name = data.get('first_name')
        last_name  = data.get('last_name')
        address    = data.get('address')
        email      = data.get('email')
        phone      = data.get('phone')
        items      = data.get('items', [])

        resolved_user_id = None
        if user_id not in (None, ''):
            try:
                resolved_user_id = int(user_id)
            except (TypeError, ValueError):
                resolved_user_id = None

        if resolved_user_id is None and email:
            conn = get_db()
            cursor = conn.cursor()
            try:
                cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
                user_row = cursor.fetchone()
                if user_row:
                    resolved_user_id = user_row[0]
            finally:
                cursor.close()
                conn.close()

        missing = []
        if not first_name:
            missing.append('first_name')
        if not last_name:
            missing.append('last_name')
        if not address:
            missing.append('address')
        if not phone:
            missing.append('phone')
        if not items:
            missing.append('items')

        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        conn = get_db()
        cursor = conn.cursor()

       
        subtotal = 0
        product_prices = {}

        for item in items:
            cursor.execute(
                "SELECT price FROM products WHERE id=%s",
                (item['product_id'],)
            )

            row = cursor.fetchone()

            if not row:
                return jsonify({"error": "Invalid product in order"}), 400

            price = float(row[0])
            product_prices[item['product_id']] = price

            subtotal += price * item['qty']

        shipping = 0 if subtotal >= 150 else 8.99
        tax = subtotal * 0.14
        total = subtotal + shipping + tax

        cursor.execute(
            """INSERT INTO orders
                    (user_id, session_id, first_name, last_name, address, shipping_address, phone,
                     subtotal, shipping, tax, total, total_amount)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (resolved_user_id, session_id, first_name, last_name, address, address, phone,
                 subtotal, shipping, tax, total, total)
        )

        order_id = cursor.lastrowid

        for item in items:
            cursor.execute(
                """INSERT INTO order_items
                   (order_id, product_id, product_name, quantity, price, price_at_purchase, size, color)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (
                    order_id,
                    item['product_id'],
                    item['name'],
                    item['qty'],
                    product_prices[item['product_id']],
                    product_prices[item['product_id']],
                    item.get('size'),
                    item.get('color')
                )
            )

        if session_id:
            cursor.execute("DELETE FROM cart_items WHERE session_id=%s", (session_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Order placed", "order_id": order_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET SINGLE ORDER ──────────────────────────────────────────────────
@store_bp.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Return order header + items for the payment success page."""
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # Fetch order header
        cursor.execute(
            '''
            SELECT id, first_name, last_name, address, city, phone,
                   subtotal, shipping, tax, total, status, created_at
            FROM orders
            WHERE id = %s
            ''',
            (order_id,),
        )
        order = cursor.fetchone()

        if not order:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Order not found'}), 404

        # Fetch line items
        cursor.execute(
            '''
            SELECT product_id, product_name AS name, quantity, price_at_purchase AS price,
                   size, color
            FROM order_items
            WHERE order_id = %s
            ''',
            (order_id,),
        )
        items = cursor.fetchall()
        cursor.close()
        conn.close()

        order['total']    = float(order['total']    or 0)
        order['subtotal'] = float(order['subtotal'] or 0)
        order['shipping'] = float(order['shipping'] or 0)
        order['tax']      = float(order['tax']      or 0)
        if order.get('created_at'):
            order['created_at'] = order['created_at'].isoformat()

        for item in items:
            item['price']    = float(item['price'] or 0)
            item['quantity'] = int(item['quantity'] or 1)

        return jsonify({'order': {**order, 'items': items}}), 200

    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


# ── PAYMOB WEBHOOK ────────────────────────────────────────────────────
@store_bp.route('/api/v1/webhooks/paymob', methods=['POST'])
def paymob_webhook():
    """Webhook listener for Paymob transaction processed callbacks."""
    import hmac
    import hashlib
    try:
        data = request.get_json(silent=True) or {}
        received_hmac = request.args.get('hmac')

        # Calculate & verify HMAC if secret is configured
        if PAYMOB_HMAC_SECRET:
            if not received_hmac:
                return jsonify({'error': 'Missing HMAC signature.'}), 400
            
            # HMAC verification
            obj = data.get('obj', {})
            keys = [
                "amount_cents", "created_at", "currency", "error_occured",
                "has_parent_transaction", "id", "integration_id", "is_3d_secure",
                "is_auth", "is_capture", "is_refunded", "is_standalone_payment",
                "is_voided", "order", "owner", "pending", "source_data.pan",
                "source_data.sub_type", "source_data.type", "success"
            ]

            def get_value(k):
                if k == "order":
                    val = obj.get("order")
                    if isinstance(val, dict):
                        return str(val.get("id") or "")
                    return str(val or "")
                elif k.startswith("source_data."):
                    child = k.split(".")[1]
                    sd = obj.get("source_data", {})
                    return str(sd.get(child) if sd else "")
                else:
                    val = obj.get(k)
                    if isinstance(val, bool):
                        return "true" if val else "false"
                    if val is None:
                        return ""
                    return str(val)

            message = "".join(get_value(k) for k in keys)
            calculated = hmac.new(
                PAYMOB_HMAC_SECRET.encode('utf-8'),
                message.encode('utf-8'),
                hashlib.sha512
            ).hexdigest()

            if not hmac.compare_digest(calculated, received_hmac):
                return jsonify({'error': 'Invalid HMAC signature.'}), 403

        # Process the webhook payload
        obj = data.get('obj', {})
        success_status = obj.get('success')
        
        # Check if success is true (either boolean True or string "true")
        is_success = (success_status is True) or (str(success_status).lower() == "true")
        
        if is_success:
            # Retrieve internal order ID from extras or merchant_order_id
            order_id = None
            
            # Check intention v2 extra fields
            extra = obj.get('extra') or obj.get('extras') or {}
            if isinstance(extra, dict):
                order_id = extra.get('order_id')
            
            # Check merchant_order_id
            if not order_id:
                order_id = obj.get('merchant_order_id')
            
            # Check nested order merchant_order_id
            if not order_id and isinstance(obj.get('order'), dict):
                order_id = obj.get('order', {}).get('merchant_order_id')
                
            if order_id:
                try:
                    order_id_int = int(order_id)
                    conn = get_db()
                    cursor = conn.cursor()
                    cursor.execute(
                        "UPDATE orders SET status = 'processing' WHERE id = %s AND status = 'pending'",
                        (order_id_int,)
                    )
                    conn.commit()
                    cursor.close()
                    conn.close()
                except Exception as db_err:
                    print(f"[Paymob Webhook] DB Error updating order {order_id}: {db_err}")

        return jsonify({'status': 'received'}), 200

    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


