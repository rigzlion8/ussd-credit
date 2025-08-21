from flask import jsonify, request
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash
from datetime import datetime
import json
from pathlib import Path
from . import api_bp

# Initialize in-memory users database
def init_users_db():
    """Initialize the in-memory users database with default admin user"""
    try:
        # Initialize the in-memory database
        if not hasattr(api_bp, '_users_db'):
            api_bp._users_db = []
        
        # Clear existing data
        api_bp._users_db.clear()
        
        # Create default admin user
        admin_user = {
            'id': 1,
            'email': 'admin@ussd.com',
            'phone': '+254700000001',
            'username': 'admin',
            'user_type': 'admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'avatar_url': 'https://ui-avatars.com/api/?name=Admin+User&background=8B5CF6&color=fff',
            'email_verified': True,
            'phone_verified': True,
            'is_active': True,
            'password_hash': generate_password_hash('password123'),  # Default password
            'last_login': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        api_bp._users_db.append(admin_user)
        
        # Create additional test users
        test_users = [
            {
                'id': 2,
                'email': 'john@example.com',
                'phone': '+254700000002',
                'username': 'john_doe',
                'user_type': 'subscribed',
                'first_name': 'John',
                'last_name': 'Doe',
                'avatar_url': 'https://ui-avatars.com/api/?name=John+Doe&background=10B981&color=fff',
                'email_verified': True,
                'phone_verified': True,
                'is_active': True,
                'password_hash': generate_password_hash('password123'),
                'last_login': datetime.utcnow().isoformat(),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            },
            {
                'id': 3,
                'email': 'jane@example.com',
                'phone': '+254700000003',
                'username': 'jane_smith',
                'user_type': 'user',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'avatar_url': 'https://ui-avatars.com/api/?name=Jane+Smith&background=3B82F6&color=fff',
                'email_verified': True,
                'phone_verified': False,
                'is_active': True,
                'password_hash': generate_password_hash('password123'),
                'last_login': datetime.utcnow().isoformat(),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
        ]
        
        for user in test_users:
            api_bp._users_db.append(user)
        
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
