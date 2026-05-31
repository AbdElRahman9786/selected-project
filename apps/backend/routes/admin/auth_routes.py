from flask import jsonify, request

from auth import create_access_token, verify_password
from db import dict_cursor, get_db_connection
from routes.admin import admin_bp


@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            '''
            SELECT id, email, password_hash, role
            FROM users
            WHERE email = %s
            ''',
            (email,),
        )
        user = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not user or not verify_password(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    if user['role'] != 'admin':
        return jsonify({'error': 'Admin access required.'}), 403

    token = create_access_token(user)
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'role': user['role'],
        },
    }), 200
