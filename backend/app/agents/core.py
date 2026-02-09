"""All agent functions in one file"""
from langchain_groq import ChatGroq
from ..config import get_settings
import json
from typing import List, Dict, Any

settings = get_settings()
MAIN_MODEL = "llama-3.3-70b-versatile"
COACH_MODEL = "llama-3.1-8b-instant"

def scenario_designer_agent(scenario_type: str, difficulty: str) -> Dict[str, Any]:
    llm = ChatGroq(model=MAIN_MODEL, temperature=0.7, api_key=settings.groq_api_key)
    prompt = f"""You are a negotiation scenario designer. Create a realistic {scenario_type} scenario at {difficulty} difficulty level.

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
    initial_patience_map = {"beginner": 80, "intermediate": 60, "advanced": 40}
    return {
        "personality": config["personality"],
        "patience": initial_patience_map.get(difficulty, 70),
        "constraints": config["constraints"],
        "batna": config["batna"],
        "opening_message": config["opening"]
    }

def opponent_agent(user_message: str, history: List[Dict[str, str]], scenario_type: str, personality: str, mood: str, patience: int, constraints: Dict, batna: str, current_leverage: int) -> Dict[str, Any]:
    llm = ChatGroq(model=MAIN_MODEL, temperature=0.8, api_key=settings.groq_api_key)
    patience_delta = _calculate_patience_change(user_message)
    new_patience = max(0, min(100, patience + patience_delta))
    new_mood = _determine_mood(new_patience)
    recent_history = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history[-6:]])
    mood_instructions = {
        "curious": "You're interested and open to discussion. Ask clarifying questions.",
        "neutral": "You're professional but reserved. Give measured responses.",
        "defensive": "You're starting to push back. Reference constraints and policies.",
        "hostile": "You're losing patience. Consider ending the conversation or giving ultimatums."
    }
    prompt = f"""You are a {personality} manager in a {scenario_type} negotiation.

Your current state:
- Mood: {new_mood} ({mood_instructions.get(new_mood, 'professional')})
- Patience: {new_patience}/100
- Hidden constraints: {json.dumps(constraints)}
- BATNA: {batna}

Recent conversation:
{recent_history}

User just said: "{user_message}"

Respond naturally in character. Keep it under 100 words. DO NOT reveal exact constraint numbers unless user has earned it through strong negotiation."""
    response = llm.invoke(prompt)
    new_leverage = _calculate_leverage(user_message, response.content, history, current_leverage)
    return {
        "opponent_reply": response.content,
        "new_mood": new_mood,
        "new_patience": new_patience,
        "new_leverage": new_leverage
    }

def shadow_coach_agent(user_message: str, context: Dict[str, Any]) -> str:
    llm = ChatGroq(model=COACH_MODEL, temperature=0.5, api_key=settings.groq_api_key)
    leverage = context.get("leverage", 50)
    mood = context.get("mood", "neutral")
    patience = context.get("patience", 50)
    prompt = f"""You are a negotiation coach. Analyze the user's message and give ONE short tactical tip (max 20 words).

User's message: "{user_message}"

Context:
- Current leverage: {leverage}/100
- Opponent mood: {mood}
- Opponent patience: {patience}/100

Provide a specific, actionable tip. Examples:
- "Anchor high - state a specific number first."
- "Ask about their constraints before revealing yours."
- "Mirror their language to build rapport."

Your tip (max 20 words):"""
    response = llm.invoke(prompt)
    return response.content.strip()

def analyst_agent(history: List[Dict[str, str]], scenario_type: str, final_leverage: int, final_patience: int, leverage_trajectory: List[int], mood_trajectory: List[str]) -> Dict[str, Any]:
    llm = ChatGroq(model=MAIN_MODEL, temperature=0.3, api_key=settings.groq_api_key)
    transcript = "\n".join([f"Turn {i//2 + 1} - {msg['role'].capitalize()}: {msg['content']}" for i, msg in enumerate(history)])
    if final_leverage >= 70 and final_patience >= 40:
        outcome = "Success"
    elif final_leverage >= 50 or final_patience >= 30:
        outcome = "Partial Success"
    else:
        outcome = "Failure"
    prompt = f"""You are an expert negotiation coach analyzing a completed {scenario_type} session.

CONVERSATION TRANSCRIPT:
{transcript}

