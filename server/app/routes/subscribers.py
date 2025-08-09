from flask import jsonify, request

from ..extensions import db
from ..models import Subscription
from ..schemas import SubscriptionSchema
from . import api_bp


@api_bp.get("/subscribers")
def list_subscribers():
    subs = Subscription.query.order_by(Subscription.id).all()
    data = SubscriptionSchema(many=True).dump(subs)
    return jsonify(data)


@api_bp.post("/subscribers")
def create_subscription():
    payload = request.get_json(force=True) or {}
    sub = Subscription(
        influencer_id=payload.get("influencer_id"),
        fan_phone=payload.get("fan_phone"),
        amount=payload.get("amount", 0),
        frequency=payload.get("frequency", "monthly"),
        is_active=bool(payload.get("is_active", True)),
    )
    db.session.add(sub)
    db.session.commit()
    return jsonify(SubscriptionSchema().dump(sub)), 201


