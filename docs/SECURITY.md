# Security & Row Level Security (RLS) Specification

## 1. Principles
- **No API Keys in Client**: All Gemini, Groq, and Supabase service role keys reside strictly in server-side environment variables (`.env.local` / Next.js Server Actions / API Routes).
- **Strict Role-Based Access Control (RBAC)**: `STUDENT`, `FACULTY`, `ADMIN`.
- **Row Level Security (RLS)**: Enforced on all PostgreSQL tables.
- **Student Privacy Isolation**: Student Gmail content, audio transcripts, skill profiles, and chat logs are bound to `student_id = auth.uid()`. Admins cannot access private student email data.
- **Admin Approval Gate**: PDF documents uploaded by admins remain in `DRAFT` / `READY_FOR_REVIEW` and are isolated from RAG until explicitly set to `PUBLISHED`.
