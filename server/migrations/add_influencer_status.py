#!/usr/bin/env python3
"""
Migration script to add status field to existing influencers
Run this script to update your existing database schema
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db, mongo_db
from app.models.influencer import Influencer, InfluencerStatus

def migrate_sqlite():
    """Migrate SQLite database"""
    print("Migrating SQLite database...")
    
    # Create new tables with updated schema
    db.create_all()
    
    # Update existing influencers to have 'active' status
    with db.session.begin():
        Influencer.query.update({Influencer.status: InfluencerStatus.ACTIVE.value})
        db.session.commit()
    
    print("SQLite migration completed!")

def migrate_mongodb():
    """Migrate MongoDB database"""
    print("Migrating MongoDB database...")
    
    if mongo_db is None:
        print("MongoDB not available, skipping...")
        return
    
    coll = mongo_db.get_collection("influencers")
    
    # Update all existing documents to have 'active' status
    result = coll.update_many(
        {"status": {"$exists": False}},
        {"$set": {"status": "active"}}
    )
    
    print(f"MongoDB migration completed! Updated {result.modified_count} documents.")

def main():
    """Run the migration"""
    print("Starting influencer status migration...")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Try SQLite migration first
            migrate_sqlite()
        except Exception as e:
            print(f"SQLite migration failed: {e}")
        
        try:
            # Try MongoDB migration
            migrate_mongodb()
        except Exception as e:
            print(f"MongoDB migration failed: {e}")
    
    print("Migration completed!")

if __name__ == "__main__":
    main()
