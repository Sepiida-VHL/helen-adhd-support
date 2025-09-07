# Onboarding Guide for Contributors

Welcome to Helen by SepiidAI. This guide helps you get set up quickly for local development with a calm and focused workflow.

## Prerequisites
- Node.js 18+
- Python 3.8+
- GitHub CLI (optional) for PRs: https://cli.github.com/

## Repository Overview
- Frontend: React + Vite + TypeScript
- Backend API: FastAPI (Python)
- Vector Retrieval Service: FastAPI-based service for contextual memory (ChromaDB)

## Environment Setup
1) Install dependencies
```bash
npm install
```

2) Environment variables
```bash
cp .env.example .env
# Fill in your values, e.g. VITE_GEMINI_API_KEY
```

3) Optional: Initialize vector retrieval service and seed data
```bash
python start_vector_service.py
```
This sets up a Python venv under retriever/, installs dependencies, seeds initial content, and starts the service on http://localhost:8000.

## Running Locally
Open two terminals (or processes):
- Frontend (Vite + React)
```bash
npm run dev
```
- Backend (FastAPI)
```bash
uvicorn backend.main:app --reload
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Project Conventions
- App name: Helen (by SepiidAI). Maintain a calm, meditative aesthetic consistently.
- UI styling: Gentle, soothing animations and a persistent orb effect where appropriate.
- Git branching: feature/<name>, chore/<name>, fix/<name>
- Commits: Conventional-style messages are appreciated (e.g., feat:, fix:, chore:, docs:)
- PRs: Reference the checklist items in docs/implementation.md where applicable

## Testing & Validation
- Manual smoke tests:
  - Load app at http://localhost:5173
  - Verify backend health at http://localhost:8000/health (if vector service is running)
- API checks:
```bash
curl http://localhost:8000/health
```

## Troubleshooting
- If the backend port 8000 is in use, stop the conflicting process or change the port via `uvicorn backend.main:app --reload --port 8001` and update the frontend config accordingly.
- If Node modules are missing or outdated, run `npm install` again.
- If Python dependencies fail, ensure Python 3.8+ is available and try recreating the environment.

## Contributing Flow
1) Create a branch: `git checkout -b feature/<name>`
2) Make changes and run the app locally
3) Commit and push
4) Open a PR to main with a checklist referencing docs/implementation.md
5) After review and approval, squash-merge and delete the feature branch

Thanks for contributing to Helen.
