from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from opik import track
from state import NegotiationState
from config import get_settings

settings = get_settings()

def calculate_patience_change(user_message: str, state: NegotiationState) -> int:
    """Calculate how much opponent patience changes based on user's message."""
    
    # Negative triggers
    if any(word in user_message.lower() for word in ["demand", "deserve", "must", "will not"]):
        return -10
    elif any(word in user_message.lower() for word in ["ultimatum", "competitor", "leaving"]):
        return -15
    elif user_message.count("I") > 3:  # Too self-focused
        return -5
    
    # Positive triggers
    if any(phrase in user_message.lower() for phrase in ["understand", "appreciate", "help me understand"]):
        return +5
    elif "?" in user_message:  # Asking questions
        return +3
    elif any(word in user_message.lower() for word in ["we", "together", "both"]):
        return +5
    
    return 0

def determine_mood(patience: int, current_mood: str) -> str:
    """Determine opponent mood based on patience level."""
    if patience >= 70:
        return "curious"
    elif patience >= 50:
        return "neutral"
    elif patience >= 30:
        return "defensive"
    else:
        return "hostile"

def calculate_leverage(user_message: str, opponent_response: str, state: NegotiationState) -> int:
    """Estimate user's leverage based on conversation dynamics."""
    
    leverage = state.get("current_leverage", 50)
    
    # User gains leverage if:
    # - Asks strategic questions
    if "?" in user_message:
        leverage += 3
    
    # - Provides concrete value/evidence
    if any(word in user_message.lower() for word in ["achieved", "delivered", "increased", "saved"]):
        leverage += 5
    
    # - Stays calm under pressure
    if state["opponent_patience"] < 50 and "sorry" not in user_message.lower():
        leverage += 3
    
    # User loses leverage if:
    # - Apologizes excessively
    if user_message.lower().count("sorry") > 0:
        leverage -= 5
    
    # - Shows desperation
    if any(word in user_message.lower() for word in ["please", "need", "really hope"]):
        leverage -= 3
    
    # - Anchors first (mentions specific number)
    if any(char.isdigit() for char in user_message) and state["turn_number"] < 3:
        leverage -= 8
    
    return max(0, min(100, leverage))

@track(project_name="negotium", tags=["opponent_response"])
def opponent_agent_node(state: NegotiationState) -> dict:
    """
    Agent 2: Opponent Agent
    Responds to user's message while managing mood and patience.
    """
    
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.8,
        api_key=settings.groq_api_key
    )
    
    # Get user's last message
    user_msg = [msg for msg in state["messages"] if isinstance(msg, HumanMessage)][-1].content
    
    # Update patience
    patience_delta = calculate_patience_change(user_msg, state)
    new_patience = max(0, min(100, state["opponent_patience"] + patience_delta))
    
    # Update mood
    new_mood = determine_mood(new_patience, state["opponent_mood"])
    
    # Build context-aware prompt
    conversation_history = "\n".join([
        f"{'User' if isinstance(msg, HumanMessage) else 'Manager'}: {msg.content}"
        for msg in state["messages"][-6:]  # Last 3 exchanges
    ])
    
    mood_instructions = {
        "curious": "You're interested and open to discussion. Ask clarifying questions.",
        "neutral": "You're professional but reserved. Give measured responses.",
        "defensive": "You're starting to push back. Reference constraints and policies.",
        "hostile": "You're losing patience. Consider ending the conversation or giving ultimatums."
    }
    
    prompt = f"""You are a {state['opponent_personality']} manager in a {state['scenario_type']} negotiation.

Your current state:
- Mood: {new_mood} ({mood_instructions[new_mood]})
- Patience: {new_patience}/100
- Hidden constraints: {state['opponent_constraints']}
- BATNA: {state['opponent_batna']}

Recent conversation:
{conversation_history}

User just said: "{user_msg}"

Respond naturally in character. Keep it under 100 words. DO NOT reveal exact constraint numbers unless user has earned it through strong negotiation."""
    
    response = llm.invoke(prompt)
    
    # Calculate leverage
    new_leverage = calculate_leverage(user_msg, response.content, state)
    
    # Update trajectories
    new_leverage_trajectory = state["leverage_trajectory"] + [new_leverage]
    new_mood_trajectory = state["mood_trajectory"] + [new_mood]
    
    # Determine next action
    next_action = "end" if new_patience < 20 else "opponent"
    
    return {
        "messages": [AIMessage(content=response.content)],
        "opponent_patience": new_patience,
        "opponent_mood": new_mood,
        "current_leverage": new_leverage,
        "turn_number": state["turn_number"] + 1,
        "leverage_trajectory": new_leverage_trajectory,
        "mood_trajectory": new_mood_trajectory,
        "next_action": next_action
    }
