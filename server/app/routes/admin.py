from flask import jsonify, request
from flask_cors import cross_origin
from datetime import datetime
from ..extensions import mongo_db
from .auth import admin_required
from . import api_bp

@api_bp.get("/admin/users")
@admin_required
@cross_origin()
def list_users(current_user):
    """List all users (admin only)"""
    if mongo_db:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        user_type = request.args.get('user_type')
        search = request.args.get('search', '').strip()
        
        # Build filter
        filter_query = {}
        if user_type:
            filter_query['user_type'] = user_type
        if search:
            filter_query['$or'] = [
                {'email': {'$regex': search, '$options': 'i'}},
                {'first_name': {'$regex': search, '$options': 'i'}},
                {'last_name': {'$regex': search, '$options': 'i'}},
                {'username': {'$regex': search, '$options': 'i'}}
            ]
        
        # Get total count
        total = mongo_db.get_collection("users").count_documents(filter_query)
        
        # Get paginated results
        skip = (page - 1) * per_page
        users = list(mongo_db.get_collection("users").find(
            filter_query,
            {'password_hash': 0}  # Exclude password hash
        ).skip(skip).limit(per_page).sort('created_at', -1))
        
        # Convert ObjectId to string for JSON serialization
        for user in users:
            if '_id' in user:
                user['_id'] = str(user['_id'])
            if 'created_at' in user:
                user['created_at'] = user['created_at'].isoformat()
            if 'updated_at' in user:
                user['updated_at'] = user['updated_at'].isoformat()
            if 'last_login' in user and user['last_login']:
                user['last_login'] = user['last_login'].isoformat()
        
        return jsonify({
            'message': 'Users retrieved successfully',
            'users': users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200
    
    return jsonify({'message': 'User management not available'}), 500

@api_bp.get("/admin/users/<int:user_id>")
@admin_required
@cross_origin()
def get_user(current_user, user_id):
    """Get specific user details (admin only)"""
    if mongo_db:
        user = mongo_db.get_collection("users").find_one(
            {"id": user_id},
            {'password_hash': 0}  # Exclude password hash
        )
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Convert ObjectId to string for JSON serialization
        if '_id' in user:
            user['_id'] = str(user['_id'])
        if 'created_at' in user:
            user['created_at'] = user['created_at'].isoformat()
        if 'updated_at' in user:
            user['updated_at'] = user['updated_at'].isoformat()
        if 'last_login' in user and user['last_login']:
            user['last_login'] = user['last_login'].isoformat()
        
        return jsonify({
            'message': 'User retrieved successfully',
            'user': user
        }), 200
    
    return jsonify({'message': 'User management not available'}), 500

@api_bp.put("/admin/users/<int:user_id>")
@admin_required
@cross_origin()
def update_user(current_user, user_id):
    """Update user details (admin only)"""
    data = request.get_json(force=True) or {}
    
    if mongo_db:
        # Check if user exists
        existing_user = mongo_db.get_collection("users").find_one({"id": user_id})
        if not existing_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Update allowed fields
        allowed_fields = [
            'first_name', 'last_name', 'username', 'avatar_url',
            'user_type', 'is_active', 'is_suspended', 'email_verified', 'phone_verified'
        ]
        update_data = {}
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if update_data:
            update_data['updated_at'] = datetime.utcnow()
            
            mongo_db.get_collection("users").update_one(
                {"id": user_id},
                {"$set": update_data}
            )
            
            return jsonify({'message': 'User updated successfully'}), 200
        
        return jsonify({'message': 'No fields to update'}), 400
    
    return jsonify({'message': 'User management not available'}), 500

@api_bp.delete("/admin/users/<int:user_id>")
@admin_required
@cross_origin()
def delete_user(current_user, user_id):
    """Delete user (admin only)"""
    if mongo_db:
        # Check if user exists
        existing_user = mongo_db.get_collection("users").find_one({"id": user_id})
        if not existing_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Prevent admin from deleting themselves
        if user_id == current_user['id']:
            return jsonify({'message': 'Cannot delete your own account'}), 400
        
        # Soft delete - mark as suspended instead of hard delete
        mongo_db.get_collection("users").update_one(
            {"id": user_id},
            {
                "$set": {
                    "is_active": False,
                    "is_suspended": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': 'User suspended successfully'}), 200
    
    return jsonify({'message': 'User management not available'}), 500

@api_bp.post("/admin/users/<int:user_id>/activate")
@admin_required
@cross_origin()
def activate_user(current_user, user_id):
    """Activate suspended user (admin only)"""
    if mongo_db:
        # Check if user exists
        existing_user = mongo_db.get_collection("users").find_one({"id": user_id})
        if not existing_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Activate user
        mongo_db.get_collection("users").update_one(
            {"id": user_id},
            {
                "$set": {
                    "is_active": True,
                    "is_suspended": False,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': 'User activated successfully'}), 200
    
    return jsonify({'message': 'User management not available'}), 500

@api_bp.post("/admin/users/<int:user_id>/upgrade")
@admin_required
@cross_origin()
def upgrade_user(current_user, user_id):
    """Upgrade user type (admin only)"""
    data = request.get_json(force=True) or {}
    new_user_type = data.get('user_type')
    
    if not new_user_type:
        return jsonify({'message': 'user_type is required'}), 400
    
    valid_types = ['guest', 'user', 'subscribed', 'admin']
    if new_user_type not in valid_types:
        return jsonify({'message': f'Invalid user type. Must be one of: {", ".join(valid_types)}'}), 400
    
    if mongo_db:
        # Check if user exists
        existing_user = mongo_db.get_collection("users").find_one({"id": user_id})
        if not existing_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Update user type
        mongo_db.get_collection("users").update_one(
            {"id": user_id},
            {
                "$set": {
                    "user_type": new_user_type,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': f'User upgraded to {new_user_type} successfully'}), 200
    
    return jsonify({'message': 'User management not available'}), 500

@api_bp.get("/admin/stats")
@admin_required
@cross_origin()
def get_admin_stats(current_user):
    """Get system statistics (admin only)"""
    if mongo_db:
        try:
            # User statistics
            total_users = mongo_db.get_collection("users").count_documents({})
            active_users = mongo_db.get_collection("users").count_documents({"is_active": True})
            suspended_users = mongo_db.get_collection("users").count_documents({"is_suspended": True})
            
            # User type breakdown
            user_types = {}
            for user_type in ['guest', 'user', 'subscribed', 'admin']:
                count = mongo_db.get_collection("users").count_documents({"user_type": user_type})
                user_types[user_type] = count
            
            # Recent activity
            recent_users = mongo_db.get_collection("users").count_documents({
                "created_at": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}
            })
            
            # Collection statistics
            total_influencers = mongo_db.get_collection("influencers").count_documents({})
            total_subscribers = mongo_db.get_collection("subscribers").count_documents({})
            
            stats = {
                'users': {
                    'total': total_users,
                    'active': active_users,
                    'suspended': suspended_users,
                    'by_type': user_types,
                    'recent_today': recent_users
                },
                'content': {
                    'influencers': total_influencers,
                    'subscribers': total_subscribers
                },
                'system': {
                    'database': 'MongoDB',
                    'timestamp': datetime.utcnow().isoformat()
                }
            }
            
            return jsonify({
                'message': 'Statistics retrieved successfully',
                'stats': stats
            }), 200
            
        except Exception as e:
            return jsonify({'message': f'Error retrieving statistics: {str(e)}'}), 500
    
    return jsonify({'message': 'Statistics not available'}), 500
