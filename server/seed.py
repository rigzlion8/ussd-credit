import json
from pathlib import Path

from server.app import create_app
from server.app.extensions import db, mongo_client, mongo_db
from server.app.models import User, Influencer, Subscription


def main():
    app = create_app()
    with app.app_context():
        db.create_all()

        project_root = Path(__file__).resolve().parents[1]
        db_json_path = project_root / "db.json"
        if not db_json_path.exists():
            print("No db.json found; skipping seed")
            return

        with db_json_path.open() as f:
            data = json.load(f)

        # If Mongo is configured and reachable, seed Mongo collections for POC
        try:
            if mongo_db is not None:
                mdb = mongo_db
                mdb.get_collection("users").delete_many({})
                mdb.get_collection("influencers").delete_many({})
                mdb.get_collection("subscribers").delete_many({})
                mdb.get_collection("payments").delete_many({})
                mdb.get_collection("withdrawals").delete_many({})
                mdb.get_collection("otp_codes").delete_many({})
                if data.get("users"):
                    mdb.get_collection("users").insert_many(data["users"])  # simple insert
                if data.get("influencers"):
                    mdb.get_collection("influencers").insert_many(data["influencers"])  # simple insert
                if data.get("subscribers"):
                    mdb.get_collection("subscribers").insert_many(data["subscribers"])  # simple insert
        except Exception:
            pass

        # Users (keyed by phone)
        for u in data.get("users", []):
            if not User.query.filter_by(phone=u.get("phone")).first():
                user = User(
                    phone=u.get("phone"),
                    role="subscriber",
                    pin=u.get("pin"),
                    balance=u.get("balance"),
                )
                db.session.add(user)

        # Influencers (keyed by name + phone)
        for i in data.get("influencers", []):
            existing_inf = Influencer.query.filter_by(name=i.get("name"), phone=i.get("phone")).first()
            if not existing_inf:
                influencer = Influencer(
                    phone=i.get("phone"),
                    name=i.get("name"),
                    image_url=i.get("imageUrl") or i.get("image_url"),
                    ussd_shortcode=i.get("ussd_shortcode"),
                    received=i.get("received", 0),
                )
                db.session.add(influencer)

        # Subscriptions (map from mock "subscribers"). Some IDs may be non-integers; avoid invalid lookups.
        for s in data.get("subscribers", []):
            existing = (
                Subscription.query.filter_by(
                    fan_phone=s.get("fan_phone"),
                    influencer_id=s.get("influencer_id"),
                    amount=s.get("amount", 0),
                    frequency=s.get("frequency", "monthly"),
                ).first()
            )
            if not existing:
                sub = Subscription(
                    fan_phone=s.get("fan_phone"),
                    influencer_id=s.get("influencer_id"),
                    amount=s.get("amount", 0),
                    frequency=s.get("frequency", "monthly"),
                    is_active=s.get("is_active", True),
                )
                db.session.add(sub)

        db.session.commit()
        print("Seed complete")


if __name__ == "__main__":
    main()


