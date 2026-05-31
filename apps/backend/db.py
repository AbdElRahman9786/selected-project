import mysql.connector
from mysql.connector import Error

from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME


def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
    )


def dict_cursor(conn):
    return conn.cursor(dictionary=True)


def serialize_row(row):
    if row is None:
        return None
    result = {}
    for key, value in row.items():
        if hasattr(value, 'isoformat'):
            result[key] = value.isoformat()
        elif value is not None and hasattr(value, '__float__'):
            result[key] = float(value)
        else:
            result[key] = value
    return result


def serialize_rows(rows):
    return [serialize_row(row) for row in rows]
