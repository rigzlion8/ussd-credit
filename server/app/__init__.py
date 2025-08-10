import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from pathlib import Path

from .config import get_config
from .extensions import db, migrate, jwt, cors

# Load env from server/.env when running locally
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path, override=True)

def create_app() -> Flask:
    app = Flask(__name__)
    # After loading .env, let Flask load config values from env via object
    app.config.from_object(get_config())
    # Ensure env overrides are honored even if config module was imported earlier
    if 'DATABASE_URL' in os.environ:
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
    if 'MONGO_URI' in os.environ:
        app.config['MONGO_URI'] = os.environ['MONGO_URI']

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # Parse CORS origins from environment
    cors_origins = app.config.get("CORS_ALLOW_ORIGINS", "*")
    if cors_origins != "*":
        # Split comma-separated origins and strip whitespace
        cors_origins = [origin.strip() for origin in cors_origins.split(",")]
    
    cors.init_app(app, resources={r"/*": {"origins": cors_origins}})

    # Try to register blueprints if they exist
    try:
        from .routes import api_bp
        app.register_blueprint(api_bp, url_prefix="/api")
    except ImportError:
        print("DEBUG: api_bp not found, skipping registration")
    
    try:
        from .routes.webhooks import webhooks_bp
        app.register_blueprint(webhooks_bp, url_prefix="/webhooks")
    except ImportError:
        print("DEBUG: webhooks_bp not found, skipping registration")

    @app.route("/")
    def root():
        return jsonify({"service": "ussd-credit-api", "status": "ok"})

    @app.route("/health")
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'USSD Credit API is running'})
    
    return app


