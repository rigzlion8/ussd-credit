from flask import Blueprint

print("DEBUG: Creating api_bp blueprint")
api_bp = Blueprint("api", __name__)
print(f"DEBUG: api_bp created: {api_bp}")

# Import endpoints to register routes under api_bp
print("DEBUG: Starting to import route modules...")

try:
    print("DEBUG: Importing influencers_simple module...")
    from . import influencers_simple  # noqa: E402, F401
    print("DEBUG: Successfully imported influencers_simple")
except Exception as e:
    print(f"DEBUG: Failed to import influencers_simple: {e}")

try:
    print("DEBUG: Importing subscribers_simple module...")
    from . import subscribers_simple  # noqa: E402, F401
    print("DEBUG: Successfully imported subscribers_simple")
except Exception as e:
    print(f"DEBUG: Failed to import subscribers_simple: {e}")

# Temporarily comment out potentially conflicting modules
# try:
#     print("DEBUG: Importing users module...")
#     from . import users  # noqa: E402, F401
#     print("DEBUG: Successfully imported users")
# except Exception as e:
#     print(f"DEBUG: Failed to import users: {e}")

# try:
#     print("DEBUG: Importing auth module...")
#     from . import auth  # noqa: F401
#     print("DEBUG: Failed to import auth: {e}")

# try:
#     print("DEBUG: Importing admin module...")
#     from . import admin  # noqa: F401
#     print("DEBUG: Successfully imported admin")
# except Exception as e:
#     print(f"DEBUG: Failed to import admin: {e}")

try:
    print("DEBUG: Importing admin_influencers module...")
    from . import admin_influencers  # noqa: F401
    print("DEBUG: Successfully imported admin_influencers")
except Exception as e:
    print(f"DEBUG: Failed to import admin_influencers: {e}")

try:
    print("DEBUG: Importing admin_setup module...")
    from . import admin_setup  # noqa: F401
    print("DEBUG: Successfully imported admin_setup")
except Exception as e:
    print(f"DEBUG: Failed to import admin_setup: {e}")

try:
    print("DEBUG: Importing auth_simple module...")
    from . import auth_simple  # noqa: F401
    print("DEBUG: Successfully imported auth_simple")
except Exception as e:
    print(f"DEBUG: Failed to import auth_simple: {e}")

print("DEBUG: Finished importing route modules")


