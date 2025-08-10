from flask import Blueprint

api_bp = Blueprint("api", __name__)

# Import endpoints to register routes under api_bp
from . import influencers, subscribers, users, auth, admin  # noqa: E402, F401


