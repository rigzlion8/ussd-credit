from flask import jsonify, request

from flask import current_app
from ..extensions import db, mongo_db
from ..models import Influencer
from ..schemas import InfluencerSchema
from . import api_bp


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
        }
        for inf in influencers
    ]
    return jsonify(normalized)


@api_bp.post("/influencers")
def create_influencer():
    payload = request.get_json(force=True) or {}
    if mongo_db is not None:
        coll = mongo_db.get_collection("influencers")
        doc = {
            "phone": payload.get("phone"),
            "name": payload.get("name", ""),
            "imageUrl": payload.get("imageUrl") or payload.get("image_url"),
            "ussd_shortcode": payload.get("ussd_shortcode"),
            "received": payload.get("received", 0),
        }
        coll.insert_one(doc)
        return jsonify(doc), 201
    influencer = Influencer(
        phone=payload.get("phone"),
        name=payload.get("name", ""),
        image_url=payload.get("imageUrl") or payload.get("image_url"),
        ussd_shortcode=payload.get("ussd_shortcode"),
        received=payload.get("received", 0),
    )
    db.session.add(influencer)
    db.session.commit()
    return jsonify(InfluencerSchema().dump(influencer)), 201


