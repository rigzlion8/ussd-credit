from flask import jsonify, request, current_app, url_for, send_from_directory
from . import api_bp
from .auth import admin_required
from werkzeug.utils import secure_filename
from datetime import datetime
from pathlib import Path

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


@api_bp.post("/admin/influencers/<int:influencer_id>/avatar")
@admin_required
def admin_upload_influencer_avatar(influencer_id):
    """Upload an influencer image and update imageUrl (admin only)."""
    # Find influencer
    influencer = next((inf for inf in INFLUENCERS_DB if inf["id"] == influencer_id), None)
    if not influencer:
        return jsonify({"error": "Influencer not found"}), 404

    if 'image' not in request.files:
        return jsonify({"error": "image file is required"}), 400

    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    # Build unique filename
    unique_prefix = f"inf{influencer_id}_{int(datetime.utcnow().timestamp())}"
    parts = filename.rsplit('.', 1)
    ext = parts[1].lower() if len(parts) == 2 else ''
    final_name = f"{unique_prefix}.{ext}" if ext else unique_prefix

    # Save to uploads/influencers
    base_dir = Path(current_app.root_path).parents[1]
    upload_dir = base_dir / 'uploads' / 'influencers'
    upload_dir.mkdir(parents=True, exist_ok=True)
    file.save(str(upload_dir / final_name))

    public_url = url_for('serve_influencer_image', filename=final_name, _external=True)

    # Update in-memory DB
    influencer["imageUrl"] = public_url

    return jsonify({
        "message": "Influencer image uploaded successfully",
        "imageUrl": public_url,
        "influencer": influencer
    }), 200


@api_bp.get('/uploads/influencers/<path:filename>')
def serve_influencer_image(filename):
    base_dir = Path(current_app.root_path).parents[1]
    upload_dir = base_dir / 'uploads' / 'influencers'
    return send_from_directory(str(upload_dir), filename, as_attachment=False)
