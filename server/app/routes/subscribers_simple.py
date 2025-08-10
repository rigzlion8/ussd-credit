from flask import jsonify, request
from . import api_bp
from flask_cors import cross_origin
from datetime import datetime

# Simple in-memory subscribers storage
SUBSCRIBERS_DB = []

@api_bp.get("/subscribers")
@cross_origin()
def list_simple_subscribers():
    """List all subscribers"""
    try:
        return jsonify({
            'total': len(SUBSCRIBERS_DB),
            'subscribers': SUBSCRIBERS_DB
        })
    except Exception as e:
        return jsonify({'message': f'Error listing subscribers: {str(e)}'}), 500

@api_bp.post("/subscribers")
@cross_origin()
def create_simple_subscription():
    """Create a new subscription"""
    try:
        payload = request.get_json(force=True) or {}
        
        # Validate required fields
        required_fields = ['influencer_id', 'fan_phone', 'amount']
        for field in required_fields:
            if not payload.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Create new subscription
        new_subscription = {
            "id": len(SUBSCRIBERS_DB) + 1,
            "influencer_id": payload.get("influencer_id"),
            "fan_phone": payload.get("fan_phone"),
            "amount": float(payload.get("amount", 0)),
            "frequency": payload.get("frequency", "monthly"),
            "is_active": bool(payload.get("is_active", True)),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        SUBSCRIBERS_DB.append(new_subscription)
        
        return jsonify({
            'message': 'Subscription created successfully',
            'subscription': new_subscription
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Error creating subscription: {str(e)}'}), 500

@api_bp.get("/subscribers/<int:subscription_id>")
@cross_origin()
def get_simple_subscription(subscription_id):
    """Get a specific subscription by ID"""
    try:
        subscription = next((s for s in SUBSCRIBERS_DB if s['id'] == subscription_id), None)
        if not subscription:
            return jsonify({'message': 'Subscription not found'}), 404
        
        return jsonify(subscription)
        
    except Exception as e:
        return jsonify({'message': f'Error getting subscription: {str(e)}'}), 500

@api_bp.put("/subscribers/<int:subscription_id>")
@cross_origin()
def update_simple_subscription(subscription_id):
    """Update a subscription"""
    try:
        payload = request.get_json(force=True) or {}
        
        subscription = next((s for s in SUBSCRIBERS_DB if s['id'] == subscription_id), None)
        if not subscription:
            return jsonify({'message': 'Subscription not found'}), 404
        
        # Update fields
        if 'amount' in payload:
            subscription['amount'] = float(payload['amount'])
        if 'frequency' in payload:
            subscription['frequency'] = payload['frequency']
        if 'is_active' in payload:
            subscription['is_active'] = bool(payload['is_active'])
        
        subscription['updated_at'] = datetime.utcnow().isoformat()
        
        return jsonify({
            'message': 'Subscription updated successfully',
            'subscription': subscription
        })
        
    except Exception as e:
        return jsonify({'message': f'Error updating subscription: {str(e)}'}), 500

@api_bp.delete("/subscribers/<int:subscription_id>")
@cross_origin()
def delete_simple_subscription(subscription_id):
    """Delete a subscription"""
    try:
        subscription = next((s for s in SUBSCRIBERS_DB if s['id'] == subscription_id), None)
        if not subscription:
            return jsonify({'message': 'Subscription not found'}), 404
        
        SUBSCRIBERS_DB.remove(subscription)
        
        return jsonify({'message': 'Subscription deleted successfully'})
        
    except Exception as e:
        return jsonify({'message': f'Error deleting subscription: {str(e)}'}), 500

@api_bp.post("/subscribers/populate-demo")
@cross_origin()
def populate_demo_subscribers():
    """Demo endpoint to populate with sample subscribers (no auth required)"""
    # Sample subscriber data
    sample_subscribers = [
        {
            "influencer_id": 1,
            "fan_phone": "+254700000101",
            "amount": 100.0,
            "frequency": "monthly",
            "is_active": True
        },
        {
            "influencer_id": 1,
            "fan_phone": "+254700000102", 
            "amount": 150.0,
            "frequency": "weekly",
            "is_active": True
        },
        {
            "influencer_id": 2,
            "fan_phone": "+254700000103",
            "amount": 200.0,
            "frequency": "monthly",
            "is_active": True
        },
        {
            "influencer_id": 3,
            "fan_phone": "+254700000104",
            "amount": 75.0,
            "frequency": "weekly",
            "is_active": False
        }
    ]
    
    # Add each sample subscriber
    added_count = 0
    for subscriber_data in sample_subscribers:
        try:
            new_id = max(s["id"] for s in SUBSCRIBERS_DB) + 1 if SUBSCRIBERS_DB else 1
            new_subscriber = {
                "id": new_id,
                **subscriber_data,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            SUBSCRIBERS_DB.append(new_subscriber)
            added_count += 1
        except Exception as e:
            print(f"Error adding subscriber: {e}")
    
    return jsonify({
        "message": f"Successfully added {added_count} demo subscribers",
        "total_subscribers": len(SUBSCRIBERS_DB),
        "added_count": added_count
    })
