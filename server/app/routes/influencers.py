from flask import jsonify, request

from ..extensions import db
from ..models import Influencer
from ..schemas import InfluencerSchema
from . import api_bp


@api_bp.get("/influencers")
def list_influencers():
    influencers = Influencer.query.order_by(Influencer.id).all()
    data = InfluencerSchema(many=True).dump(influencers)
    return jsonify(data)


@api_bp.post("/influencers")
def create_influencer():
    payload = request.get_json(force=True) or {}
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


