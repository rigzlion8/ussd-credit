import os


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///app.db")
    # Default to local Mongo; override via env in server/.env with your cloud URI
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/ussd_credit")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*")

    # Africa's Talking
    AT_USERNAME = os.getenv("AT_USERNAME", "")
    AT_API_KEY = os.getenv("AT_API_KEY", "")

    # M-Pesa Daraja
    DARAJA_CONSUMER_KEY = os.getenv("DARAJA_CONSUMER_KEY", "")
    DARAJA_CONSUMER_SECRET = os.getenv("DARAJA_CONSUMER_SECRET", "")
    DARAJA_PASSKEY = os.getenv("DARAJA_PASSKEY", "")
    DARAJA_SHORTCODE = os.getenv("DARAJA_SHORTCODE", "")


def get_config():
    return Config


