from fastapi import APIRouter, HTTPException
import uuid
from .models import (
    CreateSessionRequest,
    SendMessageRequest,
    SessionResponse,
    MessageResponse,
    AnalysisResponse
)
from .agents import (
    scenario_designer_agent,
    opponent_agent,
    shadow_coach_agent,
    analyst_agent
)
from .database import get_sessions_collection, get_turns_collection, get_analyses_collection
from datetime import datetime

router = APIRouter(prefix="/api", tags=["negotiation"])

# In-memory state storage (in production, use Redis or similar)
active_sessions = {}

@router.post("/sessions", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest):
    """Create a new negotiation session using simplified agents."""
    
    print(f"DEBUG: Received request - user_id: {request.user_id}, scenario: {request.scenario_type}, difficulty: {request.difficulty}")
    
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    
    # Run scenario designer agent
    scenario_config = scenario_designer_agent(
        scenario_type=request.scenario_type,
        difficulty=request.difficulty
    )
    
    # Initialize session state
    session_state = {
        "session_id": session_id,
        "user_id": request.user_id,
        "scenario_type": request.scenario_type,
        "difficulty": request.difficulty,
        "personality": scenario_config["personality"],
        "constraints": scenario_config["constraints"],
        "batna": scenario_config["batna"],
        "mood": "curious",
        "patience": scenario_config["patience"],
        "leverage": 50,
        "turn_number": 0,
        "history": [
            {"role": "assistant", "content": scenario_config["opening_message"]}
        ],
        "leverage_trajectory": [50],
        "mood_trajectory": ["curious"]
    }
    
    # Store in memory
    active_sessions[session_id] = session_state
    
    # Save to MongoDB
    sessions_col = get_sessions_collection()
    sessions_col.insert_one({
        "session_id": session_id,
        "user_id": request.user_id,
        "scenario_type": request.scenario_type,
        "difficulty": request.difficulty,
        "status": "active",
        "created_at": datetime.utcnow(),
        "opponent_personality": scenario_config["personality"],
        "opponent_constraints": scenario_config["constraints"]
    })
    
    return SessionResponse(
        session_id=session_id,
        status="active",
        opponent_mood="curious",
        opponent_patience=scenario_config["patience"],
        current_leverage=50,
        turn_number=0
    )

@router.post("/sessions/{session_id}/message", response_model=MessageResponse)
async def send_message(session_id: str, request: SendMessageRequest):
    """Send a user message and get opponent response + real-time coach tip."""
    
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    state = active_sessions[session_id]
    
    # Add user message to history
    state["history"].append({"role": "user", "content": request.content})
    
    # Get opponent response
    opponent_result = opponent_agent(
        user_message=request.content,
        history=state["history"],
        scenario_type=state["scenario_type"],
        personality=state["personality"],
        mood=state["mood"],
        patience=state["patience"],
        constraints=state["constraints"],
        batna=state["batna"],
        current_leverage=state["leverage"]  # Pass current leverage
    )
    
    # Get real-time coach tip
    coach_tip = shadow_coach_agent(
        user_message=request.content,
        context={
            "leverage": opponent_result["new_leverage"],
            "mood": opponent_result["new_mood"],
            "patience": opponent_result["new_patience"]
        }
    )
    
    # Update state
    state["history"].append({"role": "assistant", "content": opponent_result["opponent_reply"]})
    state["mood"] = opponent_result["new_mood"]
    state["patience"] = opponent_result["new_patience"]
    state["leverage"] = opponent_result["new_leverage"]
    state["turn_number"] += 1
    state["leverage_trajectory"].append(opponent_result["new_leverage"])
    state["mood_trajectory"].append(opponent_result["new_mood"])
    
    # Save turn to MongoDB
    turns_col = get_turns_collection()
    turns_col.insert_one({
        "session_id": session_id,
        "turn_number": state["turn_number"],
        "user_message": request.content,
        "opponent_response": opponent_result["opponent_reply"],
        "coach_tip": coach_tip,
        "opponent_mood": opponent_result["new_mood"],
        "opponent_patience": opponent_result["new_patience"],
        "calculated_leverage": opponent_result["new_leverage"],
        "timestamp": datetime.utcnow()
    })
    
    return MessageResponse(
        opponent_response=opponent_result["opponent_reply"],
        coach_tip=coach_tip,  # NEW: Real-time coaching
        opponent_mood=opponent_result["new_mood"],
        opponent_patience=opponent_result["new_patience"],
        current_leverage=opponent_result["new_leverage"],
        turn_number=state["turn_number"],
        conversation_stage="middle" if state["patience"] > 30 else "closing"
    )

@router.post("/sessions/{session_id}/end", response_model=AnalysisResponse)
async def end_session(session_id: str):
    """End the session and get comprehensive analysis."""
    
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    state = active_sessions[session_id]
    
    # Run analyst agent
    analysis = analyst_agent(
        history=state["history"],
        scenario_type=state["scenario_type"],
        final_leverage=state["leverage"],
        final_patience=state["patience"],
        leverage_trajectory=state["leverage_trajectory"],
        mood_trajectory=state["mood_trajectory"]
    )
    
    # Save analysis to MongoDB
    analyses_col = get_analyses_collection()
    analyses_col.insert_one({
        "session_id": session_id,
        "summary": analysis.get("summary", "Analysis completed."),
        "outcome": analysis.get("outcome", "Unknown"),
        "strengths": analysis.get("strengths", []),
        "mistakes": analysis.get("mistakes", []),
        "skill_gaps": analysis.get("skill_gaps", []),
        "leverage_trajectory": state["leverage_trajectory"],
        "mood_trajectory": state["mood_trajectory"],
        "generated_at": datetime.utcnow()
    })
    
    # Update session status
    sessions_col = get_sessions_collection()
    sessions_col.update_one(
        {"session_id": session_id},
        {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
    )
    
    # Clean up memory
    del active_sessions[session_id]
    
    return AnalysisResponse(
        summary=analysis.get("summary", "Analysis completed."),
        outcome=analysis.get("outcome", "Unknown"),
        strengths=analysis.get("strengths", []),
        mistakes=analysis.get("mistakes", []),
        skill_gaps=analysis.get("skill_gaps", []),
        leverage_trajectory=state["leverage_trajectory"],
        mood_trajectory=state["mood_trajectory"]
    )

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session details from database."""
    
    sessions_col = get_sessions_collection()
    session = sessions_col.find_one({"session_id": session_id}, {"_id": 0})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session

@router.get("/users/{user_id}/sessions")
async def get_user_sessions(user_id: str):
    """Get all sessions for a user."""
    
    sessions_col = get_sessions_collection()
    sessions = list(sessions_col.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1))
    
    return {"sessions": sessions}

@router.get("/sessions/{session_id}/analysis", response_model=AnalysisResponse)
async def get_analysis(session_id: str):
    """Get analysis for a completed session."""
    
    analyses_col = get_analyses_collection()
    analysis = analyses_col.find_one({"session_id": session_id}, {"_id": 0})
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return AnalysisResponse(
        summary=analysis.get("summary", "Analysis completed."),
        outcome=analysis.get("outcome", "Unknown"),
        strengths=analysis.get("strengths", []),
        mistakes=analysis.get("mistakes", []),
        skill_gaps=analysis.get("skill_gaps", []),
        leverage_trajectory=analysis.get("leverage_trajectory", []),
        mood_trajectory=analysis.get("mood_trajectory", [])
    )
