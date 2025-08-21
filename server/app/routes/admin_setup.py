from flask import jsonify, request
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash
from datetime import datetime
from . import api_bp

# Try to import mongo_db, but don't fail if it's not available
try:
    from ..extensions import mongo_db
except ImportError:
    mongo_db = None

def init_users_db():
    """Initialize the users database in MongoDB with default admin user"""
    try:
        if mongo_db is None:
            print("MongoDB not available for admin setup")
            return False
        
        # Check if users collection exists and has data
        users_collection = mongo_db.get_collection("users")
        
        # Check if admin user already exists
        existing_admin = users_collection.find_one({"email": "admin@ussd.com"})
        if existing_admin:
            print("Admin user already exists in MongoDB")
            return True
        
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
            'last_login': datetime.utcnow(),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert admin user
        result = users_collection.insert_one(admin_user)
        admin_user['_id'] = str(result.inserted_id)
        
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
                'last_login': datetime.utcnow(),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
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
                'last_login': datetime.utcnow(),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
        ]
        
        # Insert test users
        for user in test_users:
            result = users_collection.insert_one(user)
            user['_id'] = str(result.inserted_id)
        
        print(f"Admin setup: Created {len(test_users) + 1} users in MongoDB")
        return True
        
    except Exception as e:
        print(f"Admin setup error: {e}")
        return False

@api_bp.post("/admin/setup")
@cross_origin()
def admin_setup():
    """Initialize the system with admin users and basic data in MongoDB"""
    try:
        success = init_users_db()
        if success:
            return jsonify({
                'message': 'Admin setup completed successfully',
                'database': 'MongoDB',
                'users_created': 3  # admin + 2 test users
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
        if mongo_db is None:
            return jsonify({
                'users_database_initialized': False,
                'user_count': 0,
                'status': 'mongodb_not_available',
                'message': 'MongoDB connection not available'
            }), 200
        
        users_collection = mongo_db.get_collection("users")
        user_count = users_collection.count_documents({})
        
        # Check if admin user exists
        admin_exists = users_collection.find_one({"user_type": "admin"}) is not None
        
        return jsonify({
            'users_database_initialized': True,
            'user_count': user_count,
            'admin_exists': admin_exists,
            'status': 'ready' if admin_exists else 'not_ready',
            'database': 'MongoDB'
        }), 200
    except Exception as e:
        return jsonify({
            'message': 'Status check error',
            'error': str(e)
        }), 500

# Auto-initialize when the module is imported (only if MongoDB is available)
if mongo_db is not None:
    init_users_db()
