#!/usr/bin/env python3
"""
Test script for the simplified subscribers endpoints.
This will help verify that the subscribers API is working.
"""

import requests
import json

def test_subscribers(api_base_url):
    """Test the simplified subscribers endpoints"""
    print(f"🧪 Testing simplified subscribers endpoints at: {api_base_url}")
    print("=" * 60)
    
    # Test 1: List subscribers (should be empty initially)
    print("1️⃣ Testing subscribers listing...")
    try:
        response = requests.get(
            f"{api_base_url}/api/subscribers",
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Subscribers listing successful!")
            data = response.json()
            print(f"   📊 Total subscribers: {data.get('total', 0)}")
        else:
            print(f"❌ Subscribers listing failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error listing subscribers: {e}")
        return False
    
    # Test 2: Populate demo subscribers
    print("\n2️⃣ Testing demo subscribers population...")
    try:
        response = requests.post(
            f"{api_base_url}/api/subscribers/populate-demo",
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Demo subscribers populated successfully!")
            data = response.json()
            print(f"   📊 Added: {data.get('added_count', 0)} subscribers")
            print(f"   📊 Total: {data.get('total_subscribers', 0)} subscribers")
        else:
            print(f"❌ Failed to populate demo subscribers: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error populating demo subscribers: {e}")
    
    # Test 3: List subscribers again (should now have data)
    print("\n3️⃣ Testing subscribers listing after population...")
    try:
        response = requests.get(
            f"{api_base_url}/api/subscribers",
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Subscribers listing successful!")
            data = response.json()
            print(f"   📊 Total subscribers: {data.get('total', 0)}")
            for sub in data.get('subscribers', [])[:3]:  # Show first 3
                print(f"   👤 ID: {sub.get('id')}, Phone: {sub.get('fan_phone')}, Amount: {sub.get('amount')}")
        else:
            print(f"❌ Subscribers listing failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error listing subscribers: {e}")
    
    # Test 4: Create a new subscription
    print("\n4️⃣ Testing subscription creation...")
    try:
        response = requests.post(
            f"{api_base_url}/api/subscribers",
            json={
                "influencer_id": 1,
                "fan_phone": "+254700000999",
                "amount": 250.0,
                "frequency": "monthly",
                "is_active": True
            },
            timeout=10
        )
        
        if response.status_code == 201:
            print("✅ Subscription created successfully!")
            data = response.json()
            print(f"   📊 ID: {data.get('subscription', {}).get('id')}")
            print(f"   📱 Phone: {data.get('subscription', {}).get('fan_phone')}")
            print(f"   💰 Amount: {data.get('subscription', {}).get('amount')}")
        else:
            print(f"❌ Failed to create subscription: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error creating subscription: {e}")
    
    print("\n🎉 Subscribers testing completed!")
    return True

def main():
    """Main function"""
    print("🚀 USSD Credit - Subscribers Testing")
    print("=" * 60)
    
    # Configuration
    API_BASE_URL = "https://ussd-credit-production.up.railway.app"
    
    print(f"🎯 Target API: {API_BASE_URL}")
    print()
    
    # Run tests
    success = test_subscribers(API_BASE_URL)
    
    if success:
        print(f"\n✅ All tests passed! You can now:")
        print(f"   🔗 List subscribers: GET {API_BASE_URL}/api/subscribers")
        print(f"   🔗 Create subscription: POST {API_BASE_URL}/api/subscribers")
        print(f"   🔗 Populate demo: POST {API_BASE_URL}/api/subscribers/populate-demo")
    else:
        print(f"\n❌ Some tests failed. Check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
