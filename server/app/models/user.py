from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from flask import current_app
from enum import Enum

db = SQLAlchemy()

class UserType(Enum):
    GUEST = "guest"
    USER = "user"
    SUBSCRIBED = "subscribed"
    ADMIN = "admin"

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=True)  # Nullable for guest users
    phone = db.Column(db.String(20), unique=True, nullable=True)   # Nullable for guest users
    username = db.Column(db.String(80), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for SSO users
    user_type = db.Column(db.Enum(UserType), default=UserType.GUEST)
    
    # Profile information
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    
    # Authentication fields
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    email_verified = db.Column(db.Boolean, default=False)
    phone_verified = db.Column(db.Boolean, default=False)
    
    # Account status
    is_active = db.Column(db.Boolean, default=True)
    is_suspended = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscriptions = db.relationship('Subscription', backref='user', lazy='dynamic')
    payments = db.relationship('Payment', backref='user', lazy='dynamic')
    withdrawals = db.relationship('Withdrawal', backref='user', lazy='dynamic')
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        if not self.user_type:
            self.user_type = UserType.GUEST
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def generate_jwt_token(self, expires_in=3600):
        """Generate JWT token for user authentication"""
        payload = {
            'user_id': self.id,
            'user_type': self.user_type.value,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in)
        }
        return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    def verify_jwt_token(self, token):
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def upgrade_to_user(self):
        """Upgrade guest user to regular user"""
        if self.user_type == UserType.GUEST:
            self.user_type = UserType.USER
            return True
        return False
    
    def upgrade_to_subscribed(self):
        """Upgrade user to subscribed status"""
        if self.user_type in [UserType.USER, UserType.SUBSCRIBED]:
            self.user_type = UserType.SUBSCRIBED
            return True
        return False
    
    def get_full_name(self):
        """Get user's full name or fallback to username/email"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.username:
            return self.username
        elif self.email:
            return self.email.split('@')[0]
        else:
            return f"User {self.id}"
    
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            'id': self.id,
            'email': self.email,
            'phone': self.phone,
            'username': self.username,
            'user_type': self.user_type.value,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'avatar_url': self.avatar_url,
            'email_verified': self.email_verified,
            'phone_verified': self.phone_verified,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<User {self.username or self.email or self.phone or self.id}>'


