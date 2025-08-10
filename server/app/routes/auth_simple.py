from flask import jsonify, request
from . import api_bp
from flask_cors import cross_origin
import hashlib
from datetime import datetime

# Simple in-memory user storage
USERS_DB = []

def generate_simple_token(user_id, email):
    """Generate a simple token for demo purposes"""
    import time
    timestamp = str(int(time.time()))
    token_string = f"{user_id}:{email}:{timestamp}"
    return hashlib.md5(token_string.encode()).hexdigest()

@api_bp.post("/auth/simple/register")
@cross_origin()
def simple_register():
    """Simplified user registration endpoint"""
    try:
        data = request.get_json(force=True) or {}
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        first_name = data['first_name'].strip()
        last_name = data['last_name'].strip()
        user_type = data.get("user_type", "user")
        
        # Check if user already exists
        existing_user = next((u for u in USERS_DB if u['email'] == email), None)
        if existing_user:
            return jsonify({'message': 'Email already registered'}), 409
        
        # Create new user with simple password hash
        new_user = {
            "id": len(USERS_DB) + 1,
            "email": email,
            "password_hash": hashlib.sha256(password.encode()).hexdigest(),  # Simple hash
            "first_name": first_name,
            "last_name": last_name,
            "user_type": user_type,
            "email_verified": True,
            "phone_verified": False,
            "is_active": True,
            "is_suspended": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        USERS_DB.append(new_user)
        
        # Generate simple token
        token = generate_simple_token(new_user['id'], new_user['email'])
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': new_user['id'],
                'email': new_user['email'],
                'first_name': new_user['first_name'],
                'last_name': new_user['last_name'],
                'user_type': new_user['user_type']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Registration error: {str(e)}'}), 500

@api_bp.post("/auth/simple/login")
@cross_origin()
def simple_login():
    """Simplified user login endpoint"""
    try:
        data = request.get_json(force=True) or {}
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user by email
        user = next((u for u in USERS_DB if u['email'] == email), None)
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if user['password_hash'] != password_hash:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check if account is active
        if not user.get('is_active', True):
            return jsonify({'message': 'Account is suspended'}), 401
        
        # Update last login
        user['last_login'] = datetime.utcnow().isoformat()
        
        # Generate simple token
        token = generate_simple_token(user['id'], user['email'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'user_type': user['user_type']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Login error: {str(e)}'}), 500

@api_bp.get("/auth/simple/users")
@cross_origin()
def list_users():
    """List all users (for debugging)"""
    try:
        return jsonify({
            'total': len(USERS_DB),
            'users': [{
                'id': u['id'],
                'email': u['email'],
                'first_name': u['first_name'],
                'last_name': u['last_name'],
                'user_type': u['user_type'],
                'is_active': u['is_active']
            } for u in USERS_DB]
        })
    except Exception as e:
        return jsonify({'message': f'Error listing users: {str(e)}'}), 500

@api_bp.post("/auth/simple/create-admin")
@cross_origin()
def create_admin():
    """Create admin user directly"""
    try:
        data = request.get_json(force=True) or {}
        
        # Default admin credentials
        email = data.get('email', 'admin@ussd-credit.com')
        password = data.get('password', 'Admin123!')
        first_name = data.get('first_name', 'System')
        last_name = data.get('last_name', 'Administrator')
        
        # Check if admin already exists
        existing_admin = next((u for u in USERS_DB if u['user_type'] == 'admin'), None)
        if existing_admin:
            return jsonify({
                'message': 'Admin user already exists',
                'admin': {
                    'id': existing_admin['id'],
                    'email': existing_admin['email']
                }
            }), 200
        
        # Create admin user
        new_admin = {
            "id": len(USERS_DB) + 1,
            "email": email,
            "password_hash": hashlib.sha256(password.encode()).hexdigest(),
            "first_name": first_name,
            "last_name": last_name,
            "user_type": "admin",
            "email_verified": True,
            "phone_verified": False,
            "is_active": True,
            "is_suspended": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        USERS_DB.append(new_admin)
        
        return jsonify({
            'message': 'Admin user created successfully',
            'admin': {
                'id': new_admin['id'],
                'email': new_admin['email'],
                'first_name': new_admin['first_name'],
                'last_name': new_admin['last_name'],
                'user_type': new_admin['user_type']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Error creating admin: {str(e)}'}), 500
