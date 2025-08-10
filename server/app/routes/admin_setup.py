from flask import jsonify, request
from . import api_bp
from werkzeug.security import generate_password_hash
from datetime import datetime

# This is a special setup endpoint - in production, you'd want to secure this
# or remove it entirely after initial setup

@api_bp.post("/admin/setup")
def setup_admin():
    """
    Special endpoint to create the first admin user.
    This should be disabled in production after initial setup.
    """
    data = request.get_json(force=True) or {}
    
    # Validate required fields
    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    first_name = data['first_name'].strip()
    last_name = data['last_name'].strip()
    
    # Import the shared database
    try:
        from .admin_influencers import INFLUENCERS_DB
        # We'll use a simple in-memory users collection for now
        if not hasattr(api_bp, '_users_db'):
            api_bp._users_db = []
        
        # Check if user already exists
        existing_user = next((u for u in api_bp._users_db if u['email'] == email), None)
        if existing_user:
            return jsonify({'error': 'User already exists'}), 409
        
        # Create new admin user
        new_user = {
            "id": len(api_bp._users_db) + 1,
            "email": email,
            "password_hash": generate_password_hash(password),
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
        
        api_bp._users_db.append(new_user)
        
        return jsonify({
            'message': 'Admin user created successfully',
            'user': {
                'id': new_user['id'],
                'email': new_user['email'],
                'first_name': new_user['first_name'],
                'last_name': new_user['last_name'],
                'user_type': new_user['user_type']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to create admin user: {str(e)}'}), 500

@api_bp.post("/admin/setup/login")
def setup_admin_login():
    """
    Special login endpoint for the setup admin user.
    """
    data = request.get_json(force=True) or {}
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    
    try:
        # Check if we have the users database
        if not hasattr(api_bp, '_users_db'):
            return jsonify({'error': 'No users database found'}), 500
        
        # Find user by email
        user = next((u for u in api_bp._users_db if u['email'] == email), None)
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password
        from werkzeug.security import check_password_hash
        if not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if account is active
        if not user.get('is_active', True):
            return jsonify({'error': 'Account is suspended'}), 401
        
        # Generate a simple token (in production, use proper JWT)
        import hashlib
        token = hashlib.md5(f"{user['email']}{datetime.utcnow().isoformat()}".encode()).hexdigest()
        
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
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@api_bp.get("/admin/setup/status")
def setup_status():
    """
    Check the status of admin setup.
    """
    try:
        if not hasattr(api_bp, '_users_db'):
            return jsonify({
                'status': 'not_initialized',
                'admin_users': 0,
                'message': 'No admin users database found'
            })
        
        admin_users = [u for u in api_bp._users_db if u.get('user_type') == 'admin']
        
        return jsonify({
            'status': 'initialized',
            'admin_users': len(admin_users),
            'total_users': len(api_bp._users_db),
            'admin_emails': [u['email'] for u in admin_users]
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500
