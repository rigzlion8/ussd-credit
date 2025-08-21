from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

# MongoDB objects - will be initialized if MONGO_URI is available
mongo_client = None
mongo_db = None

def init_mongodb(app):
    """Initialize MongoDB connection if MONGO_URI is available"""
    global mongo_client, mongo_db
    
    mongo_uri = app.config.get('MONGO_URI')
    if mongo_uri:
        try:
            from pymongo import MongoClient
            mongo_client = MongoClient(mongo_uri)
            mongo_db_name = mongo_uri.split('/')[-1].split('?')[0]
            mongo_db = mongo_client[mongo_db_name]
            print(f"MongoDB initialized successfully: {mongo_db_name}")
        except Exception as e:
            print(f"Failed to initialize MongoDB: {e}")
            mongo_client = None
            mongo_db = None
    else:
        print("No MONGO_URI configured, MongoDB not available")


