import os
from pymongo import MongoClient
from bcrypt import hashpw, gensalt
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillswap")

def seed_data():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    
    # Clear existing
    db.users.delete_many({})
    db.requests.delete_many({})
    print("Cleared existing data.")
    
    hashed_password = hashpw("password123".encode('utf-8'), gensalt()).decode('utf-8')
    
    # Admin
    admin = {
        'name': 'Shrushti Patil',
        'email': 'shrushtipatil2905@gmail.com',
        'password': hashed_password,
        'role': 'admin',
        'skillsOffered': ['Management', 'Architecture'],
        'skillsWanted': ['None'],
        'isBlocked': False,
        'createdAt': datetime.utcnow()
    }
    
    admin_id = db.users.insert_one(admin).inserted_id
    print(f"Created Admin: {admin['email']}")
    
    # Users
    dummy_users = [
        {
            'name': 'Alice Johnson',
            'email': 'alice@example.com',
            'password': hashed_password,
            'role': 'user',
            'skillsOffered': ['React', 'JavaScript'],
            'skillsWanted': ['Python', 'Flask'],
            'location': 'New York',
            'isBlocked': False,
            'createdAt': datetime.utcnow()
        },
        {
            'name': 'Bob Smith',
            'email': 'bob@example.com',
            'password': hashed_password,
            'role': 'user',
            'skillsOffered': ['Python', 'Data Science'],
            'skillsWanted': ['React', 'UI Design'],
            'location': 'London',
            'isBlocked': False,
            'createdAt': datetime.utcnow()
        }
    ]
    
    user_ids = db.users.insert_many(dummy_users).inserted_ids
    print(f"Created {len(dummy_users)} dummy users.")
    
    # Request
    request = {
        'senderId': user_ids[0],
        'receiverId': user_ids[1],
        'skillOffered': 'React',
        'skillRequested': 'Python',
        'status': 'pending',
        'createdAt': datetime.utcnow()
    }
    
    db.requests.insert_one(request)
    print("Created dummy request.")
    print("Seeding completed!")

if __name__ == '__main__':
    seed_data()
