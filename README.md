# EduVault Questionnaire Answering Tool

Structured questionnaire answering system built for the Almabase GTM Engineering Internship assignment.

## Live App / Repository
- Live URL: https://eduvault-questionnaire.vercel.app
- Repository URL: `https://github.com/akhilamudhiraj/eduvault-questionnaire`

## Industry & Fictional Company
- Industry: EdTech SaaS (Higher Education)
- Company: **EduVault** is a SaaS platform for universities to manage student records, accreditation workflows, and institutional compliance. It is used by admissions teams, registrars, and compliance officers.

## What I Built
- Full-stack app with:
  - User authentication (Supabase Auth)
  - Persistent storage (Supabase tables)
  - Reference document upload/store
  - Questionnaire input via text paste or document upload
  - Automated answer generation with citations
  - Confidence score per answer
  - Coverage summary
  - Review/edit answers
  - Export to DOCX and PDF
  - Delete questionnaire runs

## Core User Flow
1. Sign up / log in
2. Upload reference documents (`.txt`, `.md`, `.pdf`, `.docx`)
3. Upload questionnaire file (`.txt`, `.md`, `.pdf`, `.docx`, `.csv`, `.xlsx`) or paste content
4. Generate answers
5. Review and edit answers
6. Export results as DOCX/PDF

## Tech Stack
- Frontend: React + Vite
- Backend: FastAPI (Python)
- DB/Auth: Supabase
- AI: Anthropic Claude API (with local fallback mode when API quota/billing is unavailable)
- Export: `python-docx` + generated PDF

## Output Quality Rules Implemented
- Answers are grounded in uploaded references
- Each answer includes citations
- If unsupported: returns `Not found in references.`
- Results view shows question, answer, citations, confidence, and coverage metrics

## Assumptions
- Input questionnaires are structured with numbered questions (e.g., `1.`, `Q1`, `Question 1:`).
- Reference documents contain enough explicit policy detail to answer questions reliably.
- Simple structure preservation means preserving question text and order in exports.

## Trade-offs
- For speed/reliability, questionnaire parsing is regex-based, not full semantic parsing.
- PDF export is intentionally simple formatting.
- Local AI fallback uses retrieval-style keyword matching and may be less fluent than LLM output.
- Full visual formatting parity with original uploaded questionnaire files is not implemented.

## What I Would Improve With More Time
- Stronger structure-preserving export (tables/sections matching original input layout)
- Evidence snippets shown inline for each answer
- Partial regeneration per selected question
- Better retrieval and ranking (embeddings/vector search)
- Async background processing + progress indicator for long runs
- Deployment hardening (rate limits, observability, better error telemetry)

## Setup Instructions
## 1) Backend
```bash
cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Backend `.env` keys expected:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `ANTHROPIC_API_KEY`

Optional:
- `FORCE_LOCAL_AI=true` to bypass Anthropic and use local fallback answer generation.

## 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Optional frontend env:
- `VITE_API_URL=http://127.0.0.1:8001`

## 3) Open App
- `http://127.0.0.1:5173`

## Sample Data Used
- 6 EduVault reference docs:
  - Security Policy
  - Data Privacy & FERPA Compliance
  - Infrastructure Overview
  - SLA & Uptime Policy
  - Onboarding & Integration Guide
  - Access Control Policy
- 8–15 question vendor/security questionnaire for testing.
