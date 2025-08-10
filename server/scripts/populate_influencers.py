#!/usr/bin/env python3
"""
Script to populate the system with sample influencers for demo purposes.
This can be run locally or adapted for production use.
"""

import requests
import json

# Sample influencer data
SAMPLE_INFLUENCERS = [
    {
        "name": "Sarah Kimani",
        "phone": "+254700000001",
        "received": 2500,
        "imageUrl": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        "ussd_shortcode": "123"
    },
    {
        "name": "David Ochieng",
        "phone": "+254700000002",
        "received": 1800,
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        "ussd_shortcode": "124"
    },
    {
        "name": "Grace Wanjiku",
        "phone": "+254700000003",
        "received": 3200,
        "imageUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        "ussd_shortcode": "125"
    },
    {
        "name": "Michael Odhiambo",
        "phone": "+254700000004",
        "received": 1500,
        "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        "ussd_shortcode": "126"
    },
    {
        "name": "Faith Akinyi",
        "phone": "+254700000005",
        "received": 4100,
        "imageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        "ussd_shortcode": "127"
    },
    {
        "name": "James Kiprop",
        "phone": "+254700000006",
        "received": 2800,
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        "ussd_shortcode": "128"
    },
    {
        "name": "Mercy Njeri",
        "phone": "+254700000007",
        "received": 3600,
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        "ussd_shortcode": "129"
    }
]

def populate_influencers(api_base_url, admin_token=None):
    """
    Populate the system with sample influencers.
    
    Args:
        api_base_url (str): Base URL of the API (e.g., http://localhost:8000)
        admin_token (str): Admin authentication token (optional for now)
    """
    print(f"🌟 Populating influencers at: {api_base_url}")
    
    headers = {}
    if admin_token:
        headers['Authorization'] = f'Bearer {admin_token}'
    
    success_count = 0
    error_count = 0
    
    for i, influencer_data in enumerate(SAMPLE_INFLUENCERS, 1):
        try:
            print(f"📝 Adding influencer {i}/7: {influencer_data['name']}")
            
            response = requests.post(
                f"{api_base_url}/api/admin/influencers",
                json=influencer_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                print(f"✅ Successfully added: {influencer_data['name']}")
                success_count += 1
            else:
                print(f"❌ Failed to add {influencer_data['name']}: {response.status_code} - {response.text}")
                error_count += 1
                
        except Exception as e:
            print(f"❌ Error adding {influencer_data['name']}: {str(e)}")
            error_count += 1
    
    print(f"\n🎯 Population Complete!")
    print(f"✅ Successfully added: {success_count} influencers")
    print(f"❌ Failed to add: {error_count} influencers")
    
    if success_count > 0:
        print(f"\n📊 Total influencers in system: {success_count + 1} (including the original test influencer)")

if __name__ == "__main__":
    # You can change this URL based on your environment
    API_BASE_URL = "https://ussd-credit-production.up.railway.app"
    
    print("🚀 USSD Credit - Influencer Population Script")
    print("=" * 50)
    
    # For now, we'll try without admin token (the endpoint might not require it yet)
    populate_influencers(API_BASE_URL)
    
    print("\n💡 To use this script with admin authentication:")
    print("   1. Get an admin token from your auth system")
    print("   2. Update the script to include the token")
    print("   3. Run: python scripts/populate_influencers.py")
