from pymongo import MongoClient
from config import get_settings

settings = get_settings()

# MongoDB client singleton
def get_mongodb_client():
    return MongoClient(settings.mongodb_uri)

def get_database():
    client = get_mongodb_client()
    return client.negotium

# Collections
def get_users_collection():
    db = get_database()
    return db.users

def get_sessions_collection():
    db = get_database()
    return db.sessions

def get_turns_collection():
    db = get_database()
    return db.turns

def get_analyses_collection():
    db = get_database()
    return db.analyses

def get_profiles_collection():
    db = get_database()
    return db.profiles
