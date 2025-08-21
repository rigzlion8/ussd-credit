import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from pathlib import Path

from .config import get_config
from .extensions import db, migrate, jwt, cors, init_mongodb

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
    
    # Initialize MongoDB
    init_mongodb(app)
    
    # Parse CORS origins from environment
    cors_origins = app.config.get("CORS_ALLOW_ORIGINS", "*")
    if cors_origins != "*":
        # Split comma-separated origins and strip whitespace
        cors_origins = [origin.strip() for origin in cors_origins.split(",")]
    
    cors.init_app(app, resources={r"/*": {"origins": cors_origins}})

    # Try to register blueprints if they exist
    print("DEBUG: Starting blueprint registration...")
    
    try:
        print("DEBUG: Attempting to import api_bp from .routes")
        from .routes import api_bp
        print("DEBUG: Successfully imported api_bp")
        print(f"DEBUG: api_bp type: {type(api_bp)}")
        print(f"DEBUG: api_bp name: {api_bp.name}")
        app.register_blueprint(api_bp, url_prefix="/api")
        print("DEBUG: Successfully registered api_bp")
    except ImportError as e:
        print(f"DEBUG: api_bp not found, skipping registration: {e}")
        print(f"DEBUG: ImportError details: {type(e).__name__}: {e}")
    except Exception as e:
        print(f"DEBUG: Error registering api_bp: {e}")
        print(f"DEBUG: Exception details: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    try:
        from .routes.webhooks import webhooks_bp
        print("DEBUG: Successfully imported webhooks_bp")
        app.register_blueprint(webhooks_bp, url_prefix="/webhooks")
        print("DEBUG: Successfully registered webhooks_bp")
    except ImportError as e:
        print(f"DEBUG: webhooks_bp not found, skipping registration: {e}")
    except Exception as e:
        print(f"DEBUG: Error registering webhooks_bp: {e}")

    @app.route("/")
    def root():
        return jsonify({"service": "ussd-credit-api", "status": "ok"})

    @app.route("/health")
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'USSD Credit API is running'})
    
    @app.route("/debug/routes")
    def debug_routes():
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'rule': str(rule)
            })
        return jsonify({
            'total_routes': len(routes),
            'routes': routes
        })
    
    # Force Railway redeploy - MongoDB import fixes applied
    return app


