from flask import Blueprint, jsonify, request, Response
from ..extensions import mongo_db

webhooks_bp = Blueprint("webhooks", __name__)


@webhooks_bp.post("/ussd")
def ussd_webhook():
    # Africa's Talking sends form-encoded data
    session_id = request.values.get("sessionId", "")
    service_code = request.values.get("serviceCode", "")
    phone_number = request.values.get("phoneNumber", "")
    text = request.values.get("text", "")

    # Simple demo menu
    if text == "":
        reply = "CON Welcome to Auto-Credit\n1. Subscribe\n2. My Subscriptions\n0. Exit"
        return Response(reply, mimetype="text/plain")

    if text == "0":
        return Response("END Goodbye", mimetype="text/plain")

    # Not implemented flows yet
    return Response("CON Feature coming soon.\n0. Exit", mimetype="text/plain")


@webhooks_bp.post("/mpesa")
def mpesa_callback():
    # Accept and acknowledge M-Pesa callbacks
    payload = request.get_json(silent=True) or {}
    # TODO: validate signature/IP and persist transaction outcome
    if mongo_db:
        mongo_db.get_collection("payments").insert_one({"callback": payload})
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"})


