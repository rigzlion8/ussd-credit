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

@api_bp.post("/influencers/populate-demo")
def populate_demo_influencers():
    """Demo endpoint to populate with sample influencers (no auth required)"""
    # Sample influencer data
    sample_influencers = [
        {
            "name": "Sarah Kimani",
            "phone": "+254700000001",
            "received": 2500,
            "imageUrl": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            "ussd_shortcode": "123"
        },
        {
            "name": "David Ochieng",
            "phone": "+254700000002",
            "received": 1800,
            "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            "ussd_shortcode": "124"
        },
        {
            "name": "Grace Wanjiku",
            "phone": "+254700000003",
            "received": 3200,
            "imageUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            "ussd_shortcode": "125"
        },
        {
            "name": "Michael Odhiambo",
            "phone": "+254700000004",
            "received": 1500,
            "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            "ussd_shortcode": "126"
        },
        {
            "name": "Faith Akinyi",
            "phone": "+254700000005",
            "received": 4100,
            "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
            "ussd_shortcode": "127"
        },
        {
            "name": "James Kiprop",
            "phone": "+254700000006",
            "received": 2800,
            "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            "ussd_shortcode": "128"
        },
        {
            "name": "Mercy Njeri",
            "phone": "+254700000007",
            "received": 3600,
            "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
            "ussd_shortcode": "129"
        }
    ]
    
    # Add each sample influencer to the shared database
    added_count = 0
    for influencer_data in sample_influencers:
        try:
            # Check if phone already exists
            if not any(inf["phone"] == influencer_data["phone"] for inf in INFLUENCERS_DB):
                new_id = max(inf["id"] for inf in INFLUENCERS_DB) + 1 if INFLUENCERS_DB else 1
                new_influencer = {
                    "id": new_id,
                    **influencer_data,
                    "created_at": "2025-08-10T20:00:00Z"
                }
                INFLUENCERS_DB.append(new_influencer)
                added_count += 1
        except Exception as e:
            print(f"Error adding {influencer_data['name']}: {e}")
    
    return jsonify({
        "message": f"Successfully added {added_count} demo influencers",
        "total_influencers": len(INFLUENCERS_DB),
        "added_count": added_count
    })
