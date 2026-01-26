from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from opik import track
from state import NegotiationState
from config import get_settings
import json

settings = get_settings()

@track(project_name="negotium", tags=["scenario_design"])
def scenario_designer_node(state: NegotiationState) -> dict:
    """
    Agent 1: Scenario Designer
    Initializes the negotiation with appropriate difficulty configuration.
    """
    
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        api_key=settings.groq_api_key
    )
    
    difficulty = state["difficulty"]
    scenario = state["scenario_type"]
    
    prompt = f"""You are a negotiation scenario designer. Create a realistic {scenario} scenario at {difficulty} difficulty level.

Design the opponent:
1. Personality archetype (choose from: collaborative, assertive, resistant, bureaucratic)
2. Initial patience level (0-100)
3. Hidden constraints (budget limits, company policies, market conditions)
4. BATNA (Best Alternative To Negotiated Agreement)
5. Opening statement (natural, in-character)

Return ONLY valid JSON in this exact format:
{{
  "personality": "assertive",
  "patience": 75,
  "constraints": {{
    "budget_max": 120000,
    "policy": "raises capped at 10%"
  }},
  "batna": "hire external candidate at market rate",
  "opening": "Hi! I understand you wanted to discuss your compensation?"
}}"""
    
    response = llm.invoke(prompt)
    config = json.loads(response.content)
    
    # Set initial patience based on difficulty
    initial_patience = {
        "beginner": 80,
        "intermediate": 60,
        "advanced": 40
    }
    
    return {
        "opponent_mood": "curious",
        "opponent_patience": initial_patience[difficulty],
        "opponent_personality": config["personality"],
        "opponent_constraints": config["constraints"],
        "opponent_batna": config["batna"],
        "messages": [AIMessage(content=config["opening"])],
        "turn_number": 0,
        "current_leverage": 50,
        "current_rapport": 50,
        "conversation_stage": "opening",
        "leverage_trajectory": [50],
        "mood_trajectory": ["curious"],
        "next_action": "opponent"
    }
