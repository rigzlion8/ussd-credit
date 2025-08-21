#!/usr/bin/env python3
"""
Test script to verify authentication is working
"""

import requests
import json

# Test the backend authentication
def test_auth():
    base_url = "https://ussd-credit-production.up.railway.app"
    
    print("Testing authentication system...")
    
    # Test 1: Check admin status
    try:
        response = requests.get(f"{base_url}/api/admin/status")
        print(f"Admin status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Admin status error: {e}")
    
    # Test 2: Try to login with correct admin credentials
    try:
        login_data = {
            "email": "admin@ussd.com",  # Correct email from db.json
            "password": "password123"    # Default password we set
        }
        
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        print(f"\nLogin test: {response.status_code}")
        if response.status_code == 200:
            print("✅ Login successful!")
            data = response.json()
            print(f"User: {data['user']['first_name']} {data['user']['last_name']}")
            print(f"Type: {data['user']['user_type']}")
        else:
            print(f"❌ Login failed: {response.text}")
    except Exception as e:
        print(f"Login error: {e}")
    
    # Test 3: Try to login with wrong email (what you were using)
    try:
        login_data = {
            "email": "admin@ussd-credit.com",  # Wrong email
            "password": "password123"
        }
        
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        print(f"\nWrong email test: {response.status_code}")
        if response.status_code == 401:
            print("✅ Correctly rejected wrong email")
        else:
            print(f"Unexpected response: {response.text}")
    except Exception as e:
        print(f"Wrong email test error: {e}")

if __name__ == "__main__":
    test_auth()
