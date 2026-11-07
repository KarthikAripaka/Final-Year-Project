# AI Smart Campus Assistant — Project Implementation Roadmap

## Overview & Execution Strategy
This roadmap defines the sequential, dependency-aware implementation phases required to build the complete AI Smart Campus Assistant platform.

---

### Phase 0: Repository Inspection & Architectural Plan
- [x] Inspect workspace and initialize architectural docs (`docs/ARCHITECTURE.md`, `docs/ROADMAP.md`).
- [x] Create comprehensive implementation plan.

---

### Phase 1: Project Foundation & Environment Setup
- [ ] Initialize Next.js (App Router, TypeScript, Tailwind CSS, ESLint, Prettier, PWA support).
- [ ] Configure `.env.example` with required Supabase, Gemini, Groq, Google OAuth keys.
- [ ] Setup base configuration, directory layout, utility libraries, and type definitions.

---

### Phase 2: Design System & Core UI Components
- [ ] Design custom academic/AI SaaS design system (Light/Dark themes, glassmorphism, responsive CSS variables).
- [ ] Build reusable UI atomic components: `Button`, `Input`, `Select`, `Modal`, `Drawer`, `Card`, `Table`, `Badge`, `Tabs`, `Toast`, `Dropdown`, `Search`, `Pagination`, `Skeleton`, `EmptyState`, `ErrorState`, `LoadingState`.

---

### Phase 3: Authentication & Protected Routes
- [ ] Integrate Supabase Auth (Email/Password & Google OAuth).
- [ ] Setup user profile synchronization with strict roles (`STUDENT`, `FACULTY`, `ADMIN`).
- [ ] Build auth screens (Login, Register, Forgot Password, Reset Password).
- [ ] Implement server-side authorization middleware and protected route wrappers.

---

### Phase 4: Database Schema & Migration Engine
- [ ] Create PostgreSQL schema with 18+ normalized tables.
- [ ] Enable `pgvector` extension and vector indices.
- [ ] Set up primary keys, foreign keys, indexes, triggers (`updated_at`), and enum types.

---

### Phase 5: Security & Row Level Security (RLS) Policies
- [ ] Write and verify RLS policies for all tables.
- [ ] Enforce complete student-to-student data isolation.
- [ ] Secure admin endpoints and administrative tables.

---

### Phase 6: Admin Dashboard Foundation
- [ ] Build main layout for Admin Portal with navigation sidebar and header.
- [ ] Implement system analytics overview metrics (Students, Documents, Knowledge Status, Notices, AI Queries).

---

### Phase 7: Official Knowledge Base & PDF Processing Engine
- [ ] Build admin document upload flow with file validation and Supabase Storage integration.
- [ ] Implement PDF text extraction engine preserving page numbers.
- [ ] Implement text cleaner, chunking algorithm, and embedding generation via Gemini API.
- [ ] Store chunks and vector embeddings in `document_chunks` table.

---

### Phase 8: Document Metadata & Approval Workflow
- [ ] Build Admin Knowledge Management Interface (Draft -> Processing -> Preview -> Review -> Publish -> Archive).
- [ ] Support metadata tagging (Category, Department, Academic Year, Version).

---

### Phase 9: Grounded RAG Retrieval Engine
- [ ] Build `match_document_chunks` similarity search RPC in Supabase.
- [ ] Build context ranking and metadata filtering pipeline.
- [ ] Create strict grounded prompt generator with source citation mapping.

---

### Phase 10: Multi-Provider AI Engine (Gemini + Groq Fallback)
- [ ] Implement `AIProvider` interface.
- [ ] Implement `GeminiProvider` and `GroqProvider`.
- [ ] Implement `AIService` manager with automatic error handling, rate limiting, and fallback switching.

---

