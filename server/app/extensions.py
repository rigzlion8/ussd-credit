from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient
from typing import Optional

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

# Set by app factory if MONGO_URI is configured
mongo_client: Optional[MongoClient] = None
mongo_db = None


