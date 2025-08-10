from flask import jsonify, request, current_app, url_for, redirect
from flask_cors import cross_origin
from functools import wraps
import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import requests
# Try to import mongo_db, but don't fail if it's not available
try:
    from ..extensions import mongo_db
except ImportError:
    mongo_db = None
from ..models.user import User, UserType
from . import api_bp

# JWT token decorator for protected routes
def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Verify token
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user_id = payload['user_id']
            
            # Get user from database
            if mongo_db is not None:
                user_doc = mongo_db.get_collection("users").find_one({"id": current_user_id})
                if not user_doc:
                    return jsonify({'message': 'User not found'}), 401
                current_user = user_doc
            else:
                # Fallback to SQLAlchemy
                current_user = User.query.get(current_user_id)
                if not current_user:
                    return jsonify({'message': 'User not found'}), 401
                current_user = current_user.to_dict()
            
            # Check if user is active
            if not current_user.get('is_active', True):
                return jsonify({'message': 'Account is suspended'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated_function

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        @jwt_required
        def check_admin(current_user, *args, **kwargs):
            if current_user.get('user_type') != 'admin':
                return jsonify({'message': 'Admin access required'}), 403
            return f(current_user, *args, **kwargs)
        
        return check_admin(*args, **kwargs)
    
    return decorated_function

@api_bp.post("/auth/register")
@cross_origin()
def register():
    """User registration endpoint"""
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
    
    # Check if user already exists
    if mongo_db is not None:
        existing_user = mongo_db.get_collection("users").find_one({"email": email})
        if existing_user:
            return jsonify({'message': 'Email already registered'}), 409
        
        # Create new user
        user_doc = {
            "id": mongo_db.get_collection("users").count_documents({}) + 1,
            "email": email,
            "password_hash": generate_password_hash(password),
            "first_name": first_name,
            "last_name": last_name,
            "user_type": data.get("user_type", "user"),  # Allow custom user type
            "email_verified": False,
            "phone_verified": False,
            "is_active": True,
            "is_suspended": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = mongo_db.get_collection("users").insert_one(user_doc)
        user_doc['_id'] = str(result.inserted_id)
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_doc['id'],
            'user_type': user_doc['user_type'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user_doc['id'],
                'email': user_doc['email'],
                'first_name': user_doc['first_name'],
                'last_name': user_doc['last_name'],
                'user_type': user_doc['user_type']
            }
        }), 201
    
    # Fallback to SQLAlchemy (not implemented for this POC)
    return jsonify({'message': 'Registration not available'}), 500

@api_bp.post("/auth/login")
@cross_origin()
def login():
    """User login endpoint"""
    data = request.get_json(force=True) or {}
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    
    if mongo_db is not None:
        # Find user by email
        user_doc = mongo_db.get_collection("users").find_one({"email": email})
        if not user_doc:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check password
        if not check_password_hash(user_doc['password_hash'], password):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check if account is active
        if not user_doc.get('is_active', True):
            return jsonify({'message': 'Account is suspended'}), 401
        
        # Update last login
        mongo_db.get_collection("users").update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_doc['id'],
            'user_type': user_doc['user_type'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user_doc['id'],
                'email': user_doc['email'],
                'first_name': user_doc['first_name'],
                'last_name': user_doc['last_name'],
                'user_type': user_doc['user_type'],
                'avatar_url': user_doc.get('avatar_url')
            }
        }), 200
    
    return jsonify({'message': 'Login not available'}), 500

