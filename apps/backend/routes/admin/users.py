from flask import g, jsonify, request

from auth import admin_required
from db import dict_cursor, get_db_connection, serialize_row, serialize_rows
from routes.admin import admin_bp

USER_FIELDS = ('first_name', 'last_name', 'email', 'phone', 'role')
ALLOWED_ROLES = ('customer', 'admin')


def _public_user_fields():
    return 'id, first_name, last_name, email, phone, role, created_at'


@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            f'''
            SELECT {_public_user_fields()}
            FROM users
            ORDER BY created_at DESC
            '''
        )
        users = serialize_rows(cursor.fetchall())
    finally:
        cursor.close()
        conn.close()

    return jsonify({'users': users}), 200


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            f'''
            SELECT {_public_user_fields()}
            FROM users
            WHERE id = %s
            ''',
            (user_id,),
        )
        user = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not user:
        return jsonify({'error': 'User not found.'}), 404

    return jsonify({'user': serialize_row(user)}), 200


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    data = request.get_json(silent=True) or {}
    updates = {field: data[field] for field in USER_FIELDS if field in data}

    if not updates:
        return jsonify({'error': 'No valid fields provided for update.'}), 400

    if 'email' in updates:
        updates['email'] = updates['email'].strip().lower()
        if not updates['email']:
            return jsonify({'error': 'email cannot be empty.'}), 400

    if 'role' in updates and updates['role'] not in ALLOWED_ROLES:
        return jsonify({'error': f"Invalid role. Allowed values: {', '.join(ALLOWED_ROLES)}."}), 400

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute('SELECT id, role FROM users WHERE id = %s', (user_id,))
        existing = cursor.fetchone()
        if not existing:
            return jsonify({'error': 'User not found.'}), 404

        if user_id == g.current_user['id'] and updates.get('role') and updates['role'] != 'admin':
            return jsonify({'error': 'You cannot remove your own admin role.'}), 400

        set_parts = [f'{field} = %s' for field in updates]
        values = list(updates.values()) + [user_id]
        cursor.execute(
            f"UPDATE users SET {', '.join(set_parts)} WHERE id = %s",
            tuple(values),
        )
        conn.commit()

        cursor.execute(
            f'''
            SELECT {_public_user_fields()}
            FROM users
            WHERE id = %s
            ''',
            (user_id,),
        )
        user = cursor.fetchone()
    except Exception as exc:
        conn.rollback()
        if getattr(exc, 'errno', None) == 1062:
            return jsonify({'error': 'Email already exists.'}), 409
        return jsonify({'error': str(exc)}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({'user': serialize_row(user)}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    if user_id == g.current_user['id']:
        return jsonify({'error': 'You cannot delete your own admin account.'}), 400

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'User not found.'}), 404

        cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return jsonify({'message': 'User deleted successfully.'}), 200
