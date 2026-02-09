# Negotium

An AI-powered negotiation training platform that enables users to practice and master high-stakes negotiation skills through realistic simulations with adaptive AI opponents.

## Overview

Negotium provides a risk-free environment for developing negotiation expertise by simulating realistic scenarios against intelligent AI agents that adapt their behavior based on user interactions. The platform combines real-time performance analysis with comprehensive post-session insights to accelerate skill development.

## Key Features

### Adaptive AI Opponents
Neural agents powered by Groq's Llama 3.3 70B model dynamically adjust their negotiation style, mood, patience, and constraints based on user responses. Each opponent exhibits realistic behavioral patterns including:
- Dynamic leverage calculation influenced by user tactics
- Mood transitions (curious, cooperative, skeptical, frustrated, defensive)
- Patience degradation based on negotiation quality
- Scenario-specific personality traits and constraints

### Real-Time Coaching
The Shadow Coach system provides tactical guidance during active negotiations by:
- Monitoring leverage shifts and sentiment changes
- Analyzing conversational patterns and user tactics
- Delivering contextual tips to improve negotiation outcomes
- Identifying missed opportunities in real-time

### Comprehensive Analytics
Post-session analysis provides detailed performance breakdowns including:
- Negotiation outcome assessment and success factors
- Strengths identification with specific examples
- Areas for improvement with actionable recommendations
- Skill gap analysis with personalized learning paths
- Leverage and mood trajectory visualization
- Turn-by-turn conversation review

### Diverse Scenario Library
Practice across multiple negotiation contexts:
- Salary raise discussions
- Promotion negotiations
- Client rate discussions
- Vendor contract negotiations
- Conflict resolution scenarios

Each scenario includes difficulty tiers (beginner, intermediate, advanced) with progressively complex constraints and behavioral patterns.

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15 with React Server Components
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for fluid UI transitions
- **Authentication**: NextAuth.js with Google OAuth
- **State Management**: React hooks with real-time session synchronization

### Backend Stack
- **API Framework**: FastAPI with async request handling
- **AI Orchestration**: Multi-agent system with specialized roles:
  - Scenario Designer: Generates contextual opponent configurations
  - Opponent Agent: Executes negotiation strategy with dynamic adaptation
  - Shadow Coach: Provides real-time tactical guidance
  - Analyst Agent: Performs comprehensive post-session evaluation
- **Language Model**: Groq API (Llama 3.3 70B Versatile)
- **Database**: MongoDB for session persistence and user data

### Agent Architecture
The platform employs a specialized multi-agent system where each agent handles distinct responsibilities:

**Scenario Designer Agent**
- Generates opponent personality profiles
- Defines scenario-specific constraints and BATNA
- Sets initial negotiation parameters (mood, patience, leverage)

**Opponent Agent**
- Executes negotiation dialogue with contextual awareness
- Tracks conversation history and user tactics
- Calculates leverage based on harsh language detection, evidence usage, and tactical quality
- Manages mood transitions and patience degradation

**Shadow Coach Agent**
- Monitors negotiation state in real-time
- Provides tactical recommendations based on current leverage and opponent mood
- Suggests optimal negotiation moves

**Analyst Agent**
- Evaluates final negotiation outcomes
- Identifies user strengths and weaknesses
- Recommends personalized skill development paths
- Generates visual performance trajectories

## Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB instance
- Groq API key

### Environment Configuration

Create `.env.local` in the project root:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
MONGODB_URI=your-mongodb-connection-string
```

Create `.env` in the `backend/` directory:
```
GROQ_API_KEY=your-groq-api-key
MONGODB_URI=your-mongodb-connection-string
```

### Frontend Setup
```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## Usage

1. **Authentication**: Sign in using Google OAuth
2. **Scenario Selection**: Choose a negotiation type and difficulty level
3. **Active Negotiation**: Engage with the AI opponent while receiving real-time coaching
4. **Performance Review**: Analyze detailed metrics and recommendations post-session
5. **Skill Development**: Access personalized learning resources based on identified gaps

## Database Schema

### Sessions Collection
Stores negotiation session metadata and state:
- `session_id`: Unique session identifier
- `user_id`: User email from authentication
- `scenario_type`: Negotiation context
- `difficulty`: Complexity level
- `status`: Session state (active/completed)
- `created_at`: Session start timestamp (UTC)
- `completed_at`: Session end timestamp (UTC)
- `opponent_personality`: Generated trait profile
- `opponent_constraints`: Scenario-specific limitations

### Turns Collection
Records individual conversation exchanges:
- `turn_id`: Unique turn identifier
- `session_id`: Parent session reference
- `user_message`: User input
- `opponent_response`: AI opponent reply
- `coach_tip`: Real-time coaching guidance
- `leverage`: Negotiation power at turn
- `mood`: Opponent emotional state
- `timestamp`: Turn completion time

### Analyses Collection
Stores post-session evaluation results:
- `analysis_id`: Unique analysis identifier
- `session_id`: Parent session reference
- `summary`: Overall performance assessment
- `outcome`: Negotiation result classification
- `strengths`: Identified effective tactics
- `mistakes`: Areas needing improvement
- `skill_gaps`: Recommended learning focus areas
- `leverage_trajectory`: Performance graph data
- `mood_trajectory`: Opponent emotional progression

## Performance Metrics

The platform tracks multiple dimensions of negotiation performance:

**Leverage Score**: Dynamic calculation based on:
- Harsh language detection (penalties: -12 to -20 points)
- Evidence-based argumentation (bonus: +8 points)
- Question-based tactics (bonus: +4-6 points)
- Market comparison usage (bonus: +7 points)
- Numerical anchoring (bonus: +9 points)
- Turn-based degradation (default: -2 per turn)

**Opponent Mood States**:
- Curious: Open to discussion
- Cooperative: Willing to negotiate
- Skeptical: Questioning user claims
- Frustrated: Losing patience
- Defensive: Resistant to proposals

**Session Metrics**:
- Total sessions completed
- Average leverage score
- Completion rate
- Time invested
- Success rate by scenario type

## Contributing

This is a proprietary project. External contributions are not currently accepted.

## License

Copyright 2026. All rights reserved.

## Support

For technical support or inquiries, please contact the development team.
