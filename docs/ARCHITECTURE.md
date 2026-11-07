# AI Smart Campus Assistant — Architecture Specification

## 1. System Architecture Overview

The AI Smart Campus Assistant is designed using a clean, layered architecture separating user interface, API/service layer, domain logic, repository abstractions, and external integrations (Supabase PostgreSQL + pgvector, Google Gemini, Groq, Gmail API).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION LAYER                              │
│         Next.js App Router (React 19, Tailwind CSS, TypeScript, PWA)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                             SERVICE / API LAYER                             │
│       Next.js API Routes / Server Actions / Middleware Authorization       │
└──────────────────┬──────────────────────────────────────┬───────────────────┘
                   │                                      │
┌──────────────────▼───────────────────┐  ┌───────────────▼───────────────────┐
│         BUSINESS / DOMAIN LOGIC      │  │        AI PROVIDER ABSTRACT       │
│  - RAG Retrieval & Context Ranking   │  │  - AIService Strategy             │
│  - Placement Eligibility Engine      │  │  - GeminiProvider (Primary)       │
│  - Skill Gap & Roadmap Analyzer      │  │  - GroqProvider (Fallback)        │
│  - Gmail Intelligence Parser         │  │  - STT Online Speech Engine       │
│  - Deadline Aggregator               │  │                                   │
└──────────────────┬───────────────────┘  └───────────────┬───────────────────┘
                   │                                      │
┌──────────────────▼──────────────────────────────────────▼───────────────────┐
│                               REPOSITORY LAYER                              │
│       Supabase JS Client / Server Client with Row Level Security (RLS)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            DATA & STORAGE LAYER                             │
│   Supabase PostgreSQL (Relational Data + pgvector) & Supabase Storage       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. RAG & Official Knowledge Base Pipeline

ONLY authorized administrators can modify the official AI knowledge base.

```
┌───────────┐    Upload PDF     ┌────────────────┐   Extract Text   ┌─────────────────┐
│   ADMIN   ├──────────────────►│ Document Store ├─────────────────►│ PDF Text Parser │
└───────────┘                   └────────────────┘                  └────────┬────────┘
                                                                             │
┌──────────────┐   Publish Doc   ┌──────────────┐   Vector Chunks  ┌─────────▼───────┐
│ Active RAG   │◄────────────────┤ Admin Review │◄─────────────────┤ Embedding Engine│
│ Knowledge Base                └──────────────┘                  └─────────────────┘
```

### Knowledge Base Workflow:
1. **Upload & Processing**: Admin uploads official campus document (PDF). Document enters `DRAFT` status, then transitions to `PROCESSING`. Text is extracted preserving page numbers and cleaned.
2. **Chunking & Vector Embeddings**: Document text is chunked into overlapping segments (e.g. 500-1000 tokens) with strict metadata (`document_id`, `version`, `page_number`, `category`). Text embeddings are calculated using online Gemini Embedding API (`text-embedding-004`). Chunks + vector embeddings are stored in `document_chunks` table with `pgvector` index.
3. **Approval Flow**: Document status moves to `READY_FOR_REVIEW`. Admin previews text chunks. Admin explicitly clicks **Publish**, moving status to `PUBLISHED`.
4. **Grounded RAG Query Execution**:
   - Student enters natural language query.
   - System computes query embedding and queries `pgvector` (`match_document_chunks` RPC function) filtered strictly by `status = 'PUBLISHED'`.
   - Top-ranked chunk context is constructed into a strict prompt.
   - If relevant sources are found: LLM responds using source content and attaches verifiable citations (Document Name, Version, Page Number).
   - If relevant sources are insufficient: LLM gracefully responds with: *"I couldn't verify this information from the official campus knowledge base."* (Zero hallucination rule).

## 3. Auth, RBAC & Row Level Security (RLS)

- **Roles**: `STUDENT`, `FACULTY`, `ADMIN`.
- **Security Principles**:
  - Roles are stored in public `profiles` table linked to `auth.users(id)`.
  - Roles cannot be self-updated by users.
  - Server-side middleware & API route checks enforce authorization.
  - RLS policies restrict table access at the database level:
    - `STUDENT`: Can ONLY read `PUBLISHED` documents, published notices, active placement listings, calendar events. Can ONLY read/write their OWN personal data (profile, gmail data, voice files, transcripts, skills, applications, chat history).
    - `FACULTY`: Access to relevant faculty notices, events, student listings as authorized.
    - `ADMIN`: Full CRUD on documents, notices, placement listings, audit logs, system analytics.

## 4. Multi-Provider Online AI Architecture

- **Primary Provider**: Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-pro` & `text-embedding-004`).
- **Fallback Provider**: Groq API (`llama-3.3-70b-versatile` / `mixtral-8x7b-32768`).
- **Design Pattern**: Strategy / Provider pattern.
```typescript
interface AIProvider {
  generateAnswer(prompt: string, context?: string): Promise<string>;
  summarize(text: string): Promise<string>;
  classify(text: string): Promise<string>;
  extractDeadline(text: string): Promise<ExtractedDeadline | null>;
  extractActionItems(text: string): Promise<string[]>;
  analyzeSkillGap(studentSkills: Skill[], targetRole: CareerRole): Promise<SkillGapAnalysis>;
  generateLearningPlan(gaps: SkillGapAnalysis): Promise<LearningRoadmap>;
}
```
- **Rule**: Purely online-only. No local model binary runtime required.

## 5. Integrations

- **Gmail Integration**: Google OAuth 2.0 with read-only scope (`https://www.googleapis.com/auth/gmail.readonly`). User tokens stored securely encrypted in database. AI parser categorizes emails (ACADEMIC, PLACEMENT, EXAM, etc.), extracts deadlines, priority, action items.
- **Voice Intelligence**: Web MediaRecorder API / Audio file upload -> Online Speech-to-Text API (Groq Whisper / Gemini Audio) -> Online LLM summarizer & action item extractor.

## 6. System Ecosystem Flow

All modules feed into a centralized **Student Dashboard**, **Deadline Engine**, **Calendar**, and **Notification Dispatcher**:
- Official Notices / Documents -> RAG + Deadlines + Notifications
- Gmail Intelligence -> Deadlines + Email Dashboard + Notifications
- Voice Audio -> Transcripts + Action Items + Deadlines
- Placement Listings -> Eligibility Engine + Applications
- Skills Profile -> Skill Gap Analysis -> Learning Roadmap
