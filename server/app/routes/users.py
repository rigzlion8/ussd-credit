from flask import jsonify, request

from ..extensions import db
from ..models import User
from ..schemas import UserSchema
from . import api_bp


@api_bp.get("/users")
def list_users():
    phone = request.args.get("phone")
    pin = request.args.get("pin")
    query = User.query
    if phone:
        query = query.filter(User.phone == str(phone))
    if pin:
        query = query.filter(User.pin == str(pin))
    users = query.order_by(User.id).all()
    data = UserSchema(many=True).dump(users)
    return jsonify(data)


@api_bp.post("/users")
def create_user():
    payload = request.get_json(force=True) or {}
    user = User(
        phone=payload.get("phone"),
        role=payload.get("role", "subscriber"),
        pin=payload.get("pin"),
        balance=payload.get("balance"),
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(UserSchema().dump(user)), 201


