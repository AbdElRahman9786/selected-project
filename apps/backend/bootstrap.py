import logging

from auth import hash_password
from config import (
    ADMIN_EMAIL,
    ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME,
    ADMIN_PASSWORD,
)
from db import dict_cursor, get_db_connection

logger = logging.getLogger(__name__)


def _existing_columns(table_name):
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            '''
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = %s
            ''',
            (table_name,),
        )
        return {row['COLUMN_NAME'] for row in cursor.fetchall()}
    finally:
        cursor.close()
        conn.close()


def _apply_alter_table(table_name, statements):
    if not statements:
        return

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        for statement in statements:
            cursor.execute(f'ALTER TABLE {table_name} {statement}')
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def ensure_users_schema():
    """
    Bring older users tables up to the schema expected by the current auth code.
    """
    existing_columns = _existing_columns('users')

    migrations = []
    if 'first_name' not in existing_columns:
        migrations.append(
            "ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT '' AFTER id"
        )
    if 'last_name' not in existing_columns:
        migrations.append(
            "ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT '' AFTER first_name"
        )
    if 'password_hash' not in existing_columns:
        migrations.append(
            "ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL AFTER email"
        )
    if 'phone' not in existing_columns:
        migrations.append(
            "ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER password_hash"
        )
    if 'role' not in existing_columns:
        migrations.append(
            "ADD COLUMN role ENUM('customer','admin') DEFAULT 'customer' AFTER phone"
        )
    if 'username' in existing_columns:
        migrations.append(
            "MODIFY COLUMN username VARCHAR(50) NOT NULL DEFAULT ''"
        )

    _apply_alter_table('users', migrations)


