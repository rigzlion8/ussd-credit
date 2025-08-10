from flask import jsonify, request
from . import api_bp

# Import the shared data from admin_influencers
try:
    from .admin_influencers import INFLUENCERS_DB
except ImportError:
    # Fallback if admin_influencers is not available
    INFLUENCERS_DB = [
        {
            "id": 1,
            "name": "Test Influencer",
            "phone": "+254700000000",
            "received": 1000,
            "imageUrl": ""
        }
    ]

@api_bp.get("/influencers")
def list_influencers():
    """Public endpoint to list all influencers"""
    return jsonify(INFLUENCERS_DB)

@api_bp.post("/influencers")
def create_influencer():
    payload = request.get_json(force=True) or {}
    return jsonify({
        "id": 999,
        "name": payload.get("name", "New Influencer"),
        "phone": payload.get("phone", ""),
        "received": payload.get("received", 0),
        "imageUrl": payload.get("imageUrl", "")
    }), 201
