from flask import jsonify

from auth import admin_required
from db import dict_cursor, get_db_connection
from routes.admin import admin_bp


@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def admin_dashboard():
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute('SELECT COUNT(*) AS count FROM users')
        total_users = cursor.fetchone()['count']

        cursor.execute('SELECT COUNT(*) AS count FROM products')
        total_products = cursor.fetchone()['count']

        cursor.execute('SELECT COUNT(*) AS count FROM orders')
        total_orders = cursor.fetchone()['count']

        cursor.execute(
            '''
            SELECT COALESCE(SUM(total), 0) AS revenue
            FROM orders
            WHERE status != 'cancelled'
            '''
        )
        total_revenue = cursor.fetchone()['revenue']
    finally:
        cursor.close()
        conn.close()

    return jsonify({
        'totalUsers': total_users,
        'totalProducts': total_products,
        'totalOrders': total_orders,
        'totalRevenue': float(total_revenue),
    }), 200
