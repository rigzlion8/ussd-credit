from flask import jsonify, request
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash
from datetime import datetime
import json
from pathlib import Path
from . import api_bp

# Initialize in-memory users database
def init_users_db():
    """Initialize the in-memory users database from db.json"""
    try:
        # Get the path to db.json (two levels up from server/app/routes)
        project_root = Path(__file__).resolve().parents[2]
        db_json_path = project_root / "db.json"
        
        if not db_json_path.exists():
            print("No db.json found for admin setup")
            return False
            
        with db_json_path.open() as f:
            data = json.load(f)
        
        # Initialize the in-memory database
        if not hasattr(api_bp, '_users_db'):
            api_bp._users_db = []
        
        # Clear existing data
        api_bp._users_db.clear()
        
        # Add users from db.json
        for user in data.get('users', []):
            # Create a user record with password hash
            # For now, use a default password: 'password123'
            # In production, you should set proper passwords
            user_record = {
                'id': user['id'],
                'email': user['email'],
                'phone': user.get('phone', ''),
                'username': user.get('username', ''),
                'user_type': user['user_type'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'avatar_url': user.get('avatar_url', ''),
                'email_verified': user.get('email_verified', False),
                'phone_verified': user.get('phone_verified', False),
                'is_active': user.get('is_active', True),
                'password_hash': generate_password_hash('password123'),  # Default password
                'last_login': user.get('last_login'),
                'created_at': user.get('created_at'),
                'updated_at': user.get('updated_at')
            }
            api_bp._users_db.append(user_record)
        
        print(f"Admin setup: Initialized {len(api_bp._users_db)} users")
        return True
        
    except Exception as e:
        print(f"Admin setup error: {e}")
        return False

@api_bp.post("/admin/setup")
@cross_origin()
def admin_setup():
    """Initialize the system with admin users and basic data"""
    try:
        success = init_users_db()
        if success:
            return jsonify({
                'message': 'Admin setup completed successfully',
                'users_initialized': len(api_bp._users_db) if hasattr(api_bp, '_users_db') else 0
            }), 200
        else:
            return jsonify({
                'message': 'Admin setup failed',
                'error': 'Could not initialize users database'
            }), 500
    except Exception as e:
        return jsonify({
            'message': 'Admin setup error',
            'error': str(e)
        }), 500

@api_bp.get("/admin/status")
@cross_origin()
def admin_status():
    """Get the current status of the admin setup"""
    try:
        has_users_db = hasattr(api_bp, '_users_db')
        user_count = len(api_bp._users_db) if has_users_db else 0
        
        return jsonify({
            'users_database_initialized': has_users_db,
            'user_count': user_count,
            'status': 'ready' if has_users_db and user_count > 0 else 'not_ready'
        }), 200
    except Exception as e:
        return jsonify({
            'message': 'Status check error',
            'error': str(e)
        }), 500

# Auto-initialize when the module is imported
init_users_db()
