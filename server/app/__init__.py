import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from pathlib import Path

from .config import get_config
from .extensions import db, migrate, jwt, cors
from . import extensions as _ext

# Optional MongoDB client for POC - initialize before routes
try:
    from pymongo import MongoClient
    from pymongo.uri_parser import parse_uri

    # Load env from server/.env when running locally
    env_path = Path(__file__).resolve().parents[1] / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
    
    uri = os.getenv("MONGO_URI")
    if uri:
        # Configure MongoDB client with better timeout settings
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=30000,  # 30 seconds
            connectTimeoutMS=20000,          # 20 seconds
            socketTimeoutMS=20000,           # 20 seconds
            maxPoolSize=10,
            retryWrites=True,
            retryReads=True
        )
        # ping with timeout
        try:
            client.admin.command("ping", serverSelectionTimeoutMS=10000)
        except Exception as ping_error:
            print(f"DEBUG: MongoDB ping failed: {ping_error}")
            # Continue anyway - the connection might still work for basic operations
        
        # expose client via extensions module so routes/seeder can use it
        _ext.mongo_client = client
        # determine db name: prefer URI path, then env MONGO_DB_NAME, then fallback
        db_name = None
        try:
            parsed = parse_uri(uri)
            db_name = parsed.get("database")
        except Exception:
            db_name = None
        if not db_name:
            db_name = os.getenv("MONGO_DB_NAME")
        if not db_name:
            # final fallback
            db_name = "ussd-auto"
        _ext.mongo_db = client[db_name]
        print(f"DEBUG: MongoDB initialized with database: {db_name}")
    else:
        print("DEBUG: No MONGO_URI found")
except Exception as e:
    print(f"DEBUG: MongoDB initialization failed: {e}")
    print("DEBUG: Continuing without MongoDB - some features may not work")
    _ext.mongo_client = None
    _ext.mongo_db = None

from .routes import api_bp
from .routes.webhooks import webhooks_bp


def create_app() -> Flask:
    # Load env from server/.env when running locally
    env_path = Path(__file__).resolve().parents[1] / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
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

    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(webhooks_bp, url_prefix="/webhooks")

    @app.get("/")
    def root():
        return jsonify({"service": "ussd-credit-api", "status": "ok"})

    @app.get("/health")
    def health():
        return jsonify({"status": "healthy"})

    return app


