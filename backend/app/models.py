from pydantic import BaseModel, field_validator
from typing import Literal, Optional, List

class CreateSessionRequest(BaseModel):
    user_id: str
    scenario_type: str  # Accept any string
    difficulty: str  # Accept any string
    
    @field_validator('difficulty')
    @classmethod
    def normalize_difficulty(cls, v: str) -> str:
        """Convert difficulty to lowercase"""
        return v.lower()
    
    @field_validator('scenario_type')
    @classmethod
    def validate_scenario(cls, v: str) -> str:
        """Validate and normalize scenario type"""
        return v.lower()

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
    coach_tip: str  # NEW: Real-time coaching tip
    opponent_mood: str
    opponent_patience: int
    current_leverage: int
    turn_number: int
    conversation_stage: str

class AnalysisResponse(BaseModel):
    summary: str
    outcome: str
    strengths: List[dict]
    mistakes: List[dict]
    skill_gaps: List[str]
    leverage_trajectory: List[int]
    mood_trajectory: List[str]
