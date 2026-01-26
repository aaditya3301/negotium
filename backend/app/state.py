from typing import TypedDict, Annotated, Sequence, List, Literal
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class NegotiationState(TypedDict):
    """State schema for the negotiation system."""
    
    # Message history
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
    # Session metadata
    session_id: str
    user_id: str
    scenario_type: Literal["salary_raise", "promotion", "client_negotiation"]
    difficulty: Literal["beginner", "intermediate", "advanced"]
    
    # Opponent state
    opponent_mood: Literal["curious", "neutral", "defensive", "hostile"]
    opponent_patience: int  # 0-100
    opponent_personality: str
    opponent_constraints: dict  # Hidden constraints (budget, policies, etc.)
    opponent_batna: str  # Best Alternative To Negotiated Agreement
    
    # Turn metrics
    turn_number: int
    current_leverage: int  # 0-100 (user's leverage)
    current_rapport: int  # 0-100
    conversation_stage: Literal["opening", "middle", "closing", "ended"]
    
    # Analysis (populated by Shadow Coach)
    shadow_coach_feedback: dict
    leverage_trajectory: List[int]
    mood_trajectory: List[str]
    
    # Control flow
    next_action: Literal["opponent", "shadow_coach", "end"]
