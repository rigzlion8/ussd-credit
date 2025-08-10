from flask import jsonify, request
from . import api_bp
from .auth import admin_required

# In-memory storage for demo purposes (replace with database later)
INFLUENCERS_DB = [
    {
        "id": 1,
        "name": "Test Influencer",
        "phone": "+254700000000",
        "received": 1000,
        "imageUrl": ""
    }
]

@api_bp.get("/admin/influencers")
@admin_required
def admin_list_influencers():
    """Admin endpoint to list all influencers with full details"""
    return jsonify({
        "total": len(INFLUENCERS_DB),
        "influencers": INFLUENCERS_DB
    })

@api_bp.post("/admin/influencers")
@admin_required
def admin_create_influencer():
    """Admin endpoint to create a new influencer"""
    payload = request.get_json(force=True) or {}
    
    # Validation
    required_fields = ["name", "phone"]
    for field in required_fields:
        if not payload.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Check if phone already exists
    if any(inf["phone"] == payload["phone"] for inf in INFLUENCERS_DB):
        return jsonify({"error": "Phone number already exists"}), 409
    
    # Create new influencer
    new_id = max(inf["id"] for inf in INFLUENCERS_DB) + 1 if INFLUENCERS_DB else 1
    new_influencer = {
        "id": new_id,
        "name": payload["name"],
        "phone": payload["phone"],
        "received": payload.get("received", 0),
        "imageUrl": payload.get("imageUrl", ""),
        "ussd_shortcode": payload.get("ussd_shortcode", ""),
        "created_at": "2025-08-10T20:00:00Z"  # Demo timestamp
    }
    
    INFLUENCERS_DB.append(new_influencer)
    
    return jsonify({
        "message": "Influencer created successfully",
        "influencer": new_influencer
    }), 201

@api_bp.put("/admin/influencers/<int:influencer_id>")
@admin_required
def admin_update_influencer(influencer_id):
    """Admin endpoint to update an existing influencer"""
    payload = request.get_json(force=True) or {}
    
    # Find influencer
    influencer = next((inf for inf in INFLUENCERS_DB if inf["id"] == influencer_id), None)
    if not influencer:
        return jsonify({"error": "Influencer not found"}), 404
    
    # Update fields
    if "name" in payload:
        influencer["name"] = payload["name"]
    if "phone" in payload:
        # Check if new phone conflicts with existing
        if any(inf["phone"] == payload["phone"] and inf["id"] != influencer_id for inf in INFLUENCERS_DB):
            return jsonify({"error": "Phone number already exists"}), 409
        influencer["phone"] = payload["phone"]
    if "received" in payload:
        influencer["received"] = payload["received"]
    if "imageUrl" in payload:
        influencer["imageUrl"] = payload["imageUrl"]
    if "ussd_shortcode" in payload:
        influencer["ussd_shortcode"] = payload["ussd_shortcode"]
    
    return jsonify({
        "message": "Influencer updated successfully",
        "influencer": influencer
    })

@api_bp.delete("/admin/influencers/<int:influencer_id>")
@admin_required
def admin_delete_influencer(influencer_id):
    """Admin endpoint to delete an influencer"""
    global INFLUENCERS_DB
    
    # Find and remove influencer
    for i, influencer in enumerate(INFLUENCERS_DB):
        if influencer["id"] == influencer_id:
            deleted_influencer = INFLUENCERS_DB.pop(i)
            return jsonify({
                "message": "Influencer deleted successfully",
                "deleted_influencer": deleted_influencer
            })
    
    return jsonify({"error": "Influencer not found"}), 404
