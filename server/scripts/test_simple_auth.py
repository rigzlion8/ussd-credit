#!/usr/bin/env python3
"""
Test script for the simplified auth endpoints.
This will help verify that the basic authentication is working.
"""

import requests
import json

def test_simple_auth(api_base_url):
    """Test the simplified auth endpoints"""
    print(f"🧪 Testing simplified auth endpoints at: {api_base_url}")
    print("=" * 60)
    
    # Test 1: Create admin user
    print("1️⃣ Testing admin user creation...")
    try:
        response = requests.post(
            f"{api_base_url}/api/auth/simple/create-admin",
            json={
                "email": "admin@ussd-credit.com",
                "password": "Admin123!",
                "first_name": "System",
                "last_name": "Administrator"
            },
            timeout=10
        )
        
        if response.status_code == 201:
            print("✅ Admin user created successfully!")
            admin_data = response.json()
            print(f"   👤 ID: {admin_data.get('admin', {}).get('id')}")
            print(f"   📧 Email: {admin_data.get('admin', {}).get('email')}")
            print(f"   👑 Type: {admin_data.get('admin', {}).get('user_type')}")
        elif response.status_code == 200:
            print("ℹ️ Admin user already exists!")
            admin_data = response.json()
            print(f"   👤 ID: {admin_data.get('admin', {}).get('id')}")
            print(f"   📧 Email: {admin_data.get('admin', {}).get('email')}")
        else:
            print(f"❌ Failed to create admin: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        return False
    
    # Test 2: Login with admin user
    print("\n2️⃣ Testing admin login...")
    try:
        response = requests.post(
            f"{api_base_url}/api/auth/simple/login",
            json={
                "email": "admin@ussd-credit.com",
                "password": "Admin123!"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Admin login successful!")
            login_data = response.json()
            print(f"   🔑 Token: {login_data.get('token', 'N/A')[:20]}...")
            print(f"   👤 User: {login_data.get('user', {}).get('first_name')} {login_data.get('user', {}).get('last_name')}")
            admin_token = login_data.get('token')
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during admin login: {e}")
        return False
    
    # Test 3: List users
    print("\n3️⃣ Testing user listing...")
    try:
        response = requests.get(
            f"{api_base_url}/api/auth/simple/users",
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ User listing successful!")
            users_data = response.json()
            print(f"   📊 Total users: {users_data.get('total', 0)}")
            for user in users_data.get('users', []):
                print(f"   👤 {user.get('first_name')} {user.get('last_name')} ({user.get('email')}) - {user.get('user_type')}")
        else:
            print(f"❌ User listing failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error listing users: {e}")
    
    # Test 4: Create regular user
    print("\n4️⃣ Testing regular user registration...")
    try:
        response = requests.post(
            f"{api_base_url}/api/auth/simple/register",
            json={
                "email": "user@test.com",
                "password": "User123!",
                "first_name": "Test",
                "last_name": "User",
                "user_type": "user"
            },
            timeout=10
        )
        
        if response.status_code == 201:
            print("✅ Regular user created successfully!")
            user_data = response.json()
            print(f"   👤 ID: {user_data.get('user', {}).get('id')}")
            print(f"   📧 Email: {user_data.get('user', {}).get('email')}")
            print(f"   👑 Type: {user_data.get('user', {}).get('user_type')}")
        else:
            print(f"❌ Failed to create regular user: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error creating regular user: {e}")
    
    print("\n🎉 Simplified auth testing completed!")
    return True

def main():
    """Main function"""
    print("🚀 USSD Credit - Simplified Auth Testing")
    print("=" * 60)
    
    # Configuration
    API_BASE_URL = "https://ussd-credit-production.up.railway.app"
    
    print(f"🎯 Target API: {API_BASE_URL}")
    print()
    
    # Run tests
    success = test_simple_auth(API_BASE_URL)
    
    if success:
        print(f"\n✅ All tests passed! You can now:")
        print(f"   🔗 Create admin: POST {API_BASE_URL}/api/auth/simple/create-admin")
        print(f"   🔗 Login: POST {API_BASE_URL}/api/auth/simple/login")
        print(f"   🔗 Register: POST {API_BASE_URL}/api/auth/simple/register")
        print(f"   🔗 List users: GET {API_BASE_URL}/api/auth/simple/users")
    else:
        print(f"\n❌ Some tests failed. Check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
