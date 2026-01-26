from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from opik import track
from state import NegotiationState
from config import get_settings
import json

settings = get_settings()

@track(project_name="negotium", tags=["shadow_coach"])
def shadow_coach_node(state: NegotiationState) -> dict:
    """
    Agent 3: Shadow Coach
    Analyzes the completed negotiation and provides actionable feedback.
    """
    
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,  # Lower temperature for more consistent analysis
        api_key=settings.groq_api_key
    )
    
    # Build full conversation transcript
    conversation = "\n".join([
        f"Turn {i//2 + 1} - {'User' if isinstance(msg, HumanMessage) else 'Manager'}: {msg.content}"
        for i, msg in enumerate(state["messages"])
    ])
    
    final_leverage = state["current_leverage"]
    final_patience = state["opponent_patience"]
    
    # Determine overall outcome
    if final_leverage >= 70 and final_patience >= 40:
        outcome = "success"
    elif final_leverage >= 50 or final_patience >= 30:
        outcome = "partial_success"
    else:
        outcome = "failure"
    
    prompt = f"""You are an expert negotiation coach analyzing a completed {state['scenario_type']} session.

CONVERSATION TRANSCRIPT:
{conversation}

FINAL METRICS:
- User Leverage: {final_leverage}/100
- Opponent Patience: {final_patience}/100
- Total Turns: {state['turn_number']}
- Leverage Trajectory: {state['leverage_trajectory']}
- Mood Progression: {state['mood_trajectory']}

Provide structured, actionable coaching feedback in this EXACT JSON format:
{{
  "overall_outcome": "success|partial_success|failure",
  "executive_summary": "2-sentence assessment of overall performance",
  "strengths": [
    {{"point": "Specific strength", "turn": 3, "example": "exact quote or description"}},
    {{"point": "Another strength", "turn": 5, "example": "exact quote or description"}}
  ],
  "mistakes": [
    {{"point": "Critical error", "turn": 7, "impact": "how it hurt leverage", "example": "exact quote"}},
    {{"point": "Another mistake", "turn": 2, "impact": "specific consequence", "example": "exact quote"}}
  ],
  "pivotal_moments": [
    {{"turn": 4, "what_happened": "description", "analysis": "why this was pivotal", "better_approach": "specific alternative"}}
  ],
  "patterns_identified": [
    "Apologized 3 times (turns 2, 5, 8) - weakening language",
    "Anchored first in turn 3 - lost leverage opportunity"
  ],
  "focus_areas": [
    "Practice letting opponent anchor first",
    "Replace 'sorry' with 'I understand'"
  ]
}}

BE SPECIFIC. Reference exact turns. Provide actionable advice."""
    
    response = llm.invoke(prompt)
    feedback = json.loads(response.content)
    
    return {
        "shadow_coach_feedback": feedback,
        "conversation_stage": "ended",
        "next_action": "end"
    }
