import json
from pathlib import Path
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db, mongo_client, mongo_db


def parse_date_safely(date_str, default=None):
    """Safely parse date strings from various formats"""
    if not date_str:
        return default or datetime.utcnow()
    
    try:
        # Try ISO format first
        if 'Z' in date_str:
            # Remove Z and parse
            date_str = date_str.replace('Z', '+00:00')
        return datetime.fromisoformat(date_str)
    except ValueError:
        try:
            # Try parsing with strptime for common formats
            for fmt in ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d']:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
        except:
            pass
    
    # Return default if all parsing fails
    return default or datetime.utcnow()


def main():
    app = create_app()
    with app.app_context():
        # Skip SQLite operations for now since we're using MongoDB
        # db.create_all()

        project_root = Path(__file__).resolve().parents[1]
        db_json_path = project_root / "db.json"
        if not db_json_path.exists():
            print("No db.json found; skipping seed")
            return

        with db_json_path.open() as f:
            data = json.load(f)

        # Seed MongoDB collections for POC
        try:
            if mongo_db is not None:
                mdb = mongo_db
                
                # Clear existing collections
                mdb.get_collection("users").delete_many({})
                mdb.get_collection("influencers").delete_many({})
                mdb.get_collection("subscribers").delete_many({})
                mdb.get_collection("payments").delete_many({})
                mdb.get_collection("withdrawals").delete_many({})
                mdb.get_collection("otp_codes").delete_many({})
                mdb.get_collection("profiles").delete_many({})
                
                # Seed users with proper password hashing and complete data structure
                if data.get("users"):
                    users_to_insert = []
                    for user in data["users"]:
                        # Hash passwords for test users
                        if user.get("email") == "admin@ussd.com":
                            password_hash = generate_password_hash("admin123")
                            user_type = "admin"
                        elif user.get("email") == "john@example.com":
                            password_hash = generate_password_hash("john123")
                            user_type = "user"
                        elif user.get("email") == "jane@example.com":
                            password_hash = generate_password_hash("jane123")
                            user_type = "user"
                        elif user.get("email") == "guest@example.com":
                            password_hash = generate_password_hash("guest123")
                            user_type = "guest"
                        else:
                            password_hash = generate_password_hash("password123")
                            user_type = "user"
                        
                        # Ensure proper data structure with all required fields
                        user_doc = {
                            "id": user.get("id", len(users_to_insert) + 1),
                            "email": user.get("email"),
                            "phone": user.get("phone"),
                            "username": user.get("username"),
                            "password_hash": password_hash,
                            "user_type": user_type,
                            "first_name": user.get("first_name", user.get("name", "").split()[0] if user.get("name") else ""),
                            "last_name": user.get("last_name", user.get("name", "").split()[1] if user.get("name") and len(user.get("name", "").split()) > 1 else ""),
                            "avatar_url": user.get("avatar_url"),
                            "email_verified": user.get("email_verified", True),
                            "phone_verified": user.get("phone_verified", True),
                            "is_active": user.get("is_active", True),
                            "is_suspended": False,
                            "last_login": parse_date_safely(user.get("last_login")),
                            "created_at": parse_date_safely(user.get("created_at")),
                            "updated_at": parse_date_safely(user.get("updated_at")),
                            "google_id": None,
                            "balance": user.get("balance", 1000000),
                            "pin": user.get("pin", "1234")
                        }
                        users_to_insert.append(user_doc)
                    
                    if users_to_insert:
                        mdb.get_collection("users").insert_many(users_to_insert)
                        print(f"✅ Inserted {len(users_to_insert)} users into MongoDB")
                
                # Seed profiles if they exist
                if data.get("profiles"):
                    profiles_to_insert = []
                    for profile in data["profiles"]:
                        profile_doc = {
                            **profile,
                            "created_at": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        }
                        profiles_to_insert.append(profile_doc)
                    
                    if profiles_to_insert:
                        mdb.get_collection("profiles").insert_many(profiles_to_insert)
                        print(f"✅ Inserted {len(profiles_to_insert)} profiles into MongoDB")
                
                # Create some sample influencers with proper data structure
                sample_influencers = [
                    {
                        "id": 1,
                        "phone": "254712345678",
                        "name": "Jane Doe",
                        "imageUrl": "/images/jane_doe.jpg",
                        "ussd_shortcode": "1234",
                        "received": 500,
                        "user_id": 3,  # Link to jane@example.com
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    },
                    {
                        "id": 2,
                        "phone": "254722345678",
                        "name": "Wambui Doe",
                        "ussd_shortcode": "1234",
                        "received": 450000,
                        "user_id": 2,  # Link to john@example.com
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                ]
                
                mdb.get_collection("influencers").insert_many(sample_influencers)
                print(f"✅ Inserted {len(sample_influencers)} sample influencers into MongoDB")
                
                # Create some sample subscribers
                sample_subscribers = [
                    {
                        "id": 1,
                        "fan_phone": "254700000001",
                        "influencer_id": 1,
                        "amount": 10,
                        "frequency": "weekly",
                        "is_active": True,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    },
                    {
                        "id": 2,
                        "fan_phone": "254700000002",
                        "influencer_id": 2,
                        "amount": 520,
                        "frequency": "weekly",
                        "is_active": True,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                ]
                
                mdb.get_collection("subscribers").insert_many(sample_subscribers)
                print(f"✅ Inserted {len(sample_subscribers)} sample subscribers into MongoDB")
                
                print("🎉 MongoDB seeding completed successfully!")
                
        except Exception as e:
            print(f"❌ MongoDB seeding failed: {e}")
            print("Seeding completed with errors.")


if __name__ == "__main__":
    main()


