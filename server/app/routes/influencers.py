from flask import jsonify, request, abort
from flask import current_app
from ..extensions import db
from ..models import Influencer, InfluencerStatus
from ..schemas import InfluencerSchema
from . import api_bp
from datetime import datetime

# Try to import mongo_db, but don't fail if it's not available
try:
    from ..extensions import mongo_db
except ImportError:
    mongo_db = None


@api_bp.get("/influencers")
def list_influencers():
    # Debug logging
    print(f"DEBUG: mongo_db available: {mongo_db is not None}")
    print(f"DEBUG: mongo_db type: {type(mongo_db)}")
    
    # If Mongo is available, read from Mongo and normalize keys for frontend
    if mongo_db is not None:
        print("DEBUG: Using MongoDB")
        coll = mongo_db.get_collection("influencers")
        docs = list(coll.find({}, {"_id": 0}))
        print(f"DEBUG: Found {len(docs)} docs from MongoDB")
        normalized = [
            {
                "id": d.get("id"),
                "name": d.get("name", ""),
                "phone": d.get("phone", ""),
                "received": d.get("received", 0),
                "imageUrl": d.get("imageUrl") or d.get("image_url") or "",
                "ussd_shortcode": d.get("ussd_shortcode", ""),
                "status": d.get("status", "active"),
                "created_at": d.get("created_at"),
                "updated_at": d.get("updated_at")
            }
            for d in docs
        ]
        return jsonify(normalized)
    
    print("DEBUG: Falling back to SQLAlchemy")
    influencers = Influencer.query.order_by(Influencer.id).all()
    # Normalize SQLAlchemy model output to camelCase for the frontend
    normalized = [
        {
            "id": inf.id,
            "name": inf.name,
            "phone": inf.phone or "",
            "received": inf.received or 0,
            "imageUrl": getattr(inf, "image_url", None) or "",
            "ussd_shortcode": inf.ussd_shortcode or "",
            "status": inf.status or "active",
            "created_at": inf.created_at.isoformat() if inf.created_at else None,
            "updated_at": inf.updated_at.isoformat() if inf.updated_at else None
        }
        for inf in influencers
    ]
    return jsonify(normalized)


@api_bp.get("/influencers/<int:influencer_id>")
def get_influencer(influencer_id):
    if mongo_db is not None:
        coll = mongo_db.get_collection("influencers")
        doc = coll.find_one({"id": influencer_id}, {"_id": 0})
        if not doc:
            abort(404, description="Influencer not found")
        
        normalized = {
            "id": doc.get("id"),
            "name": doc.get("name", ""),
            "phone": doc.get("phone", ""),
            "received": doc.get("received", 0),
            "imageUrl": doc.get("imageUrl") or doc.get("image_url") or "",
            "ussd_shortcode": doc.get("ussd_shortcode", ""),
            "status": doc.get("status", "active"),
            "created_at": doc.get("created_at"),
            "updated_at": doc.get("updated_at")
        }
        return jsonify(normalized)
    
    influencer = Influencer.query.get_or_404(influencer_id)
    normalized = {
        "id": influencer.id,
        "name": influencer.name,
        "phone": influencer.phone or "",
        "received": influencer.received or 0,
        "imageUrl": getattr(influencer, "image_url", None) or "",
        "ussd_shortcode": influencer.ussd_shortcode or "",
        "status": influencer.status or "active",
        "created_at": influencer.created_at.isoformat() if influencer.created_at else None,
        "updated_at": influencer.updated_at.isoformat() if influencer.updated_at else None
    }
    return jsonify(normalized)


