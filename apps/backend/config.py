import os

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'rootpassword')
DB_NAME = os.getenv('DB_NAME', 'shop_db')

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'change-me-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))

ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', '')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', '')
ADMIN_FIRST_NAME = os.getenv('ADMIN_FIRST_NAME', 'Admin')
ADMIN_LAST_NAME = os.getenv('ADMIN_LAST_NAME', 'User')

ORDER_STATUSES = ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
