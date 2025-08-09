from datetime import datetime

from ..extensions import db


class Influencer(db.Model):
    __tablename__ = "influencers"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    phone = db.Column(db.String(20), nullable=True, index=True)
    name = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(512), nullable=True)
    ussd_shortcode = db.Column(db.String(32), nullable=True)
    received = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship("User", back_populates="influencers")
    subscriptions = db.relationship("Subscription", back_populates="influencer", lazy=True)


