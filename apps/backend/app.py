import logging
import os
import time

from flask import Flask, jsonify
from flask_cors import CORS

from bootstrap import ensure_admin_user
from db import get_db_connection
from routes.admin import admin_bp
from routes.store_api import store_bp

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)
app.register_blueprint(store_bp)
app.register_blueprint(admin_bp)


def _wait_for_database(retries=30, delay=2):
    for attempt in range(1, retries + 1):
        try:
            conn = get_db_connection()
            conn.close()
            return True
        except Exception:
            logging.info('Waiting for database (%s/%s)...', attempt, retries)
            time.sleep(delay)
    return False


@app.route('/')
def index():
    return jsonify({'message': 'Aboss API is running!'})


@app.route('/api/health')
def health():
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as exc:
        return jsonify({'status': 'unhealthy', 'error': str(exc)}), 500


if __name__ == '__main__':
    if _wait_for_database():
        ensure_admin_user()
    else:
        logging.warning('Database not ready; admin bootstrap skipped.')
    debug_mode = os.getenv('FLASK_DEBUG', '0').lower() in ('1', 'true', 'yes')
    app.run(host='0.0.0.0', port=5000, debug=debug_mode, use_reloader=False)
