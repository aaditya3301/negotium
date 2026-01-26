from langgraph.graph import StateGraph, END
from state import NegotiationState
from agents.scenario_designer import scenario_designer_node
from agents.opponent import opponent_agent_node
from agents.shadow_coach import shadow_coach_node

def create_negotiation_workflow():
    """
    Creates the LangGraph workflow for negotiation.
    
    Flow:
    START -> Scenario Designer -> Opponent <-> Opponent (loop) -> Shadow Coach -> END
    """
    
    # Create graph
    workflow = StateGraph(NegotiationState)
    
    # Add nodes
    workflow.add_node("scenario_designer", scenario_designer_node)
    workflow.add_node("opponent", opponent_agent_node)
    workflow.add_node("shadow_coach", shadow_coach_node)
    
    # Define edges
    workflow.set_entry_point("scenario_designer")
    workflow.add_edge("scenario_designer", "opponent")
    
    # Conditional routing from opponent
    def route_opponent(state: NegotiationState) -> str:
        """Route based on next_action in state."""
        next_action = state.get("next_action", "opponent")
        if next_action == "end" or state.get("conversation_stage") == "ended":
            return "shadow_coach"
        return "opponent"
    
    workflow.add_conditional_edges(
        "opponent",
        route_opponent,
        {
            "opponent": "opponent",  # Continue conversation
            "shadow_coach": "shadow_coach"  # End and analyze
        }
    )
    
    workflow.add_edge("shadow_coach", END)
    
    # Compile
    app = workflow.compile()
    return app

# Create singleton instance
negotiation_app = create_negotiation_workflow()
