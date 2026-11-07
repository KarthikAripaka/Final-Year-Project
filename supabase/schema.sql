-- ============================================================
-- AI SMART CAMPUS ASSISTANT - DATABASE SCHEMA & RLS POLICIES
-- PostgreSQL + pgvector + Supabase Auth
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('DRAFT', 'PROCESSING', 'READY_FOR_REVIEW', 'PUBLISHED', 'ARCHIVED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE document_category AS ENUM ('ACADEMIC', 'EXAM', 'PLACEMENT', 'PROJECT', 'REGULATION', 'INTERNSHIP', 'NOTICE', 'GENERAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE notice_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE notice_status AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'INTERNSHIP', 'INTERN_PLUS_FULLTIME');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE placement_status AS ENUM ('ACTIVE', 'CLOSED', 'UPCOMING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE skill_category AS ENUM ('Programming', 'Frameworks', 'Databases', 'Cloud', 'Tools', 'DSA', 'Communication', 'Projects', 'Certifications');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE proficiency_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    head_of_department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. PROFILES (Extends Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    roll_number TEXT,
    graduation_year INT,
    cgpa NUMERIC(4,2) DEFAULT 0.0,
    active_backlogs INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. OFFICIAL DOCUMENTS & VERSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category document_category NOT NULL DEFAULT 'ACADEMIC',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    semester INT,
    document_type TEXT DEFAULT 'PDF',
    version TEXT NOT NULL DEFAULT '1.0',
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status document_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL,
    changes_summary TEXT,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. DOCUMENT CHUNKS & VECTOR EMBEDDINGS (pgvector 768 dimensions for Gemini text-embedding-004)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    document_version_id UUID REFERENCES public.document_versions(id) ON DELETE CASCADE,
    page_number INT NOT NULL DEFAULT 1,
    section TEXT,
    content TEXT NOT NULL,
    embedding vector(768),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for HNSW fast vector cosine similarity search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- ============================================================
-- 5. OFFICIAL NOTICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category document_category NOT NULL DEFAULT 'NOTICE',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    target_year INT,
    priority notice_priority NOT NULL DEFAULT 'NORMAL',
    published_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    attachment_url TEXT,
    status notice_status NOT NULL DEFAULT 'DRAFT',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. EVENTS & CALENDAR
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category document_category NOT NULL DEFAULT 'GENERAL',
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    organizer TEXT,
    target_department UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    target_year INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. CENTRALIZED DEADLINES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    source_type TEXT NOT NULL, -- 'OFFICIAL_NOTICE', 'PLACEMENT', 'GMAIL', 'AUDIO', 'CUSTOM'
    source_id TEXT,
    category TEXT DEFAULT 'GENERAL',
    priority notice_priority DEFAULT 'NORMAL',
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. PLACEMENTS & APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT NOT NULL,
    salary TEXT NOT NULL,
    location TEXT NOT NULL,
    employment_type employment_type NOT NULL DEFAULT 'FULL_TIME',
    allowed_departments TEXT[] DEFAULT '{}',
    minimum_cgpa NUMERIC(4,2) NOT NULL DEFAULT 0.0,
    max_backlogs INT NOT NULL DEFAULT 0,
    graduation_year INT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    test_date TIMESTAMPTZ,
    interview_date TIMESTAMPTZ,
    application_url TEXT,
    status placement_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.placement_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES public.placements(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'APPLIED',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(placement_id, student_id)
);

-- ============================================================
-- 9. STUDENT SKILLS & CAREER ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category skill_category NOT NULL DEFAULT 'Programming'
);

CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category skill_category NOT NULL DEFAULT 'Programming',
    proficiency_level proficiency_level NOT NULL DEFAULT 'BEGINNER',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, skill_name)
);

CREATE TABLE IF NOT EXISTS public.career_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT
);

-- ============================================================
-- 10. CHAT SESSIONS & RAG MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'user' | 'assistant'
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. GMAIL INTEGRATION
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gmail_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    email_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, message_id)
);

CREATE TABLE IF NOT EXISTS public.email_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    priority notice_priority DEFAULT 'NORMAL',
    summary TEXT NOT NULL,
    extracted_deadline TIMESTAMPTZ,
    action_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. VOICE / AUDIO INTELLIGENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audio_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    duration INT DEFAULT 0,
    status TEXT DEFAULT 'PROCESSED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_file_id UUID UNIQUE NOT NULL REFERENCES public.audio_files(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transcript_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.voice_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_file_id UUID UNIQUE NOT NULL REFERENCES public.audio_files(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    short_summary TEXT NOT NULL,
    detailed_summary TEXT NOT NULL,
    key_points JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    extracted_dates JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. NOTIFICATIONS & AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'GENERAL',
    read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VECTOR SIMILARITY SEARCH RPC (pgvector cosine distance)
-- ============================================================
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    document_title TEXT,
    document_version TEXT,
    page_number INT,
    content TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        d.title AS document_title,
        d.version AS document_version,
        dc.page_number,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    JOIN public.documents d ON d.id = dc.document_id
    WHERE d.status = 'PUBLISHED'
      AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
    ORDER BY dc.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PUBLIC / READ POLICIES FOR STUDENTS & FACULTY
CREATE POLICY "Departments are readable by all authenticated users"
ON public.departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Published documents readable by all authenticated users"
ON public.documents FOR SELECT TO authenticated
USING (status = 'PUBLISHED' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));

CREATE POLICY "Published chunks readable by authenticated users"
ON public.document_chunks FOR SELECT TO authenticated
USING (document_id IN (SELECT id FROM public.documents WHERE status = 'PUBLISHED') OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));

CREATE POLICY "Published notices readable by authenticated users"
ON public.notices FOR SELECT TO authenticated
USING (status = 'PUBLISHED' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));

CREATE POLICY "Events readable by authenticated users"
ON public.events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Active placements readable by authenticated users"
ON public.placements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Skills and career roles readable by authenticated users"
ON public.skills FOR SELECT TO authenticated USING (true);

CREATE POLICY "Career roles readable by authenticated users"
ON public.career_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Learning resources readable by authenticated users"
ON public.learning_resources FOR SELECT TO authenticated USING (true);

-- ISOLATED USER-SPECIFIC POLICIES (STUDENTS READ/WRITE ONLY THEIR OWN CONTENT)
CREATE POLICY "Users can view and update own profile"
ON public.profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Students manage own skills"
ON public.student_skills FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students manage own deadlines"
ON public.deadlines FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students manage own placement applications"
ON public.placement_applications FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students manage own chat sessions"
ON public.chat_sessions FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students manage own chat messages"
ON public.chat_messages FOR ALL TO authenticated
USING (session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Students manage own gmail connections"
ON public.gmail_connections FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students view own emails"
ON public.emails FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students view own email analysis"
ON public.email_analysis FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students manage own audio files"
ON public.audio_files FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students view own transcripts"
ON public.transcripts FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students view own voice summaries"
ON public.voice_summaries FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students manage own notifications"
ON public.notifications FOR ALL TO authenticated
USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ADMIN FULL ACCESS POLICIES
CREATE POLICY "Admins full management on documents"
ON public.documents FOR ALL TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));

CREATE POLICY "Admins full management on notices"
ON public.notices FOR ALL TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));

CREATE POLICY "Admins full management on placements"
ON public.placements FOR ALL TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));

CREATE POLICY "Admins view audit logs"
ON public.audit_logs FOR ALL TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN'));
