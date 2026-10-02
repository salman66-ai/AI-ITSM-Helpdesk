import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set in .env")

client = MongoClient(MONGODB_URI)

db = client["ai_itsm_helpdesk"]

tickets_collection = db["tickets"]
knowledge_collection = db["knowledge"]
chat_collection = db["chat"]
audit_collection = db["audit_logs"]
software_requests_collection = db["software_requests"]