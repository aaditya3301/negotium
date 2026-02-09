from app.database import get_sessions_collection, get_turns_collection, get_analyses_collection

sessions = get_sessions_collection()
turns = get_turns_collection()
analyses = get_analyses_collection()

session_count = sessions.count_documents({})
turn_count = turns.count_documents({})
analysis_count = analyses.count_documents({})

print(f"Deleting {session_count} sessions, {turn_count} turns, {analysis_count} analyses...")

sessions.delete_many({})
turns.delete_many({})
analyses.delete_many({})

print("✅ All data cleared! Starting fresh.")