@api_bp.post("/auth/google")
@cross_origin()
def google_login():
    """Google OAuth login endpoint"""
    data = request.get_json(force=True) or {}
    
    if not data.get('id_token'):
        return jsonify({'message': 'Google ID token is required'}), 400
    
    id_token = data['id_token']
    
    try:
        # Verify Google ID token (in production, use Google's verification)
        # For now, we'll accept the token and extract user info
        # In production, verify with: https://oauth2.googleapis.com/tokeninfo?id_token={id_token}
        
        # Extract user info from token (this is simplified - in production verify with Google)
        user_info = data.get('user_info', {})
        
        if not user_info.get('email'):
            return jsonify({'message': 'Invalid Google token'}), 400
        
        email = user_info['email'].lower().strip()
        google_id = user_info.get('sub') or user_info.get('id')
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        avatar_url = user_info.get('picture', '')
        
        if mongo_db is not None:
            # Check if user exists
            existing_user = mongo_db.get_collection("users").find_one({"email": email})
            
            if existing_user:
                # Update existing user
                mongo_db.get_collection("users").update_one(
                    {"_id": existing_user["_id"]},
                    {
                        "$set": {
                            "google_id": google_id,
                            "avatar_url": avatar_url,
                            "last_login": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                user_doc = existing_user
            else:
                # Create new user
                user_doc = {
                    "id": mongo_db.get_collection("users").count_documents({}) + 1,
                    "email": email,
                    "google_id": google_id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "avatar_url": avatar_url,
                    "user_type": "user",
                    "email_verified": True,  # Google emails are verified
                    "phone_verified": False,
                    "is_active": True,
                    "is_suspended": False,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                result = mongo_db.get_collection("users").insert_one(user_doc)
                user_doc['_id'] = str(result.inserted_id)
            
            # Generate JWT token
            token = jwt.encode({
                'user_id': user_doc['id'],
                'user_type': user_doc['user_type'],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'message': 'Google login successful',
                'token': token,
                'user': {
                    'id': user_doc['id'],
                    'email': user_doc['email'],
                    'first_name': user_doc['first_name'],
                    'last_name': user_doc['last_name'],
                    'user_type': user_doc['user_type'],
                    'avatar_url': user_doc.get('avatar_url')
                }
            }), 200
    
    except Exception as e:
        return jsonify({'message': f'Google login failed: {str(e)}'}), 500
    
    return jsonify({'message': 'Google login not available'}), 500

@api_bp.get("/auth/profile")
@jwt_required
@cross_origin()
def get_profile(current_user):
    """Get current user profile"""
    return jsonify({
        'message': 'Profile retrieved successfully',
        'user': current_user
    }), 200

@api_bp.put("/auth/profile")
@jwt_required
@cross_origin()
def update_profile(current_user):
    """Update current user profile"""
    data = request.get_json(force=True) or {}
    
    if mongo_db is not None:
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'username', 'avatar_url']
        update_data = {}
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field].strip() if isinstance(data[field], str) else data[field]
        
        if update_data:
            update_data['updated_at'] = datetime.utcnow()
            
            mongo_db.get_collection("users").update_one(
                {"id": current_user['id']},
                {"$set": update_data}
            )
            
            # Get updated user
            updated_user = mongo_db.get_collection("users").find_one({"id": current_user['id']})
            
            return jsonify({
                'message': 'Profile updated successfully',
                'user': {
                    'id': updated_user['id'],
                    'email': updated_user['email'],
                    'first_name': updated_user['first_name'],
                    'last_name': updated_user['last_name'],
                    'user_type': updated_user['user_type'],
                    'avatar_url': updated_user.get('avatar_url'),
                    'username': updated_user.get('username')
                }
            }), 200
        
        return jsonify({'message': 'No fields to update'}), 400
    
    return jsonify({'message': 'Profile update not available'}), 500

@api_bp.post("/auth/change-password")
@jwt_required
@cross_origin()
def change_password(current_user):
    """Change user password"""
    data = request.get_json(force=True) or {}
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'message': 'Current and new password are required'}), 400
    
    current_password = data['current_password']
    new_password = data['new_password']
    
    if mongo_db is not None:
        # Verify current password
        user_doc = mongo_db.get_collection("users").find_one({"id": current_user['id']})
        if not user_doc or not check_password_hash(user_doc['password_hash'], current_password):
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        # Update password
        mongo_db.get_collection("users").update_one(
            {"id": current_user['id']},
            {
                "$set": {
                    "password_hash": generate_password_hash(new_password),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': 'Password changed successfully'}), 200
    
    return jsonify({'message': 'Password change not available'}), 500

@api_bp.post("/auth/refresh")
@cross_origin()
def refresh_token():
    """Refresh JWT token"""
    # This would typically validate a refresh token
    # For now, we'll require re-authentication
    return jsonify({'message': 'Please login again'}), 401

@api_bp.post("/auth/logout")
@jwt_required
@cross_origin()
def logout(current_user):
    """User logout endpoint"""
    # In a real application, you might blacklist the token
    # For now, just return success
    return jsonify({'message': 'Logged out successfully'}), 200


