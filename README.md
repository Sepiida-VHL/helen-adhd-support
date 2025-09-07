# 🧠 Helen – ADHD Support System with Vector-Enhanced Contextual Intelligence

[![Built with React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy: Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway)](https://railway.app)

A calm, validating ADHD crisis support experience by SepiidAI. Helen features a soothing, “stress ball” aesthetic with gentle, meditative animations and a persistent orb effect across the app—combined with advanced vector-based contextual memory and therapeutic intelligence.

## 🌟 Key Features

### Core Capabilities
- **Helen AI Assistant**: Calm, validating AI companion specialized in ADHD support
- **Crisis Intervention**: Multi-level crisis detection and therapeutic response system
- **Contextual Memory**: Vector-based retrieval system for personalized, context-aware conversations
- **ADHD-Specific Adaptations**: Attention fade detection, micro-sessions, and executive function support
- **Therapeutic Frameworks**: Integration of ACT, DBT, and Motivational Interviewing techniques

### Advanced Intelligence Systems
- **Vector Retrieval Service**: ChromaDB-powered semantic search for therapeutic knowledge
- **Orchestration Engine**: Dynamic conversation flow management and adaptive interventions
- **De-escalation Framework**: Structured crisis intervention with evidence-based techniques
- **Attention Monitoring**: Real-time detection and accommodation of ADHD attention patterns

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
App.tsx                     # Main application entry point
├── components/             # Reusable UI components
├── services/              # AI and business logic services
│   ├── geminiService.ts   # Google Gemini AI integration
│   ├── vectorRetrievalService.ts  # Vector memory client
│   ├── contextualConversationService.ts  # Layered context system
│   ├── orchestrationService.ts  # Conversation flow management
│   ├── deescalationService.ts   # Crisis intervention logic
│   └── interventionService.ts   # Therapeutic techniques
└── types.ts               # TypeScript type definitions
```

### Backend (Python + FastAPI)
```
retriever/
├── app.py                 # FastAPI vector retrieval service
├── requirements.txt       # Python dependencies
└── data/                  # ChromaDB vector storage
```

## 🚀 Quick Start

### Local Development

Run frontend and backend locally in separate terminals:
- Frontend (Vite + React):
  ```bash
  npm run dev
  ```
- Backend (FastAPI):
  ```bash
  uvicorn backend.main:app --reload
  ```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Prerequisites
- Node.js 18+
- Python 3.8+
- Google Gemini API key

### 1. Set up the main application
```bash
# Install frontend dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your VITE_GEMINI_API_KEY to .env
```

### 2. Start the Vector Retrieval Service
```bash
# Run the initialization script
python start_vector_service.py
```

This will:
- Set up a Python virtual environment in `retriever/venv`
- Install all required dependencies
- Create persistent storage at `retriever/data/chroma_db/`
- Start the FastAPI service on http://localhost:8000
- Seed the vector store with initial therapeutic knowledge (preserving existing data)

### 3. Run the main application
You can run services individually for development:

- Start the Backend API (FastAPI):
  ```bash
  uvicorn backend.main:app --reload
  ```

- Start the Frontend (Vite):
  ```bash
  npm run dev
  ```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 💾 Persistent Storage

### Data Persistence
All therapeutic knowledge and conversation data is stored persistently in:
```
retriever/data/chroma_db/     # ChromaDB vector database
retriever/data/seeded_content.json  # Record of seeded content
```

**This data persists across service restarts and will not be lost.**

### Adding New Therapeutic Content
```bash
# Add new therapeutic responses without overwriting existing ones
python seed_therapeutic_knowledge.py
```

### Backup and Restore
```bash
# Create a backup
python backup_restore_data.py backup --name my_backup_name

# List available backups
python backup_restore_data.py list

# Restore from backup
python backup_restore_data.py restore --name my_backup_name
```

Backups include:
- All vector database collections
- Conversation history
- User patterns and therapeutic knowledge
- Seeded content tracking

## 🧠 Vector-Enhanced Intelligence

### Contextual Memory System

The system maintains multiple specialized ChromaDB collections:

#### 1. Conversation Memory (`conversations`)
- Stores complete conversation turns with metadata
- Tracks crisis levels, attention status, emotional states
- Enables personalized response patterns

#### 2. Therapeutic Knowledge (`therapeutic_responses`)
- ADHD-specific validations and therapeutic responses
- Crisis-level appropriate interventions
- Attention-adapted communication patterns

#### 3. Intervention Library (`intervention_library`)
- Evidence-based therapeutic techniques
- Crisis survival skills (DBT TIPP, grounding, breathing)
- ACT defusion and mindfulness practices

#### 4. User Modeling (`user_modeling`)
- ADHD behavioral pattern recognition
- Personalized intervention preferences
- Attention and engagement tracking

## 🎯 ADHD-Specific Features

### Attention Management
- **Attention Fade Detection**: Monitors for short responses, withdrawal language
- **Micro-Sessions**: Automatically suggests breaks when attention wanes
- **Response Adaptation**: Shortens responses and simplifies language dynamically

### Executive Function Support
- **Structured Choices**: Never more than 3 options at a time
- **Progress Indicators**: Clear feedback on intervention completion
- **Transition Management**: Smooth handoffs between activities and conversation

### Emotional Regulation
- **Intensity Validation**: "ADHD brains feel emotions more intensely"
- **Temporal Reminders**: "This intense feeling will pass"
- **Capability Affirmation**: "You've gotten through this before"

## 🛡️ Safety and Crisis Management

### Crisis Level Detection
- **None**: General support and conversation
- **Mild**: Stress and anxiety management
- **Moderate**: Active distress requiring intervention
- **Severe**: High distress with therapeutic techniques
- **Imminent**: Immediate safety protocol activation

### Safety Protocol
When `IMMINENT` crisis is detected:
1. Immediate safety resource provision (988 Suicide & Crisis Lifeline)
2. Conversation state transitions to `HUMAN_HANDOFF`
3. No further AI interventions until crisis passes

## 📊 Monitoring and Analytics

### Vector Service Health Check
```bash
curl http://localhost:8000/health
```

### Collection Statistics
```bash
curl http://localhost:8000/collections
```

### Query Testing
```bash
curl -X POST http://localhost:8000/retrieve_adhd_context \
  -H "Content-Type: application/json" \
  -d '{"query_text": "I feel overwhelmed", "user_patterns": {"attention_status": "fading"}}'
```

## 🔮 Advanced Features

### Therapeutic Rupture Repair
- Detects user frustration ("this isn't working", "you don't get it")
- Immediately validates frustration without defensiveness
- Offers alternative approaches

### Dynamic Session Planning
- Micro-sessions (3 minutes) for high attention fade
- Short sessions (8 minutes) for moderate engagement
- Extended sessions (15+ minutes) for hyperfocus states

### Intervention Effectiveness Tracking
- Real-time assessment of technique effectiveness
- Automatic adaptation of intervention sequences
- Historical effectiveness patterns for personalization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Google Gemini AI for natural language understanding
- ChromaDB for vector storage and semantic search
- Evidence-based therapeutic frameworks (ACT, DBT, MI)
- ADHD community feedback and testing

---

**⚠️ Important**: This system is designed for support and crisis intervention but is not a replacement for professional mental health care. In case of immediate danger, please contact emergency services or the 988 Suicide & Crisis Lifeline.
