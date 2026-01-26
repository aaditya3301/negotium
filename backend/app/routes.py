from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage
import uuid
from models import (
    CreateSessionRequest,
    SendMessageRequest,
    SessionResponse,
    MessageResponse,
    AnalysisResponse
)
from workflow import negotiation_app
from database import get_sessions_collection, get_turns_collection, get_analyses_collection
from datetime import datetime

router = APIRouter(prefix="/api", tags=["negotiation"])

# In-memory state storage (in production, use Redis or similar)
active_sessions = {}

@router.post("/sessions", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest):
    """Create a new negotiation session."""
    
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    
    # Initialize state
    initial_state = {
        "session_id": session_id,
        "user_id": request.user_id,
        "scenario_type": request.scenario_type,
        "difficulty": request.difficulty,
        "messages": [],
        "turn_number": 0,
        "conversation_stage": "opening",
        "next_action": "opponent"
    }
    
    # Run ONLY scenario designer to initialize (not full workflow)
    from agents.scenario_designer import scenario_designer_node
    result = scenario_designer_node(initial_state)
    
    # Merge result with initial state
    initial_state.update(result)
    
    # Store in memory
    active_sessions[session_id] = initial_state
    
    # Save to MongoDB
    sessions_col = get_sessions_collection()
    sessions_col.insert_one({
        "session_id": session_id,
        "user_id": request.user_id,
        "scenario_type": request.scenario_type,
        "difficulty": request.difficulty,
        "status": "active",
        "created_at": datetime.utcnow(),
        "opponent_personality": result.get("opponent_personality"),
        "opponent_constraints": result.get("opponent_constraints")
    })
    
    return SessionResponse(
        session_id=session_id,
        status="active",
        opponent_mood=result["opponent_mood"],
        opponent_patience=result["opponent_patience"],
        current_leverage=result["current_leverage"],
        turn_number=result["turn_number"]
    )

@router.post("/sessions/{session_id}/message", response_model=MessageResponse)
async def send_message(session_id: str, request: SendMessageRequest):
    """Send a user message and get opponent response."""
    
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    current_state = active_sessions[session_id]
    
    # Add user message to state
    current_state["messages"].append(HumanMessage(content=request.content))
    
    # Run opponent agent directly
    from agents.opponent import opponent_agent_node
    result = opponent_agent_node(current_state)
    
    # Update state with result
    current_state.update(result)
    
    # Update session
    active_sessions[session_id] = current_state
    
    # Save turn to MongoDB
    turns_col = get_turns_collection()
    turns_col.insert_one({
        "session_id": session_id,
        "turn_number": result["turn_number"],
        "user_message": request.content,
        "opponent_response": result["messages"][-1].content,
        "opponent_mood": result["opponent_mood"],
        "opponent_patience": result["opponent_patience"],
        "calculated_leverage": result["current_leverage"],
        "timestamp": datetime.utcnow()
    })
    
    return MessageResponse(
        opponent_response=result["messages"][-1].content,
        opponent_mood=result["opponent_mood"],
        opponent_patience=result["opponent_patience"],
        current_leverage=result["current_leverage"],
        turn_number=result["turn_number"],
        conversation_stage=result.get("conversation_stage", "middle")
    )

@router.post("/sessions/{session_id}/end", response_model=AnalysisResponse)
async def end_session(session_id: str):
    """End the session and get Shadow Coach analysis."""
    
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    current_state = active_sessions[session_id]
    current_state["conversation_stage"] = "ended"
    current_state["next_action"] = "end"
    
    # Run shadow coach directly
    from agents.shadow_coach import shadow_coach_node
    result = shadow_coach_node(current_state)
    
    # Merge results
    current_state.update(result)
    
    feedback = result["shadow_coach_feedback"]
    
    # Save analysis to MongoDB
    analyses_col = get_analyses_collection()
    analyses_col.insert_one({
        "session_id": session_id,
        "feedback": feedback,
        "leverage_trajectory": current_state["leverage_trajectory"],
        "mood_trajectory": current_state["mood_trajectory"],
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
        overall_outcome=feedback["overall_outcome"],
        executive_summary=feedback["executive_summary"],
        strengths=feedback["strengths"],
        mistakes=feedback["mistakes"],
        pivotal_moments=feedback["pivotal_moments"],
        patterns_identified=feedback["patterns_identified"],
        focus_areas=feedback["focus_areas"],
        leverage_trajectory=current_state["leverage_trajectory"],
        mood_trajectory=current_state["mood_trajectory"]
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
    
    feedback = analysis["feedback"]
    
    return AnalysisResponse(
        overall_outcome=feedback["overall_outcome"],
        executive_summary=feedback["executive_summary"],
        strengths=feedback["strengths"],
        mistakes=feedback["mistakes"],
        pivotal_moments=feedback["pivotal_moments"],
        patterns_identified=feedback["patterns_identified"],
        focus_areas=feedback["focus_areas"],
        leverage_trajectory=analysis["leverage_trajectory"],
        mood_trajectory=analysis["mood_trajectory"]
    )
