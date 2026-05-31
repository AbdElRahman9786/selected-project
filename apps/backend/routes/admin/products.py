import json

from flask import jsonify, request
from mysql.connector.errors import IntegrityError

from auth import admin_required
from db import dict_cursor, get_db_connection, serialize_row, serialize_rows
from routes.admin import admin_bp

_PRODUCT_COLUMNS = '''
    id, name, category, price, old_price, image, images, badge, badge_text,
    rating, reviews, description, sizes, colors, color_names,
    in_stock, is_new, featured, created_at
'''


def _product_payload(data, partial=False):
    fields = {
        'name': data.get('name'),
        'category': data.get('category'),
        'price': data.get('price'),
        'old_price': data.get('old_price'),
        'image': data.get('image'),
        'description': data.get('description'),
        'in_stock': data.get('in_stock'),
        'featured': data.get('featured'),
    }

    if partial:
        return {key: value for key, value in fields.items() if key in data}

    return fields


def _validate_product_fields(payload, require_all=False):
    errors = []

    if require_all or 'name' in payload:
        if not payload.get('name'):
            errors.append('name is required.')

    if require_all or 'category' in payload:
        if not payload.get('category'):
            errors.append('category is required.')

    if require_all or 'price' in payload:
        price = payload.get('price')
        if price is None:
            errors.append('price is required.')
        else:
            try:
                if float(price) < 0:
                    errors.append('price must be zero or greater.')
            except (TypeError, ValueError):
                errors.append('price must be a valid number.')

    return errors


def _normalize_product_row(row):
    data = serialize_row(row)
    if data.get('in_stock') is not None:
        data['in_stock'] = bool(data['in_stock'])
    if data.get('is_new') is not None:
        data['is_new'] = bool(data['is_new'])
    if data.get('featured') is not None:
        data['featured'] = bool(data['featured'])
    return data


@admin_bp.route('/products', methods=['GET'])
@admin_required
def list_products():
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            f'''
            SELECT {_PRODUCT_COLUMNS}
            FROM products
            ORDER BY created_at DESC
            '''
        )
        products = [_normalize_product_row(r) for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

    return jsonify({'products': products}), 200


@admin_bp.route('/products/<int:product_id>', methods=['GET'])
@admin_required
def get_product(product_id):
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            f'''
            SELECT {_PRODUCT_COLUMNS}
            FROM products
            WHERE id = %s
            ''',
            (product_id,),
        )
        product = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    return jsonify({'product': _normalize_product_row(product)}), 200


@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    data = request.get_json(silent=True) or {}
    payload = _product_payload(data)
    errors = _validate_product_fields(payload, require_all=True)
    if errors:
        return jsonify({'error': ' '.join(errors)}), 400

    in_stock = payload.get('in_stock', True)
    if isinstance(in_stock, str):
        in_stock = in_stock.lower() in ('1', 'true', 'yes', 'on')

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            '''
            INSERT INTO products (
                name, category, price, old_price, image, description,
                in_stock, featured, images, sizes, colors, color_names
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''',
            (
                payload['name'],
                payload['category'],
                float(payload['price']),
                float(payload['old_price']) if payload.get('old_price') not in (None, '') else None,
                payload.get('image'),
                payload.get('description'),
                in_stock,
                bool(payload.get('featured', False)),
                json.dumps([payload.get('image')] if payload.get('image') else []),
                json.dumps([]),
                json.dumps(['#111111']),
                json.dumps(['Default']),
            ),
        )
        conn.commit()
        product_id = cursor.lastrowid

        cursor.execute(
            f'SELECT {_PRODUCT_COLUMNS} FROM products WHERE id = %s',
            (product_id,),
        )
        product = cursor.fetchone()
    except Exception as exc:
        conn.rollback()
        return jsonify({'error': str(exc)}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({'product': _normalize_product_row(product)}), 201


@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    data = request.get_json(silent=True) or {}
    payload = _product_payload(data, partial=True)

    if not payload:
        return jsonify({'error': 'No valid fields provided for update.'}), 400

    errors = _validate_product_fields(payload, require_all=False)
    if errors:
        return jsonify({'error': ' '.join(errors)}), 400

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute('SELECT id FROM products WHERE id = %s', (product_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Product not found.'}), 404

        set_parts = []
        values = []
        for field, value in payload.items():
            if field == 'price':
                value = float(value)
            elif field == 'old_price':
                value = float(value) if value not in (None, '') else None
            elif field == 'in_stock':
                if isinstance(value, str):
                    value = value.lower() in ('1', 'true', 'yes', 'on')
                value = bool(value)
            elif field == 'featured':
                value = bool(value)
            set_parts.append(f'{field} = %s')
            values.append(value)

        if 'image' in payload and payload['image']:
            set_parts.append('images = %s')
            values.append(json.dumps([payload['image']]))

        values.append(product_id)
        cursor.execute(
            f"UPDATE products SET {', '.join(set_parts)} WHERE id = %s",
            tuple(values),
        )
        conn.commit()

        cursor.execute(
            f'SELECT {_PRODUCT_COLUMNS} FROM products WHERE id = %s',
            (product_id,),
        )
        product = cursor.fetchone()
    except Exception as exc:
        conn.rollback()
        return jsonify({'error': str(exc)}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({'product': _normalize_product_row(product)}), 200


@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute('SELECT id FROM products WHERE id = %s', (product_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Product not found.'}), 404

        cursor.execute('DELETE FROM products WHERE id = %s', (product_id,))
        conn.commit()
    except IntegrityError:
        conn.rollback()
        return jsonify({
            'error': 'Product cannot be deleted because it is referenced by existing orders.'
        }), 409
    except Exception as exc:
        conn.rollback()
        return jsonify({'error': str(exc)}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({'message': 'Product deleted successfully.'}), 200
