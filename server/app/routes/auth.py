from datetime import datetime, timedelta
import random

from flask import jsonify, request

from ..extensions import db
from ..models import OtpCode
from . import api_bp


@api_bp.post("/auth/otp/request")
def request_otp():
    payload = request.get_json(force=True) or {}
    phone = str(payload.get("phone", "")).strip()
    if not phone:
        return jsonify({"error": "phone required"}), 400
    code = str(random.randint(1000, 9999))
    otp = OtpCode(phone=phone, code=code, expires_at=datetime.utcnow() + timedelta(minutes=5))
    db.session.add(otp)
    db.session.commit()
    # TODO: Integrate SMS provider to send OTP; for now return code for dev
    return jsonify({"success": True, "dev_code": code})


@api_bp.post("/auth/otp/verify")
def verify_otp():
    payload = request.get_json(force=True) or {}
    phone = str(payload.get("phone", "")).strip()
    code = str(payload.get("code", "")).strip()
    if not phone or not code:
        return jsonify({"error": "phone and code required"}), 400
    otp = (
        OtpCode.query.filter_by(phone=phone, code=code)
        .order_by(OtpCode.id.desc())
        .first()
    )
    if not otp or otp.expires_at < datetime.utcnow():
        return jsonify({"success": False, "error": "invalid_or_expired"}), 400
    return jsonify({"success": True})