FINAL METRICS:
- User Leverage: {final_leverage}/100
- Opponent Patience: {final_patience}/100
- Total Turns: {len(history)//2}
- Leverage Trajectory: {leverage_trajectory}
- Mood Progression: {mood_trajectory}

Provide structured coaching feedback in this EXACT JSON format:
{{
  "summary": "2-3 sentence overall assessment of their negotiation approach and outcome. Focus on strategy quality, communication style, and whether they achieved a good result. Avoid just listing metrics.",
  "outcome": "{outcome}",
  "strengths": [
    {{"point": "Specific strength title", "explanation": "Why this was effective - include numbers/percentages when relevant"}},
    {{"point": "Another strength", "explanation": "Details with specific examples from transcript"}}
  ],
  "mistakes": [
    {{"point": "Critical error", "explanation": "Why this hurt their position - quantify impact if possible (e.g., 'dropped leverage by 15%')"}},
    {{"point": "Another mistake", "explanation": "Specific consequence with numbers"}}
  ],
  "skill_gaps": ["Anchoring", "Active Listening", "BATNA Development"]
}}

BE SPECIFIC. Use actual quotes from transcript. In the summary, focus on overall approach quality and negotiation outcome, NOT just listing final leverage/patience numbers. Include strategic insights. Output ONLY valid JSON, no markdown."""
    try:
        response = llm.invoke(prompt)
        content = response.content.strip()
        # Remove markdown code blocks if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        result = json.loads(content)
        # Ensure all required fields exist
        if not result.get("strengths"):
            result["strengths"] = [{"point": "Session Completion", "explanation": "You completed the negotiation session."}]
        if not result.get("mistakes"):
            result["mistakes"] = [{"point": "Limited engagement", "explanation": "Session ended before full negotiation tactics could be demonstrated."}]
        if not result.get("skill_gaps"):
            result["skill_gaps"] = ["Anchoring", "Active Listening"]
        return result
    except Exception as e:
        print(f"ERROR in analyst_agent: {e}")
        return {
            "summary": f"Completed {scenario_type} negotiation with {len(history)//2} turns. Final leverage: {final_leverage}%.", 
            "outcome": outcome, 
            "strengths": [
                {"point": "Engagement", "explanation": "You actively participated in the negotiation."},
                {"point": "Persistence", "explanation": "You continued the dialogue through multiple turns."}
            ], 
            "mistakes": [
                {"point": "Analysis Error", "explanation": "Detailed analysis could not be generated. Try with more conversation turns."}
            ], 
            "skill_gaps": ["Anchoring", "Active Listening", "BATNA Development"]
        }

def _calculate_patience_change(user_message: str) -> int:
    msg_lower = user_message.lower()
    if any(word in msg_lower for word in ["demand", "deserve", "must", "will not"]):
        return -10
    elif any(word in msg_lower for word in ["ultimatum", "competitor", "leaving"]):
        return -15
    elif msg_lower.count("i") > 5:
        return -5
    if any(phrase in msg_lower for phrase in ["understand", "appreciate", "help me understand"]):
        return +5
    elif "?" in user_message:
        return +3
    elif any(word in msg_lower for word in ["we", "together", "both"]):
        return +5
    return 0

def _determine_mood(patience: int) -> str:
    if patience >= 70:
        return "curious"
    elif patience >= 50:
        return "neutral"
    elif patience >= 30:
        return "defensive"
    else:
        return "hostile"

def _calculate_leverage(user_message: str, opponent_response: str, history: List[Dict], current_leverage: int) -> int:
    leverage = current_leverage
    msg_lower = user_message.lower()
    
    # Default small decrease each turn (negotiation is challenging)
    leverage -= 2
    
    # HARSH/DEMANDING LANGUAGE - Severe penalties (checked first, blocks positive gains)
    harsh_detected = False
    
    if any(word in msg_lower for word in ["demand", "must", "will not", "have to", "need to give me", "expect", "require", "insist"]):
        leverage -= 18  # Very demanding = massive leverage loss
        harsh_detected = True
    
    if any(word in msg_lower for word in ["unacceptable", "ridiculous", "joke", "insulting", "terrible", "pathetic", "stupid"]):
        leverage -= 15  # Harsh criticism = massive loss
        harsh_detected = True
    
    if any(word in msg_lower for word in ["ultimatum", "or else", "final offer", "take it or leave it", "last chance"]):
        leverage -= 20  # Threats = extreme loss
        harsh_detected = True
    
    if "deserve" in msg_lower and "because" not in msg_lower:
        leverage -= 12  # Entitlement without justification
        harsh_detected = True
    
    if any(word in msg_lower for word in ["better", "more"]) and "you better" in msg_lower:
        leverage -= 10  # Threatening tone
        harsh_detected = True
    
    # If harsh language detected, skip ALL positive gains
    if harsh_detected:
        import random
        leverage += random.randint(-3, -1)  # Extra penalty variance
        return max(10, min(90, leverage))
    
    # Positive leverage gains (ONLY if no harsh language)
    if "?" in user_message and len([c for c in user_message if c == "?"]) >= 2:
        leverage += 6  # Multiple questions = information gathering
    elif "?" in user_message:
        leverage += 4
    
    if any(word in msg_lower for word in ["achieved", "delivered", "increased", "saved", "results", "proven", "track record"]):
        leverage += 8  # Concrete evidence
    
    if any(char.isdigit() for char in user_message) and any(word in msg_lower for word in ["percent", "%", "increase", "revenue", "saved"]):
        leverage += 9  # Anchoring with numbers
    
    if any(word in msg_lower for word in ["market rate", "industry standard", "benchmark", "comparable"]):
        leverage += 7  # Market comparison
    
    if any(word in msg_lower for word in ["alternative", "offer", "opportunity", "considering"]):
        leverage += 6  # BATNA signal
    
    # Other negative behaviors
    if msg_lower.count("sorry") > 0 or "apologize" in msg_lower:
        leverage -= 8
    
    if any(word in msg_lower for word in ["please", "really hope", "would appreciate", "beg"]):
        leverage -= 6  # Too submissive
    
    if any(word in msg_lower for word in ["fair", "reasonable", "just want"]):
        leverage -= 4  # Weak framing
    
    # Natural variance
    import random
    leverage += random.randint(-2, 1)  # Slightly negative bias
    
    return max(10, min(90, leverage))
