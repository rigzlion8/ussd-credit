#!/usr/bin/env python3
"""
Script to directly create an admin user in the database.
This bypasses the registration endpoint and is useful for initial setup.
"""

import requests
import json
import sys

def create_admin_user(api_base_url, admin_email, admin_password, first_name="System", last_name="Administrator"):
    """
    Create an admin user by directly calling the database through a special endpoint.
    
    Args:
        api_base_url (str): Base URL of the API
        admin_email (str): Admin email address
        admin_password (str): Admin password
        first_name (str): Admin first name
        last_name (str): Admin last name
    """
    print(f"🔧 Creating admin user at: {api_base_url}")
    print(f"📧 Email: {admin_email}")
    print(f"👤 Name: {first_name} {last_name}")
    print("=" * 50)
    
    # First, let's check if the user already exists
    try:
        # Try to login first to see if user exists
        login_response = requests.post(
            f"{api_base_url}/api/auth/login",
            json={
                "email": admin_email,
                "password": admin_password
            },
            timeout=10
        )
        
        if login_response.status_code == 200:
            print(f"✅ Admin user already exists and can login!")
            user_data = login_response.json()
            print(f"🔑 Token: {user_data.get('token', 'N/A')}")
            print(f"👤 User ID: {user_data.get('user', {}).get('id', 'N/A')}")
            print(f"👑 User Type: {user_data.get('user', {}).get('user_type', 'N/A')}")
            return True
        elif login_response.status_code == 401:
            print(f"❌ User exists but password is incorrect")
            return False
        else:
            print(f"ℹ️ User doesn't exist, proceeding with creation...")
    except Exception as e:
        print(f"ℹ️ Could not check existing user: {e}")
        print(f"ℹ️ Proceeding with creation...")
    
    # Create admin user using the special setup endpoint
    try:
        print(f"📝 Attempting to create admin user via setup endpoint...")
        
        setup_response = requests.post(
            f"{api_base_url}/api/admin/setup",
            json={
                "email": admin_email,
                "password": admin_password,
                "first_name": first_name,
                "last_name": last_name
            },
            timeout=10
        )
        
        if setup_response.status_code == 201:
            print(f"✅ Admin user created successfully via setup endpoint!")
            user_data = setup_response.json()
            print(f"👤 User ID: {user_data.get('user', {}).get('id', 'N/A')}")
            print(f"👑 User Type: {user_data.get('user', {}).get('user_type', 'N/A')}")
            return True
        else:
            print(f"❌ Setup failed: {setup_response.status_code}")
            print(f"📄 Response: {setup_response.text}")
            
            # Fallback to registration endpoint
            print(f"📝 Trying registration endpoint as fallback...")
            register_response = requests.post(
                f"{api_base_url}/api/auth/register",
                json={
                    "email": admin_email,
                    "password": admin_password,
                    "first_name": first_name,
                    "last_name": last_name,
                    "user_type": "admin"
                },
                timeout=10
            )
            
            if register_response.status_code == 201:
                print(f"✅ Admin user created successfully via registration!")
                user_data = register_response.json()
                print(f"🔑 Token: {user_data.get('token', 'N/A')}")
                print(f"👤 User ID: {user_data.get('user', {}).get('id', 'N/A')}")
                print(f"👑 User Type: {user_data.get('user', {}).get('user_type', 'N/A')}")
                return True
            else:
                print(f"❌ Registration also failed: {register_response.status_code}")
                print(f"📄 Response: {register_response.text}")
                return False
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

def test_admin_access(api_base_url, admin_email, admin_password):
    """
    Test if the admin user can access admin endpoints.
    
    Args:
        api_base_url (str): Base URL of the API
        admin_email (str): Admin email address
        admin_password (str): Admin password
    """
    print(f"\n🧪 Testing admin access...")
    print("=" * 30)
    
    try:
        # Try setup login first, then fallback to regular login
        login_response = requests.post(
            f"{api_base_url}/api/admin/setup/login",
            json={
                "email": admin_email,
                "password": admin_password
            },
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"📝 Setup login failed, trying regular login...")
            login_response = requests.post(
                f"{api_base_url}/api/auth/login",
                json={
                    "email": admin_email,
                    "password": admin_password
                },
                timeout=10
            )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            return False
        
        token = login_response.json().get('token')
        if not token:
            print(f"❌ No token received")
            return False
        
        print(f"✅ Login successful, testing admin endpoints...")
        
        # Test admin influencers endpoint
        headers = {"Authorization": f"Bearer {token}"}
        
        admin_response = requests.get(
            f"{api_base_url}/api/admin/influencers",
            headers=headers,
            timeout=10
        )
        
        if admin_response.status_code == 200:
            print(f"✅ Admin access confirmed! Can access /api/admin/influencers")
            admin_data = admin_response.json()
            print(f"📊 Total influencers: {admin_data.get('total', 'N/A')}")
        else:
            print(f"❌ Admin access failed: {admin_response.status_code}")
            print(f"📄 Response: {admin_response.text}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing admin access: {e}")
        return False

def main():
    """Main function to create and test admin user."""
    print("🚀 USSD Credit - Admin User Creation Script")
    print("=" * 50)
    
    # Configuration
    API_BASE_URL = "https://ussd-credit-production.up.railway.app"
    ADMIN_EMAIL = "admin@ussd-credit.com"
    ADMIN_PASSWORD = "Admin123!"
    ADMIN_FIRST_NAME = "System"
    ADMIN_LAST_NAME = "Administrator"
    
    print(f"🎯 Target API: {API_BASE_URL}")
    print(f"👤 Admin Email: {ADMIN_EMAIL}")
    print(f"🔑 Admin Password: {ADMIN_PASSWORD}")
    print(f"📝 Admin Name: {ADMIN_FIRST_NAME} {ADMIN_LAST_NAME}")
    print()
    
    # Create admin user
    success = create_admin_user(
        API_BASE_URL, 
        ADMIN_EMAIL, 
        ADMIN_PASSWORD, 
        ADMIN_FIRST_NAME, 
        ADMIN_LAST_NAME
    )
    
    if success:
        print(f"\n🎉 Admin user setup completed!")
        
        # Test admin access
        test_admin_access(API_BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD)
        
        print(f"\n💡 You can now login with:")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print(f"\n🔗 Login URL: {API_BASE_URL}/api/auth/login")
        print(f"🔗 Admin Endpoint: {API_BASE_URL}/api/admin/influencers")
        
    else:
        print(f"\n❌ Admin user setup failed!")
        print(f"💡 Check the error messages above and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
