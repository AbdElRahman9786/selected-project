from flask import jsonify, request

from auth import admin_required
from config import ORDER_STATUSES
from db import dict_cursor, get_db_connection, serialize_row, serialize_rows
from routes.admin import admin_bp


def _fetch_order_items(cursor, order_id):
    cursor.execute(
        '''
        SELECT
            oi.id,
            oi.order_id,
            oi.product_id,
            oi.product_name,
            oi.quantity,
            oi.price,
            oi.size,
            oi.color
        FROM order_items oi
        WHERE oi.order_id = %s
        ''',
        (order_id,),
    )
    return serialize_rows(cursor.fetchall())


def _order_select_sql():
    return '''
        SELECT
            o.id,
            o.user_id,
            o.session_id,
            o.first_name,
            o.last_name,
            o.address,
            o.phone,
            o.subtotal,
            o.shipping,
            o.tax,
            o.total,
            o.status,
            o.created_at,
            u.email AS user_email
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
    '''


@admin_bp.route('/orders', methods=['GET'])
@admin_required
def list_orders():
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            f'''
            {_order_select_sql()}
            ORDER BY o.created_at DESC
            '''
        )
        orders = serialize_rows(cursor.fetchall())
    finally:
        cursor.close()
        conn.close()

    return jsonify({'orders': orders}), 200


@admin_bp.route('/orders/<int:order_id>', methods=['GET'])
@admin_required
def get_order(order_id):
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            f'''
            {_order_select_sql()}
            WHERE o.id = %s
            ''',
            (order_id,),
        )
        order = cursor.fetchone()
        if not order:
            return jsonify({'error': 'Order not found.'}), 404

        items = _fetch_order_items(cursor, order_id)
    finally:
        cursor.close()
        conn.close()

    order_data = serialize_row(order)
    order_data['items'] = items
    return jsonify({'order': order_data}), 200


@admin_bp.route('/orders/<int:order_id>', methods=['PUT'])
@admin_required
def update_order(order_id):
    data = request.get_json(silent=True) or {}
    status = data.get('status')

    if not status:
        return jsonify({'error': 'status is required.'}), 400

    if status not in ORDER_STATUSES:
        return jsonify({
            'error': f"Invalid status. Allowed values: {', '.join(ORDER_STATUSES)}."
        }), 400

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute('SELECT id FROM orders WHERE id = %s', (order_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Order not found.'}), 404

        cursor.execute(
            'UPDATE orders SET status = %s WHERE id = %s',
            (status, order_id),
        )
        conn.commit()

        cursor.execute(
            f'''
            {_order_select_sql()}
            WHERE o.id = %s
            ''',
            (order_id,),
        )
        order = cursor.fetchone()
        items = _fetch_order_items(cursor, order_id)
    finally:
        cursor.close()
        conn.close()

    order_data = serialize_row(order)
    order_data['items'] = items
    return jsonify({'order': order_data}), 200
