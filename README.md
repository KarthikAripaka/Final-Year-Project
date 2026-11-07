# AI Smart Campus Assistant 🎓🤖

An intelligent digital operating system for university/college information, communication, official RAG knowledge retrieval, placement matching, and student support.

---

## Key Features

1. **Grounded Official Knowledge Base & RAG**: Admin uploads official PDFs (Academic Regulations, Placement Criteria, Project Guidelines). Text extracted, chunked, and embedded into Supabase `pgvector`. Students receive zero-hallucination answers backed by verifiable page-level source citations.
2. **Strict Knowledge Governance**: ONLY authorized `ADMIN` users can upload, modify, or publish official knowledge documents into the RAG vector store.
3. **Multi-Provider Online AI Strategy**: Defaults to Google Gemini API (`text-embedding-004` & `gemini-1.5-flash`) with automatic fallback to Groq API (`llama-3.3-70b-versatile`). `DEV_MODE=true` ensures safe local offline simulation.
4. **Deterministic Placement Eligibility Engine**: Evaluates student CGPA, branch, graduation year, and active backlog count to provide 100% accurate eligibility breakdowns.
5. **Student Skill Profile & 7-Day Roadmap Generator**: Compares student skill set against target career roles (e.g., Software Engineer) to produce strong, needs-improvement, and missing skill matrix with day-by-day learning schedules.
6. **Gmail Intelligence**: Read-only Google OAuth integration categorizing inbox messages into ACADEMIC, PLACEMENT, EXAM, or URGENT, extracting deadlines and action items into a centralized widget.
7. **Online Voice Summarizer**: Live browser audio recording / file upload with online Speech-to-Text, producing executive summaries, key points, action items, and Q&A capabilities.
8. **Row Level Security (RLS) Privacy Isolation**: Ensures student personal Gmail data, audio notes, transcripts, skill profiles, and chat sessions are strictly isolated per student account.

---

## Technology Stack

- **Frontend & App Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Glassmorphic Design System, Custom Theme Tokens
- **Database & Vector Search**: Supabase PostgreSQL + `pgvector` extension (HNSW index)
- **AI Models (Online Only)**: Google Gemini API & Groq API Fallback
- **PWA Support**: Responsive Web App with Progressive Web App Manifest

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key

AI_PRIMARY_PROVIDER=gemini
AI_FALLBACK_PROVIDER=groq
DEV_MODE=true
```

### 3. Database Migration
Apply `supabase/schema.sql` to your Supabase PostgreSQL database.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
