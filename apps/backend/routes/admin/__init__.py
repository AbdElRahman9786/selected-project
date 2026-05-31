from flask import Blueprint

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

from routes.admin import auth_routes, dashboard, orders, products, users  # noqa: E402, F401
