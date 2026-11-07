# Database Specification — Supabase PostgreSQL + pgvector

## Overview
The platform utilizes Supabase PostgreSQL with `pgvector` extension for storing relational data, audit logs, and vector embeddings.

## Key Tables

1. **`profiles`**: User profile information linked to `auth.users(id)`. Stores role (`STUDENT`, `FACULTY`, `ADMIN`), department, roll number, CGPA, and backlogs.
2. **`departments`**: University department records (code, name, HOD).
3. **`documents`**: Official campus PDF records (title, category, version, status: DRAFT -> PROCESSING -> READY_FOR_REVIEW -> PUBLISHED).
4. **`document_chunks`**: Segmented text chunks with 768-dimensional vector embeddings (`embedding vector(768)`). HNSW index configured for cosine distance.
5. **`notices`**: Official notices and announcements with priorities.
6. **`placements`**: Campus recruitment drives with eligibility cutoffs (minimum CGPA, max backlogs, allowed departments).
7. **`placement_applications`**: Tracking student applications.
8. **`student_skills`**: Student skills and proficiency levels.
9. **`career_roles`**: Career role requirements (e.g. Software Engineer).
10. **`gmail_connections` & `emails` & `email_analysis`**: Student isolated Gmail OAuth tokens, sync records, and AI classification outputs.
11. **`audio_files` & `transcripts` & `voice_summaries`**: Audio records, online STT transcripts, and LLM extracted summaries.
12. **`deadlines`**: Centralized aggregated deadline engine table.
13. **`notifications`**: Category-based student notifications.
14. **`audit_logs`**: Administrative security audit log table.

## Vector Search Function
```sql
match_document_chunks(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.25,
    match_count int DEFAULT 5
)
```
Only returns chunks belonging to documents with `status = 'PUBLISHED'`.
