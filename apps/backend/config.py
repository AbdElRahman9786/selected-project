import os

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'rootpassword')
DB_NAME = os.getenv('DB_NAME', 'shop_db')

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'change-me-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))

PAYMOB_API_KEY = os.getenv('PAYMOB_API_KEY', os.getenv('PAYMONY_API_KEY', ''))
PAYMOB_SECRET_KEY = os.getenv('PAYMOB_SECRET_KEY', '')
PAYMOB_PUBLIC_KEY = os.getenv('PAYMOB_PUBLIC_KEY', '')
PAYMOB_INTEGRATION_ID = os.getenv('PAYMOB_INTEGRATION_ID', '')
PAYMOB_IFRAME_ID = os.getenv('PAYMOB_IFRAME_ID', '')
PAYMOB_REDIRECT_URL = os.getenv(
	'PAYMOB_REDIRECT_URL',
	'http://localhost:8082/payment-success.html',
)
PAYMOB_CURRENCY = os.getenv('PAYMOB_CURRENCY', 'EGP')
PAYMOB_HMAC_SECRET = os.getenv('PAYMOB_HMAC_SECRET', os.getenv('PAYMOB_HMAC_KEY', ''))


ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', '')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', '')
ADMIN_FIRST_NAME = os.getenv('ADMIN_FIRST_NAME', 'Admin')
ADMIN_LAST_NAME = os.getenv('ADMIN_LAST_NAME', 'User')

ORDER_STATUSES = ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
