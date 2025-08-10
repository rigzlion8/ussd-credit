from flask import Blueprint

print("DEBUG: Creating api_bp blueprint")
api_bp = Blueprint("api", __name__)
print(f"DEBUG: api_bp created: {api_bp}")

# Import endpoints to register routes under api_bp
print("DEBUG: Starting to import route modules...")

try:
    print("DEBUG: Importing influencers module...")
    from . import influencers  # noqa: E402, F401
    print("DEBUG: Successfully imported influencers")
except Exception as e:
    print(f"DEBUG: Failed to import influencers: {e}")

try:
    print("DEBUG: Importing subscribers module...")
    from . import subscribers  # noqa: E402, F401
    print("DEBUG: Successfully imported subscribers")
except Exception as e:
    print(f"DEBUG: Failed to import subscribers: {e}")

try:
    print("DEBUG: Importing users module...")
    from . import users  # noqa: E402, F401
    print("DEBUG: Successfully imported users")
except Exception as e:
    print(f"DEBUG: Failed to import users: {e}")

try:
    print("DEBUG: Importing auth module...")
    from . import auth  # noqa: F401
    print("DEBUG: Successfully imported auth")
except Exception as e:
    print(f"DEBUG: Failed to import auth: {e}")

try:
    print("DEBUG: Importing admin module...")
    from . import admin  # noqa: F401
    print("DEBUG: Successfully imported admin")
except Exception as e:
    print(f"DEBUG: Failed to import admin: {e}")

print("DEBUG: Finished importing route modules")


