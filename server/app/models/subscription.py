from datetime import datetime

from ..extensions import db


class Subscription(db.Model):
    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    influencer_id = db.Column(db.Integer, db.ForeignKey("influencers.id"), nullable=False)
    # Temporary field to match mock data; later migrate to subscriber_user_id
    fan_phone = db.Column(db.String(20), nullable=True, index=True)
    amount = db.Column(db.Integer, nullable=False)
    frequency = db.Column(db.String(20), nullable=False)  # weekly | monthly
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    next_charge_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    influencer = db.relationship("Influencer", back_populates="subscriptions")
    payments = db.relationship("Payment", back_populates="subscription", lazy=True)