def ensure_products_schema():
    existing_columns = _existing_columns('products')

    migrations = []
    if 'category' not in existing_columns:
        migrations.append(
            "ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT '' AFTER name"
        )
    if 'old_price' not in existing_columns:
        migrations.append(
            "ADD COLUMN old_price DECIMAL(10,2) DEFAULT NULL AFTER price"
        )
    if 'image' not in existing_columns:
        migrations.append(
            "ADD COLUMN image VARCHAR(500) DEFAULT NULL AFTER old_price"
        )
    if 'images' not in existing_columns:
        migrations.append(
            "ADD COLUMN images JSON DEFAULT NULL AFTER image"
        )
    if 'badge' not in existing_columns:
        migrations.append(
            "ADD COLUMN badge VARCHAR(20) DEFAULT NULL AFTER images"
        )
    if 'badge_text' not in existing_columns:
        migrations.append(
            "ADD COLUMN badge_text VARCHAR(20) DEFAULT NULL AFTER badge"
        )
    if 'rating' not in existing_columns:
        migrations.append(
            "ADD COLUMN rating DECIMAL(3,1) DEFAULT 0 AFTER badge_text"
        )
    if 'reviews' not in existing_columns:
        migrations.append(
            "ADD COLUMN reviews INT DEFAULT 0 AFTER rating"
        )
    if 'sizes' not in existing_columns:
        migrations.append(
            "ADD COLUMN sizes JSON DEFAULT NULL AFTER description"
        )
    if 'colors' not in existing_columns:
        migrations.append(
            "ADD COLUMN colors JSON DEFAULT NULL AFTER sizes"
        )
    if 'color_names' not in existing_columns:
        migrations.append(
            "ADD COLUMN color_names JSON DEFAULT NULL AFTER colors"
        )
    if 'in_stock' not in existing_columns:
        migrations.append(
            "ADD COLUMN in_stock BOOLEAN DEFAULT TRUE AFTER color_names"
        )
    if 'is_new' not in existing_columns:
        migrations.append(
            "ADD COLUMN is_new BOOLEAN DEFAULT FALSE AFTER in_stock"
        )
    if 'featured' not in existing_columns:
        migrations.append(
            "ADD COLUMN featured BOOLEAN DEFAULT FALSE AFTER is_new"
        )

    _apply_alter_table('products', migrations)

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        refreshed_columns = _existing_columns('products')
        if 'stock' in existing_columns and 'in_stock' in refreshed_columns:
            cursor.execute(
                'UPDATE products SET in_stock = (stock > 0) WHERE in_stock IS NULL'
            )
        if 'image_url' in existing_columns and 'image' in refreshed_columns:
            cursor.execute(
                'UPDATE products SET image = image_url WHERE (image IS NULL OR image = "") AND image_url IS NOT NULL'
            )
        if 'category_id' in existing_columns and 'category' in refreshed_columns:
            cursor.execute(
                "UPDATE products SET category = COALESCE(NULLIF(category, ''), 'uncategorized') WHERE category IS NULL OR category = ''"
            )
        if 'featured' in refreshed_columns:
            cursor.execute('UPDATE products SET featured = COALESCE(featured, FALSE)')
        if 'is_new' in refreshed_columns:
            cursor.execute('UPDATE products SET is_new = COALESCE(is_new, FALSE)')
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def ensure_orders_schema():
    existing_columns = _existing_columns('orders')

    migrations = []
    if 'user_id' in existing_columns:
        migrations.append(
            "MODIFY COLUMN user_id INT DEFAULT NULL"
        )
    if 'session_id' not in existing_columns:
        migrations.append(
            "ADD COLUMN session_id VARCHAR(100) DEFAULT NULL AFTER user_id"
        )
    if 'first_name' not in existing_columns:
        migrations.append(
            "ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT '' AFTER session_id"
        )
    if 'last_name' not in existing_columns:
        migrations.append(
            "ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT '' AFTER first_name"
        )
    if 'address' not in existing_columns:
        migrations.append(
            "ADD COLUMN address TEXT NULL AFTER last_name"
        )
    if 'phone' not in existing_columns:
        migrations.append(
            "ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER address"
        )
    if 'subtotal' not in existing_columns:
        migrations.append(
            "ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0 AFTER phone"
        )
    if 'shipping' not in existing_columns:
        migrations.append(
            "ADD COLUMN shipping DECIMAL(10,2) DEFAULT 0 AFTER subtotal"
        )
    if 'tax' not in existing_columns:
        migrations.append(
            "ADD COLUMN tax DECIMAL(10,2) DEFAULT 0 AFTER shipping"
        )
    if 'total' not in existing_columns:
        migrations.append(
            "ADD COLUMN total DECIMAL(10,2) DEFAULT 0 AFTER tax"
        )
    if 'coupon_code' not in existing_columns:
        migrations.append(
            "ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL AFTER total"
        )
    if 'discount' not in existing_columns:
        migrations.append(
            "ADD COLUMN discount DECIMAL(10,2) DEFAULT 0 AFTER coupon_code"
        )

    _apply_alter_table('orders', migrations)

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        refreshed_columns = _existing_columns('orders')
        if 'total_amount' in existing_columns and 'total' in refreshed_columns:
            cursor.execute(
                'UPDATE orders SET total = COALESCE(total, total_amount), subtotal = COALESCE(subtotal, total_amount)'
            )
        if 'shipping_address' in existing_columns and 'address' in refreshed_columns:
            cursor.execute(
                'UPDATE orders SET address = COALESCE(address, shipping_address)'
            )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def ensure_order_items_schema():
    existing_columns = _existing_columns('order_items')

    migrations = []
    if 'product_name' not in existing_columns:
        migrations.append(
            "ADD COLUMN product_name VARCHAR(255) NOT NULL DEFAULT '' AFTER product_id"
        )
    if 'price' not in existing_columns:
        migrations.append(
            "ADD COLUMN price DECIMAL(10,2) DEFAULT 0 AFTER quantity"
        )
    if 'size' not in existing_columns:
        migrations.append(
            "ADD COLUMN size VARCHAR(20) DEFAULT NULL AFTER price"
        )
    if 'color' not in existing_columns:
        migrations.append(
            "ADD COLUMN color VARCHAR(30) DEFAULT NULL AFTER size"
        )

    _apply_alter_table('order_items', migrations)

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        refreshed_columns = _existing_columns('order_items')
        if 'price_at_purchase' in existing_columns and 'price' in refreshed_columns:
            cursor.execute(
                'UPDATE order_items SET price = COALESCE(price, price_at_purchase)'
            )
        if 'product_name' in refreshed_columns:
            cursor.execute(
                '''
                UPDATE order_items oi
                JOIN products p ON p.id = oi.product_id
                SET oi.product_name = COALESCE(NULLIF(oi.product_name, ''), p.name)
                '''
            )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def ensure_cart_items_schema():
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute("SHOW TABLES LIKE 'cart_items'")
        if cursor.fetchone():
            return

        cursor.execute(
            '''
            CREATE TABLE cart_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                session_id VARCHAR(100) NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                size VARCHAR(20) DEFAULT NULL,
                color VARCHAR(30) DEFAULT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
            '''
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def ensure_support_tables():
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS payments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL,
                payment_provider ENUM('stripe','paypal','square','cash_on_delivery') NOT NULL,
                transaction_id VARCHAR(255) DEFAULT NULL,
                amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
            '''
        )
        cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            '''
        )
        cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS coupons (
                id INT PRIMARY KEY AUTO_INCREMENT,
                code VARCHAR(50) UNIQUE NOT NULL,
                discount_pct INT NOT NULL,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            '''
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def ensure_database_schema():
    ensure_users_schema()
    ensure_products_schema()
    ensure_orders_schema()
    ensure_order_items_schema()
    ensure_cart_items_schema()
    ensure_support_tables()


def ensure_users_schema():
    """
    Bring older users tables up to the schema expected by the current auth code.
    """
    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            '''
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
            '''
        )
        existing_columns = {row['COLUMN_NAME'] for row in cursor.fetchall()}

        migrations = []
        if 'first_name' not in existing_columns:
            migrations.append(
                "ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT '' AFTER id"
            )
        if 'last_name' not in existing_columns:
            migrations.append(
                "ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT '' AFTER first_name"
            )
        if 'password_hash' not in existing_columns:
            migrations.append(
                "ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL AFTER email"
            )
        if 'phone' not in existing_columns:
            migrations.append(
                "ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER password_hash"
            )
        if 'role' not in existing_columns:
            migrations.append(
                "ADD COLUMN role ENUM('customer','admin') DEFAULT 'customer' AFTER phone"
            )

        if 'username' in existing_columns:
            migrations.append(
                "MODIFY COLUMN username VARCHAR(50) NOT NULL DEFAULT ''"
            )

        for statement in migrations:
            cursor.execute(f'ALTER TABLE users {statement}')

        if migrations:
            conn.commit()
            logger.info('Users table schema synchronized for auth compatibility.')
    finally:
        cursor.close()
        conn.close()


def ensure_admin_user():
    """
    Create the first admin user when ADMIN_EMAIL and ADMIN_PASSWORD are set
    and no admin account exists yet.
    """
    ensure_database_schema()

    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        logger.info(
            'Admin bootstrap skipped: set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin.'
        )
        return

    conn = get_db_connection()
    cursor = dict_cursor(conn)
    try:
        cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
        if cursor.fetchone():
            logger.info('Admin bootstrap skipped: an admin user already exists.')
            return

        password_hash = hash_password(ADMIN_PASSWORD)
        cursor.execute(
            '''
            INSERT INTO users (username, first_name, last_name, email, password_hash, role)
            VALUES (%s, %s, %s, %s, %s, 'admin')
            ''',
            (
                ADMIN_EMAIL.split('@')[0].strip().lower() or 'admin',
                ADMIN_FIRST_NAME,
                ADMIN_LAST_NAME,
                ADMIN_EMAIL.lower().strip(),
                password_hash,
            ),
        )
        conn.commit()
        logger.info('Admin bootstrap complete: created admin user for %s', ADMIN_EMAIL)
    except Exception:
        conn.rollback()
        logger.exception('Admin bootstrap failed.')
    finally:
        cursor.close()
        conn.close()
