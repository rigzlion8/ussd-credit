import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from pathlib import Path

from .config import get_config
from .extensions import db, migrate, jwt, cors
from .routes import api_bp
from .routes.webhooks import webhooks_bp


def create_app() -> Flask:
    # Load env from server/.env when running locally
    env_path = Path(__file__).resolve().parents[1] / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
    app = Flask(__name__)
    # After loading .env, let Flask load config values from env via object
    app.config.from_object(get_config())
    # Ensure DATABASE_URL is honored even if set after import time
    if 'DATABASE_URL' in os.environ:
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": app.config.get("CORS_ALLOW_ORIGINS", "*")}})

    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(webhooks_bp, url_prefix="/webhooks")

    @app.get("/")
    def root():
        return jsonify({"service": "ussd-credit-api", "status": "ok"})

    @app.get("/health")
    def health():
        return jsonify({"status": "healthy"})

    return app


