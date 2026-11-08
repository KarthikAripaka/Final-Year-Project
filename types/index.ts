export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  department_id?: string;
  department_name?: string;
  roll_number?: string;
  graduation_year?: number;
  cgpa?: number;
  active_backlogs?: number;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  head_of_department?: string;
  created_at: string;
}

export type DocumentStatus = 'DRAFT' | 'PROCESSING' | 'READY_FOR_REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'FAILED';
export type DocumentCategory = 'ACADEMIC' | 'EXAM' | 'PLACEMENT' | 'PROJECT' | 'REGULATION' | 'INTERNSHIP' | 'NOTICE' | 'GENERAL';

export interface CampusDocument {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  department_id?: string;
  academic_year: string;
  semester?: number;
  document_type: string;
  version: string;
  file_url: string;
  uploaded_by: string;
  status: DocumentStatus;
  chunks_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  document_version_id?: string;
  page_number: number;
  section?: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export type NoticePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type NoticeStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  department_id?: string;
  target_year?: number;
  priority: NoticePriority;
  published_at?: string;
  deadline?: string;
  attachment_url?: string;
  status: NoticeStatus;
  created_by: string;
  created_at: string;
}

export type CampusNotice = Notice;
export type CollegeDocument = CampusDocument;

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  time?: string;
  description?: string;
}

export interface PlacementOpportunity {
  id: string;
  company: string;
  role: string;
  description: string;
  salary: string;
  location: string;
  employment_type: 'FULL_TIME' | 'INTERNSHIP' | 'INTERN_PLUS_FULLTIME';
  allowed_departments: string[]; // department codes
  minimum_cgpa: number;
  max_backlogs: number;
  graduation_year: number;
  deadline: string;
  test_date?: string;
  interview_date?: string;
  application_url?: string;
  status: 'ACTIVE' | 'CLOSED' | 'UPCOMING';
  created_at: string;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_name: string;
  category: 'Programming' | 'Frameworks' | 'Databases' | 'Cloud' | 'Tools' | 'DSA' | 'Communication' | 'Projects' | 'Certifications';
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  updated_at: string;
}

export interface CareerRole {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
}

export interface SkillGapAnalysis {
  role_title: string;
  strong_skills: string[];
  needs_improvement: string[];
  missing_skills: string[];
  readiness_summary: string;
}

export interface LearningRoadmapItem {
  day: number;
  topic: string;
  objective: string;
  resources: string[];
}

export interface LearningRoadmap {
  role_title: string;
  total_days: number;
  daily_schedule: LearningRoadmapItem[];
  tips: string[];
}

export interface EmailAnalysis {
  id: string;
  student_id: string;
  sender: string;
  subject: string;
  email_date: string;
  category: 'ACADEMIC' | 'PLACEMENT' | 'EXAM' | 'PROJECT' | 'EVENT' | 'ADMINISTRATIVE' | 'GENERAL' | 'URGENT';
  priority: NoticePriority;
  summary: string;
  extracted_deadline?: string;
  action_items: string[];
  created_at: string;
}

export interface AudioSummary {
  id: string;
  student_id: string;
  title: string;
  audio_url: string;
  transcript: string;
  short_summary: string;
  detailed_summary: string;
  key_points: string[];
  action_items: string[];
  extracted_dates: string[];
  created_at: string;
}

export interface RAGCitation {
  document_id: string;
  title: string;
  version: string;
  page_number: number;
  snippet: string;
}

export interface RAGAnswerResponse {
  answer: string;
  citations: RAGCitation[];
  grounded: boolean;
  provider_used: string;
}

export interface NotificationItem {
  id: string;
  student_id: string;
  title: string;
  message: string;
  category: 'ACADEMIC' | 'PLACEMENT' | 'EXAM' | 'PROJECT' | 'DEADLINE' | 'GENERAL';
  read: boolean;
  link_url?: string;
  created_at: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  description: string;
  deadline: string;
  source_type: 'PDF_DOCUMENT' | 'OFFICIAL_NOTICE' | 'PLACEMENT' | 'GMAIL_EMAIL' | 'AUDIO_NOTE' | 'ADMIN_ENTRY';
  category: string;
  priority: NoticePriority;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
}

// ----------------------------------------------------
// Real LeetCode & Coding Assessment Engine Types
// ----------------------------------------------------

export interface LeetCodeStats {
  username: string;
  ranking: number;
  reputation: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  recentSubmissions: Array<{
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
  }>;
}

export interface GitHubStats {
  username: string;
  publicRepos: number;
  followers: number;
  createdAt: string;
  profileUrl: string;
}

export interface CodingProblem {
  id: string;
  frontendId: string;
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  url: string;
  points: number;
  topicTags: string[];
}

export interface CodingAssignment {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  department: string;
  academicYear: string;
  deadline: string;
  totalPoints: number;
  problems: CodingProblem[];
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
}

export interface StudentCodingSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  leetcodeUsername: string;
  githubUsername: string;
  solvedProblemSlugs: string[];
  score: number;
  maxScore: number;
  status: 'COMPLETED' | 'PARTIAL' | 'PENDING';
  submittedAt?: string;
  verifiedLive: boolean;
}
