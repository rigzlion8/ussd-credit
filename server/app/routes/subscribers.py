from flask import jsonify, request

from ..extensions import db

# Try to import mongo_db, but don't fail if it's not available
try:
    from ..extensions import mongo_db
except ImportError:
    mongo_db = None
from ..models import Subscription
from ..schemas import SubscriptionSchema
from . import api_bp


@api_bp.get("/subscribers")
def list_subscribers():
    if mongo_db is not None:
        coll = mongo_db.get_collection("subscribers")
        docs = list(coll.find({}, {"_id": 0}))
        return jsonify(docs)
    subs = Subscription.query.order_by(Subscription.id).all()
    data = SubscriptionSchema(many=True).dump(subs)
    return jsonify(data)


@api_bp.post("/subscribers")
def create_subscription():
    payload = request.get_json(force=True) or {}
    if mongo_db is not None:
        coll = mongo_db.get_collection("subscribers")
        doc = {
            "influencer_id": payload.get("influencer_id"),
            "fan_phone": payload.get("fan_phone"),
            "amount": payload.get("amount", 0),
            "frequency": payload.get("frequency", "monthly"),
            "is_active": bool(payload.get("is_active", True)),
        }
        result = coll.insert_one(doc)
        # Avoid returning raw ObjectId; return document without _id or include as string
        response_doc = {k: v for k, v in doc.items() if k != "_id"}
        response_doc["id"] = str(result.inserted_id)
        return jsonify(response_doc), 201
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


