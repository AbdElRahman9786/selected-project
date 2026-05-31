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


def ensure_admin_user():
    """
    Create the first admin user when ADMIN_EMAIL and ADMIN_PASSWORD are set
    and no admin account exists yet.
    """
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
            INSERT INTO users (first_name, last_name, email, password_hash, role)
            VALUES (%s, %s, %s, %s, 'admin')
            ''',
            (
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
