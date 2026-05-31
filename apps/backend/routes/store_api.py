from flask import Blueprint, jsonify, request
import json

from db import get_db_connection

store_bp = Blueprint('store', __name__)


def get_db():
    return get_db_connection()


def product_to_dict(row):
    return {
        'id':          row[0],
        'name':        row[1],
        'category':    row[2],
        'price':       float(row[3]),
        'oldPrice':    float(row[4]) if row[4] else None,
        'image':       row[5],
        'images':      json.loads(row[6]) if row[6] else [],
        'badge':       row[7],
        'badgeText':   row[8],
        'rating':      float(row[9]) if row[9] else 0,
        'reviews':     row[10],
        'description': row[11],
        'sizes':       json.loads(row[12]) if row[12] else [],
        'colors':      json.loads(row[13]) if row[13] else [],
        'colorNames':  json.loads(row[14]) if row[14] else [],
        'inStock':     bool(row[15]),
        'isNew':       bool(row[16]),
        'featured':    bool(row[17]),
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
        cursor = conn.cursor()

        query = "SELECT * FROM products WHERE 1=1"
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
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
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
        cursor = conn.cursor()

        cursor.execute("SELECT category FROM products WHERE id=%s", (product_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Product not found"}), 404

        cursor.execute(
            "SELECT * FROM products WHERE category=%s AND id!=%s LIMIT 4",
            (row[0], product_id)
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


# ── ORDERS 
@store_bp.route('/api/orders', methods=['POST'])
def place_order():
    try:
        data = request.get_json()

        session_id = data.get('session_id')
        first_name = data.get('first_name')
        last_name  = data.get('last_name')
        address    = data.get('address')
        phone      = data.get('phone')
        items      = data.get('items', [])

        if not all([first_name, last_name, address, phone, items]):
            return jsonify({"error": "Missing fields"}), 400

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
               (session_id, first_name, last_name, address, phone,
                subtotal, shipping, tax, total)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (session_id, first_name, last_name, address, phone,
             subtotal, shipping, tax, total)
        )

        order_id = cursor.lastrowid

        for item in items:
            cursor.execute(
                """INSERT INTO order_items
                   (order_id, product_id, product_name, quantity, price, size, color)
                   VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                (
                    order_id,
                    item['product_id'],
                    item['name'],
                    item['qty'],
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