### Phase 11: AI Campus Assistant Chat Interface
- [ ] Build modern AI Chat interface with conversation drawer, streaming support, code blocks, source citations with page numbers.
- [ ] Implement proposed quick questions ("Attendance requirements", "Placement eligibility", "Exam schedule").
- [ ] Save chat sessions and message history in Supabase.

---

### Phase 12: Global Natural Language Search
- [ ] Build global search dialog across documents, notices, placements, and events with keyword + semantic search capabilities.

---

### Phase 13: Admin Notice Management System
- [ ] Implement Notice creation, editing, tagging, priority levels, AI-assisted deadline extraction, and approval workflow.

---

### Phase 14: Centralized Deadline & Event Engine
- [ ] Aggregate deadlines from notices, documents, placements, exams, and Gmail into unified Deadline Engine.
- [ ] Filter by Today, Tomorrow, This Week, Upcoming.

---

### Phase 15: Interactive Campus Calendar
- [ ] Build Month, Week, List views for exams, project deadlines, placement interviews, and campus events.

---

### Phase 16: Placement & Career Portal
- [ ] Build Placement listing management for admins.
- [ ] Build Student Placement view with deterministic Eligibility Engine (CGPA, Branch, Graduation Year verification).
- [ ] Enable student placement application tracking.

---

### Phase 17: Student Skill Profile & Skill Gap Analysis
- [ ] Build skill profile manager with proficiency levels.
- [ ] Build career role definitions and skill gap comparison matrix (Strong, Needs Improvement, Missing).

---

### Phase 18: Personalized Learning Roadmap Generator
- [ ] Generate day-by-day customized learning roadmaps based on identified skill gaps and upcoming target placement dates.

---

### Phase 19: Secure Gmail OAuth & Intelligence Parser
- [ ] Implement Google OAuth for Gmail read-only integration.
- [ ] Synchronize inbox, run AI email classification (ACADEMIC, PLACEMENT, EXAM, URGENT), extract summaries, deadlines, and action items.
- [ ] Build Inbox Intelligence dashboard for students.

---

### Phase 20: Online Voice Summarizer & Audio Intelligence
- [ ] Build MediaRecorder voice capture component and file uploader.
- [ ] Integrate online Speech-to-Text API.
- [ ] AI extraction of short summary, key points, action items, dates, and interactive audio Q&A.

---

### Phase 21: Notification Center
- [ ] Build notification badge, dropdown, and list with categories (ACADEMIC, PLACEMENT, EXAM, DEADLINE).

---

### Phase 22: Student Personalized Dashboard
- [ ] Assemble unified student home dashboard summarizing upcoming deadlines, eligible placements, important emails, learning progress, recent chats, and voice notes.

---

### Phase 23: Audit Logging, System Analytics & Performance Optimization
- [ ] Log admin security events.
- [ ] Build AI usage analytics (tokens, response time, fallback occurrences).
- [ ] Implement pagination, lazy loading, debouncing, and caching.

---

### Phase 24: Progressive Web App (PWA) & Responsive Polish
- [ ] Add `manifest.json`, service worker registration, app icons.
- [ ] Verify full responsive UI across mobile, tablet, and desktop views.

---

### Phase 25: Seed Data & Safe Demo Mode (`DEV_MODE`)
- [ ] Create `npm run seed` script populating realistic academic seed data, demo users, sample documents, notices, placements, skills, and emails.
- [ ] Implement robust `DEV_MODE` fallbacks for zero-setup demoing.

---

### Phase 26: Complete User Flow Verification & Final Documentation
- [ ] Perform end-to-end user flow testing (Admin PDF approval -> Grounded RAG answer -> Placement check -> Skill gap -> Gmail sync -> Voice summarize).
- [ ] Finalize user and technical documentation (`README.md`, `docs/DATABASE.md`, `docs/AI_RAG.md`, `docs/GMAIL.md`, `docs/VOICE.md`, `docs/SECURITY.md`, `docs/API.md`, `docs/DEPLOYMENT.md`, `docs/DEMO.md`, `docs/TESTING.md`).
