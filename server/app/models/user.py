from datetime import datetime

from ..extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), unique=True, nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False, default="subscriber")
    pin = db.Column(db.String(20), nullable=True)
    balance = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    influencers = db.relationship("Influencer", back_populates="user", lazy=True)


