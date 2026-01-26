from pydantic import BaseModel
from typing import Literal, Optional, List

class CreateSessionRequest(BaseModel):
    user_id: str
    scenario_type: Literal["salary_raise", "promotion", "client_negotiation"]
    difficulty: Literal["beginner", "intermediate", "advanced"]

class SendMessageRequest(BaseModel):
    content: str

class SessionResponse(BaseModel):
    session_id: str
    status: str
    opponent_mood: str
    opponent_patience: int
    current_leverage: int
    turn_number: int

class MessageResponse(BaseModel):
    opponent_response: str
    opponent_mood: str
    opponent_patience: int
    current_leverage: int
    turn_number: int
    conversation_stage: str

class AnalysisResponse(BaseModel):
    overall_outcome: str
    executive_summary: str
    strengths: List[dict]
    mistakes: List[dict]
    pivotal_moments: List[dict]
    patterns_identified: List[str]
    focus_areas: List[str]
    leverage_trajectory: List[int]
    mood_trajectory: List[str]
