import logging
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import Blueprint, g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from config import JWT_ALGORITHM, JWT_EXPIRATION_HOURS, JWT_SECRET_KEY
from db import dict_cursor, get_db_connection

# إعداد الـ Logger لعرض الـ Logs في ترمينال Docker
logger = logging.getLogger(__name__)

# إنشاء Blueprint للـ Auth
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

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


# ═══════════════════════════════════════════════════════
#  AUTH ROUTES (Register, Login, Logout)
# ═══════════════════════════════════════════════════════

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    role = data.get('role', 'customer')  # الافتراضي customer لو متبعتش

    if not all([first_name, last_name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    if role not in ['customer', 'admin']:
        return jsonify({'error': 'Invalid role specified'}), 400

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        # التأكد إن الإيميل مش متكرر
        cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cursor.fetchone():
            logger.warning(f"❌ Register failed: Email {email} already exists.")
            return jsonify({'error': 'Email already registered'}), 400

        # تشفير الباسورد وحفظ اليوزر
        pw_hash = hash_password(password)
        cursor.execute(
            '''INSERT INTO users (first_name, last_name, email, password_hash, phone, role) 
               VALUES (%s, %s, %s, %s, %s, %s)''',
            (first_name, last_name, email, pw_hash, phone, role)
        )
        conn.commit()
        
        logger.info(f"✨ [REGISTER SUCCESS] New user registered: {email} as {role}")
        return jsonify({'message': 'User registered successfully!'}), 201

    except Exception as e:
        logger.error(f"💥 Database error during registration: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()

        if not user or not verify_password(user['password_hash'], password):
            logger.warning(f"⚠️ [LOGIN FAILED] Invalid login attempt for email: {email}")
            return jsonify({'error': 'Invalid email or password'}), 401

        # توليد التوكن
        token = create_access_token(user)

        logger.info(f"🔑 [LOGIN SUCCESS] User {email} logged in successfully. Role: {user['role']}")
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200

    except Exception as e:
        logger.error(f"💥 Database error during login: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    # بما إننا بنستخدم JWT، الـ Logout الأساسي بيحصل في الفرونت إند بمسح التوكن.
    # لكن بنسجل الأكشن هنا في الـ Terminal عشان نتابع خروج اليوزر.
    user_email = g.current_user.get('email')
    logger.info(f"🚪 [LOGOUT] User {user_email} requested logout (Token validated).")
    return jsonify({'message': 'Logged out successfully (Clear token from client)'}), 200