@api_bp.post("/influencers")
def create_influencer():
    payload = request.get_json(force=True) or {}
    
    # Validate required fields
    if not payload.get("name"):
        abort(400, description="Name is required")
    
    if not payload.get("ussd_shortcode"):
        abort(400, description="USSD shortcode is required")
    
    # Check if shortcode already exists
    if mongo_db is not None:
        coll = mongo_db.get_collection("influencers")
        existing = coll.find_one({"ussd_shortcode": payload.get("ussd_shortcode")})
        if existing:
            abort(400, description="USSD shortcode already exists")
        
        doc = {
            "id": coll.count_documents({}) + 1,  # Simple ID generation
            "phone": payload.get("phone"),
            "name": payload.get("name", ""),
            "imageUrl": payload.get("imageUrl") or payload.get("image_url"),
            "ussd_shortcode": payload.get("ussd_shortcode"),
            "received": payload.get("received", 0),
            "status": payload.get("status", "active"),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        coll.insert_one(doc)
        return jsonify(doc), 201
    
    # Check if shortcode already exists in SQLAlchemy
    existing = Influencer.query.filter_by(ussd_shortcode=payload.get("ussd_shortcode")).first()
    if existing:
        abort(400, description="USSD shortcode already exists")
    
    influencer = Influencer(
        phone=payload.get("phone"),
        name=payload.get("name", ""),
        image_url=payload.get("imageUrl") or payload.get("image_url"),
        ussd_shortcode=payload.get("ussd_shortcode"),
        received=payload.get("received", 0),
        status=payload.get("status", InfluencerStatus.ACTIVE.value)
    )
    db.session.add(influencer)
    db.session.commit()
    return jsonify(InfluencerSchema().dump(influencer)), 201


@api_bp.put("/influencers/<int:influencer_id>")
def update_influencer(influencer_id):
    payload = request.get_json(force=True) or {}
    
    if mongo_db is not None:
        coll = mongo_db.get_collection("influencers")
        doc = coll.find_one({"id": influencer_id})
        if not doc:
            abort(404, description="Influencer not found")
        
        # Check if shortcode is being changed and if it already exists
        if payload.get("ussd_shortcode") and payload.get("ussd_shortcode") != doc.get("ussd_shortcode"):
            existing = coll.find_one({"ussd_shortcode": payload.get("ussd_shortcode")})
            if existing:
                abort(400, description="USSD shortcode already exists")
        
        update_data = {
            "phone": payload.get("phone", doc.get("phone")),
            "name": payload.get("name", doc.get("name")),
            "imageUrl": payload.get("imageUrl") or payload.get("image_url") or doc.get("imageUrl"),
            "ussd_shortcode": payload.get("ussd_shortcode", doc.get("ussd_shortcode")),
            "received": payload.get("received", doc.get("received")),
            "status": payload.get("status", doc.get("status")),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        coll.update_one({"id": influencer_id}, {"$set": update_data})
        updated_doc = coll.find_one({"id": influencer_id}, {"_id": 0})
        return jsonify(updated_doc)
    
    influencer = Influencer.query.get_or_404(influencer_id)
    
    # Check if shortcode is being changed and if it already exists
    if payload.get("ussd_shortcode") and payload.get("ussd_shortcode") != influencer.ussd_shortcode:
        existing = Influencer.query.filter_by(ussd_shortcode=payload.get("ussd_shortcode")).first()
        if existing:
            abort(400, description="USSD shortcode already exists")
    
    if payload.get("name"):
        influencer.name = payload.get("name")
    if payload.get("phone") is not None:
        influencer.phone = payload.get("phone")
    if payload.get("imageUrl") or payload.get("image_url"):
        influencer.image_url = payload.get("imageUrl") or payload.get("image_url")
    if payload.get("ussd_shortcode"):
        influencer.ussd_shortcode = payload.get("ussd_shortcode")
    if payload.get("received") is not None:
        influencer.received = payload.get("received")
    if payload.get("status"):
        influencer.status = payload.get("status")
    
    db.session.commit()
    return jsonify(InfluencerSchema().dump(influencer))


@api_bp.delete("/influencers/<int:influencer_id>")
def delete_influencer(influencer_id):
    if mongo_db is not None:
        coll = mongo_db.get_collection("influencers")
        result = coll.delete_one({"id": influencer_id})
        if result.deleted_count == 0:
            abort(404, description="Influencer not found")
        return jsonify({"message": "Influencer deleted successfully"})
    
    influencer = Influencer.query.get_or_404(influencer_id)
    db.session.delete(influencer)
    db.session.commit()
    return jsonify({"message": "Influencer deleted successfully"})


@api_bp.post("/influencers/<int:influencer_id>/suspend")
def suspend_influencer(influencer_id):
    if mongo_db is not None:
        coll = mongo_db.get_collection("influencers")
        result = coll.update_one(
            {"id": influencer_id}, 
            {"$set": {"status": "suspended", "updated_at": datetime.utcnow().isoformat()}}
        )
        if result.matched_count == 0:
            abort(404, description="Influencer not found")
        return jsonify({"message": "Influencer suspended successfully"})
    
    influencer = Influencer.query.get_or_404(influencer_id)
    influencer.status = InfluencerStatus.SUSPENDED.value
    db.session.commit()
    return jsonify({"message": "Influencer suspended successfully"})


@api_bp.post("/influencers/<int:influencer_id>/activate")
def activate_influencer(influencer_id):
    if mongo_db is not None:
        coll = mongo_db.get_collection("influencers")
        result = coll.update_one(
            {"id": influencer_id}, 
            {"$set": {"status": "active", "updated_at": datetime.utcnow().isoformat()}}
        )
        if result.matched_count == 0:
            abort(404, description="Influencer not found")
        return jsonify({"message": "Influencer activated successfully"})
    
    influencer = Influencer.query.get_or_404(influencer_id)
    influencer.status = InfluencerStatus.ACTIVE.value
    db.session.commit()
    return jsonify({"message": "Influencer activated successfully"})


@api_bp.post("/influencers/<int:influencer_id>/terminate")
def terminate_influencer(influencer_id):
    if mongo_db is not None:
        coll = mongo_db.get_collection("influencers")
        result = coll.update_one(
            {"id": influencer_id}, 
            {"$set": {"status": "terminated", "updated_at": datetime.utcnow().isoformat()}}
        )
        if result.matched_count == 0:
            abort(404, description="Influencer not found")
        return jsonify({"message": "Influencer terminated successfully"})
    
    influencer = Influencer.query.get_or_404(influencer_id)
    influencer.status = InfluencerStatus.TERMINATED.value
    db.session.commit()
    return jsonify({"message": "Influencer terminated successfully"})


@api_bp.get("/influencers/shortcodes")
def list_shortcodes():
    """Get all available shortcodes for admin reference"""
    if mongo_db is not None:
        coll = mongo_db.get_collection("influencers")
        shortcodes = list(coll.find({}, {"id": 1, "ussd_shortcode": 1, "name": 1, "status": 1, "_id": 0}))
        return jsonify(shortcodes)
    
    shortcodes = Influencer.query.with_entities(
        Influencer.id, 
        Influencer.ussd_shortcode, 
        Influencer.name, 
        Influencer.status
    ).all()
    
    result = [
        {
            "id": s.id,
            "ussd_shortcode": s.ussd_shortcode,
            "name": s.name,
            "status": s.status
        }
        for s in shortcodes
    ]
    return jsonify(result)


