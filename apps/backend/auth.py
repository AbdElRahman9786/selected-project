from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from config import JWT_ALGORITHM, JWT_EXPIRATION_HOURS, JWT_SECRET_KEY
from db import dict_cursor, get_db_connection


def hash_password(password):
    return generate_password_hash(password)


def verify_password(password_hash, password):
    return check_password_hash(password_hash, password)


def create_access_token(user):
    now = datetime.now(timezone.utc)
    payload = {
        'sub': user['id'],
        'email': user['email'],
        'role': user['role'],
        'iat': now,
        'exp': now + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token):
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])


def get_bearer_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    return auth_header[7:].strip() or None


def _unauthorized(message='Authentication required.'):
    return jsonify({'error': message}), 401


def _forbidden(message='Admin access required.'):
    return jsonify({'error': message}), 403


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_bearer_token()
        if not token:
            return _unauthorized('Missing or invalid Authorization header.')

        try:
            payload = decode_access_token(token)
        except jwt.ExpiredSignatureError:
            return _unauthorized('Token has expired.')
        except jwt.InvalidTokenError:
            return _unauthorized('Invalid token.')

        g.jwt_payload = payload
        g.current_user = {
            'id': payload.get('sub'),
            'email': payload.get('email'),
            'role': payload.get('role'),
        }
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user.get('role') != 'admin':
            return _forbidden()

        conn = get_db_connection()
        cursor = dict_cursor(conn)
        try:
            cursor.execute(
                'SELECT id, email, role FROM users WHERE id = %s',
                (g.current_user['id'],),
            )
            user = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

        if not user or user['role'] != 'admin':
            return _forbidden('Admin account is invalid or no longer active.')

        g.current_user = {
            'id': user['id'],
            'email': user['email'],
            'role': user['role'],
        }
        return f(*args, **kwargs)

    return decorated
