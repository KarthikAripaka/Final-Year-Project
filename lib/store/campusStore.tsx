"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  CampusDocument,
  Notice,
  PlacementOpportunity,
  StudentSkill,
  AudioSummary,
  DeadlineItem,
  NotificationItem,
} from "@/types";
import { PrioritizedAnalyzedEmail } from "@/lib/gmail/gmailService";

export interface CampusStoreContextType {
  // Documents & RAG
  documents: CampusDocument[];
  addDocument: (doc: CampusDocument) => void;
  publishDocument: (docId: string) => void;
  getPublishedChunks: () => Array<{ document_title: string; version: string; page_number: number; content: string }>;

  // Notices
  notices: Notice[];
  addNotice: (notice: Omit<Notice, "id" | "created_at">) => void;

  // Placements
  placements: PlacementOpportunity[];
  appliedPlacementIds: string[];
  addPlacement: (placement: Omit<PlacementOpportunity, "id" | "created_at">) => void;
  applyPlacement: (placementId: string) => void;

  // Skills
  skills: StudentSkill[];
  addSkill: (name: string, category: StudentSkill["category"], level: StudentSkill["proficiency_level"]) => void;

  // Gmail Emails
  emails: PrioritizedAnalyzedEmail[];
  syncGmailInbox: (explicitEmail?: string) => Promise<void>;

  // Voice Notes
  voiceNotes: AudioSummary[];
  addVoiceNote: (note: AudioSummary) => void;

  // Deadlines & Notifications
  deadlines: DeadlineItem[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;

  // General state
  isInitialized: boolean;
}

const defaultInitialDocuments: CampusDocument[] = [
  {
    id: "doc_101",
    title: "ANITS Autonomous Academic Regulations (R20/R23)",
    description: "Official institutional rules regarding grading system, minimum 75% attendance threshold, medical condonation criteria, and semester-end exam eligibility.",
    category: "REGULATION",
    academic_year: "2026-2027",
    version: "v2.4",
    document_type: "PDF_INSTITUTIONAL",
    file_url: "/documents/ANITS_Academic_Regulations_2026.pdf",
    uploaded_by: "Dean Academic Affairs",
    status: "PUBLISHED",
    chunks_count: 42,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc_102",
    title: "Training & Placement Cell Rules & Eligibility 2026",
    description: "Comprehensive recruitment rules, Dream and Core offer limits, interview etiquette, and zero-tolerance policy on placement drive absenteeism.",
    category: "PLACEMENT",
    academic_year: "2026-2027",
    version: "v1.8",
    document_type: "PDF_OFFICIAL",
    file_url: "/documents/TPO_Placement_Guidelines_2026.pdf",
    uploaded_by: "Head T&P Cell",
    status: "PUBLISHED",
    chunks_count: 28,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc_103",
    title: "B.Tech Information Technology Curriculum & Syllabus (Sem 1-8)",
    description: "Course structure, prerequisites, credit allocation, laboratory requirements, and professional electives catalog for autonomous batches.",
    category: "ACADEMIC",
    academic_year: "2026-2027",
    version: "v3.1",
    document_type: "PDF_CURRICULUM",
    file_url: "/documents/IT_Curriculum_Syllabus_2026.pdf",
    uploaded_by: "HOD Information Technology",
    status: "PUBLISHED",
    chunks_count: 64,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc_104",
    title: "Final Year Capstone Project Guidelines & Rubrics",
    description: "Phase 1 and Phase 2 project milestones, synopsis evaluation rubrics, guide allocation, and patent filing incentives.",
    category: "PROJECT",
    academic_year: "2026-2027",
    version: "v1.2",
    document_type: "PDF_ACADEMIC",
    file_url: "/documents/Capstone_Project_Guidelines.pdf",
    uploaded_by: "Department Project Coordinator",
    status: "PUBLISHED",
    chunks_count: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const defaultInitialNotices: Notice[] = [
  {
    id: "notice_1",
    title: "Mid-Term II Examination Schedule - October 2026",
    description: "Mid-Term Examinations for IV/IV B.Tech commence from October 27, 2026. Hall tickets available on the student portal after clearing tuition fee dues.",
    category: "EXAM",
    priority: "HIGH",
    deadline: "2026-10-25T17:00:00Z",
    published_at: new Date().toISOString(),
    status: "PUBLISHED",
    created_by: "Controller of Examinations",
    created_at: new Date().toISOString(),
  },
  {
    id: "notice_2",
    title: "Accenture Solutions Campus Recruitment Drive 2026",
    description: "Accenture full-time recruitment for Advanced Application Engineering Analyst (₹9.5 LPA). Eligible streams: IT, CSE, ECE. Minimum 65% aggregate with zero active backlogs.",
    category: "PLACEMENT",
    priority: "URGENT",
    deadline: "2026-10-05T23:59:00Z",
    published_at: new Date().toISOString(),
    status: "PUBLISHED",
    created_by: "Training & Placement Officer",
    created_at: new Date().toISOString(),
  },
  {
    id: "notice_3",
    title: "Smart India Hackathon (SIH) 2026 Internal Hackathon",
    description: "Internal institutional hackathon for selecting top 30 teams for National SIH 2026. Submit project abstract by October 12, 2026.",
    category: "PROJECT",
    priority: "NORMAL",
    deadline: "2026-10-12T18:00:00Z",
    published_at: new Date().toISOString(),
    status: "PUBLISHED",
    created_by: "Institution Innovation Council (IIC)",
    created_at: new Date().toISOString(),
  },
];

const defaultInitialPlacements: PlacementOpportunity[] = [
  {
    id: "p1",
    company: "Amazon Development Centre",
    role: "Software Development Engineer - I (AWS)",
    description: "Designing distributed microservices, caching layers, and high-throughput real-time telemetry systems.",
    salary: "₹44.0 LPA CTC",
    location: "Hyderabad, India",
    employment_type: "FULL_TIME",
    allowed_departments: ["IT", "CSE", "ECE"],
    minimum_cgpa: 8.0,
    max_backlogs: 0,
    graduation_year: 2027,
    deadline: "2026-10-20T23:59:00Z",
    test_date: "2026-10-24T10:00:00Z",
    interview_date: "2026-10-28T09:00:00Z",
    application_url: "https://amazon.jobs/university",
    status: "ACTIVE",
    created_at: new Date().toISOString(),
  },
  {
    id: "p2",
    company: "Accenture Solutions",
    role: "Advanced Application Engineering Analyst",
    description: "Developing scalable cloud microservices, enterprise integrations, and data engineering pipelines.",
    salary: "₹9.5 LPA CTC",
    location: "Bangalore / Hyderabad",
    employment_type: "FULL_TIME",
    allowed_departments: ["IT", "CSE", "ECE", "EEE"],
    minimum_cgpa: 6.5,
    max_backlogs: 0,
    graduation_year: 2027,
    deadline: "2026-10-05T23:59:00Z",
    test_date: "2026-10-10T14:00:00Z",
    interview_date: "2026-10-14T09:30:00Z",
    application_url: "https://accenture.com/campus",
    status: "ACTIVE",
    created_at: new Date().toISOString(),
  },
  {
    id: "p3",
    company: "Tata Consultancy Services (TCS)",
    role: "Digital & Prime Software Engineer",
    description: "Enterprise full-stack engineering, cloud infrastructure maintenance, and reactive UI implementation.",
    salary: "₹7.5 - ₹9.0 LPA CTC",
    location: "Visakhapatnam / Hyderabad",
    employment_type: "FULL_TIME",
    allowed_departments: ["IT", "CSE", "ECE", "MECH", "CIVIL"],
    minimum_cgpa: 7.0,
    max_backlogs: 1,
    graduation_year: 2027,
    deadline: "2026-10-18T23:59:00Z",
    test_date: "2026-10-22T09:00:00Z",
    application_url: "https://nextstep.tcs.com",
    status: "ACTIVE",
    created_at: new Date().toISOString(),
  },
];

const defaultInitialSkills: StudentSkill[] = [
  { id: "s1", student_id: "demo", skill_name: "Java", category: "Programming", proficiency_level: "ADVANCED", updated_at: new Date().toISOString() },
  { id: "s2", student_id: "demo", skill_name: "SQL", category: "Databases", proficiency_level: "INTERMEDIATE", updated_at: new Date().toISOString() },
  { id: "s3", student_id: "demo", skill_name: "Git", category: "Tools", proficiency_level: "INTERMEDIATE", updated_at: new Date().toISOString() },
  { id: "s4", student_id: "demo", skill_name: "React", category: "Frameworks", proficiency_level: "BEGINNER", updated_at: new Date().toISOString() },
];

const defaultInitialEmails: PrioritizedAnalyzedEmail[] = [];

const defaultInitialVoiceNotes: AudioSummary[] = [
  {
    id: "v1",
    student_id: "demo",
    title: "Placement Preparation Webinar",
    audio_url: "/uploads/placement_webinar.mp3",
    transcript:
      "Welcome everyone to today's Placement Preparation Webinar for Software Engineering Roles. Key expectations from top tech companies include strong proficiency in Data Structures and Algorithms, object-oriented design patterns, database indexing with SQL, and system architecture. The online coding assessment will take place next Friday at 10 AM. Make sure to solve at least 5 LeetCode medium problems on dynamic programming and graph algorithms this week.",
    short_summary:
      "Webinar covering key placement technical requirements: DSA, OOP, database indexing, system architecture, and upcoming Friday 10 AM assessment.",
    detailed_summary:
      "The speaker highlighted that top tech recruiters prioritize fundamental core computer science concepts over superficial framework knowledge. Candidates must focus on algorithmic complexity analysis, clean modular code design, and indexing strategies.",
    key_points: [
      "Target topics: DSA, OOP patterns, SQL Indexing, System Architecture",
      "Assessment Date: Next Friday at 10:00 AM",
      "Preparation goal: Solve 5 DP & Graph problems this week",
    ],
    action_items: [
      "Review Dynamic Programming Memoization patterns",
      "Complete SQL query optimization exercise",
      "Set reminder for Friday 10 AM assessment",
    ],
    extracted_dates: ["2026-10-15T10:00:00Z"],
    created_at: new Date().toISOString(),
  },
];

const defaultInitialNotifications: NotificationItem[] = [
  {
    id: "n_1",
    student_id: "demo",
    title: "Accenture Placement Registration",
    message: "Registration deadline is October 5, 2026. Verify eligibility now.",
    category: "PLACEMENT",
    read: false,
    link_url: "/student/placements",
    created_at: new Date().toISOString(),
  },
  {
    id: "n_2",
    student_id: "demo",
    title: "Mid-Term Exam Schedule",
    message: "Attendance verification deadline is October 25, 2026.",
    category: "EXAM",
    read: false,
    link_url: "/student/calendar",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const CampusStoreContext = createContext<CampusStoreContextType | undefined>(undefined);

export const CampusStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<CampusDocument[]>(defaultInitialDocuments);
  const [notices, setNotices] = useState<Notice[]>(defaultInitialNotices);
  const [placements, setPlacements] = useState<PlacementOpportunity[]>(defaultInitialPlacements);
  const [appliedPlacementIds, setAppliedPlacementIds] = useState<string[]>(["p1"]);
  const [skills, setSkills] = useState<StudentSkill[]>(defaultInitialSkills);
  const [emails, setEmails] = useState<PrioritizedAnalyzedEmail[]>(defaultInitialEmails);
  const [voiceNotes, setVoiceNotes] = useState<AudioSummary[]>(defaultInitialVoiceNotes);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultInitialNotifications);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedDocs = localStorage.getItem("campus_store_documents");
      if (storedDocs) setDocuments(JSON.parse(storedDocs));

      const storedNotices = localStorage.getItem("campus_store_notices");
      if (storedNotices) setNotices(JSON.parse(storedNotices));

      const storedPlacements = localStorage.getItem("campus_store_placements");
      if (storedPlacements) setPlacements(JSON.parse(storedPlacements));

      const storedApplied = localStorage.getItem("campus_store_applied");
      if (storedApplied) setAppliedPlacementIds(JSON.parse(storedApplied));

      const storedSkills = localStorage.getItem("campus_store_skills");
      if (storedSkills) setSkills(JSON.parse(storedSkills));

      const storedEmails = localStorage.getItem("campus_store_emails");
      if (storedEmails) setEmails(JSON.parse(storedEmails));

      const storedVoice = localStorage.getItem("campus_store_voice");
      if (storedVoice) setVoiceNotes(JSON.parse(storedVoice));

      const storedNotifs = localStorage.getItem("campus_store_notifications");
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    } catch (e) {
      console.warn("Storage load warning:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage helper
  const saveState = useCallback((key: string, val: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }, []);

  const addDocument = useCallback((doc: CampusDocument) => {
    setDocuments((prev) => {
      const next = [doc, ...prev];
      saveState("campus_store_documents", next);
      return next;
    });
  }, [saveState]);

  const publishDocument = useCallback((docId: string) => {
    setDocuments((prev) => {
      const next = prev.map((d) => (d.id === docId ? { ...d, status: "PUBLISHED" as const } : d));
      saveState("campus_store_documents", next);
      return next;
    });

    setDocuments((currentDocs) => {
      const targetDoc = currentDocs.find((d) => d.id === docId);
      if (targetDoc) {
        const newNotif: NotificationItem = {
          id: Math.random().toString(),
          student_id: "demo",
          title: `New Official Knowledge Published: ${targetDoc.title}`,
          message: `Official document version ${targetDoc.version} is now published in the AI Knowledge Base.`,
          category: "ACADEMIC",
          read: false,
          link_url: "/student/assistant",
          created_at: new Date().toISOString(),
        };
        setNotifications((prevNotifs) => {
          const nextNotifs = [newNotif, ...prevNotifs];
          saveState("campus_store_notifications", nextNotifs);
          return nextNotifs;
        });
      }
      return currentDocs;
    });
  }, [saveState]);

  const getPublishedChunks = useCallback(() => {
    const publishedDocs = documents.filter((d) => d.status === "PUBLISHED");
    const chunks: Array<{ document_title: string; version: string; page_number: number; content: string }> = [];

    publishedDocs.forEach((doc) => {
      if (doc.title.includes("Academic")) {
        chunks.push({
          document_title: doc.title,
          version: doc.version,
          page_number: 18,
          content:
            "Academic Regulations 2026 (Page 18): Students must maintain a minimum attendance of 75% across theoretical and practical courses. Attendance below 75% will result in exam disqualification unless condoned by Dean Academic Affairs with valid medical proof.",
        });
      } else if (doc.title.includes("Placement")) {
        chunks.push({
          document_title: doc.title,
          version: doc.version,
          page_number: 12,
          content:
            "Campus Placement Guidelines 2026 (Page 12): Placement registration requires CGPA >= 7.5 with zero active backlogs at the time of company registration. Approved departments include IT, CSE, and ECE.",
        });
      } else {
        chunks.push({
          document_title: doc.title,
          version: doc.version,
          page_number: 1,
          content: `${doc.title}: ${doc.description || "Official campus policy guideline."}`,
        });
      }
    });

    return chunks;
  }, [documents]);

  const addNotice = useCallback((noticeData: Omit<Notice, "id" | "created_at">) => {
    const newNotice: Notice = {
      ...noticeData,
      id: Math.random().toString(),
      created_at: new Date().toISOString(),
    };
    setNotices((prev) => {
      const next = [newNotice, ...prev];
      saveState("campus_store_notices", next);
      return next;
    });

    const newNotif: NotificationItem = {
      id: Math.random().toString(),
      student_id: "demo",
      title: `Official Notice: ${newNotice.title}`,
      message: newNotice.description.substring(0, 100),
      category: newNotice.category === "EXAM" ? "EXAM" : "ACADEMIC",
      read: false,
      link_url: "/student/dashboard",
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      saveState("campus_store_notifications", next);
      return next;
    });
  }, [saveState]);

  const addPlacement = useCallback((placementData: Omit<PlacementOpportunity, "id" | "created_at">) => {
    const newPlacement: PlacementOpportunity = {
      ...placementData,
      id: Math.random().toString(),
      created_at: new Date().toISOString(),
    };
    setPlacements((prev) => {
      const next = [newPlacement, ...prev];
      saveState("campus_store_placements", next);
      return next;
    });

    const newNotif: NotificationItem = {
      id: Math.random().toString(),
      student_id: "demo",
      title: `New Placement Drive: ${newPlacement.company}`,
      message: `Role: ${newPlacement.role} (${newPlacement.salary}). Deadline: ${new Date(newPlacement.deadline).toLocaleDateString()}`,
      category: "PLACEMENT",
      read: false,
      link_url: "/student/placements",
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      saveState("campus_store_notifications", next);
      return next;
    });
  }, [saveState]);

  const applyPlacement = useCallback((placementId: string) => {
    setAppliedPlacementIds((prev) => {
      if (prev.includes(placementId)) return prev;
      const next = [...prev, placementId];
      saveState("campus_store_applied", next);
      return next;
    });
  }, [saveState]);

  const addSkill = useCallback((name: string, category: StudentSkill["category"], level: StudentSkill["proficiency_level"]) => {
    const newSkill: StudentSkill = {
      id: Math.random().toString(),
      student_id: "demo",
      skill_name: name,
      category,
      proficiency_level: level,
      updated_at: new Date().toISOString(),
    };
    setSkills((prev) => {
      const next = [...prev, newSkill];
      saveState("campus_store_skills", next);
      return next;
    });
  }, [saveState]);

  const syncGmailInbox = useCallback(async (explicitEmail?: string) => {
    try {
      let targetEmail = explicitEmail;
      if (!targetEmail && typeof window !== "undefined") {
        const cached = localStorage.getItem("anits_campus_user_profile");
        if (cached) {
          try {
            targetEmail = JSON.parse(cached)?.email;
          } catch {}
        }
      }
      if (!targetEmail) {
        targetEmail = "aripakakarthik.23.it@anits.edu.in";
      }

      const res = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail: targetEmail }),
      });
      const data = await res.json();
      if (Array.isArray(data.emails)) {
        setEmails(data.emails);
        saveState("campus_store_emails", data.emails);
      }
    } catch (e) {
      console.error("Sync error:", e);
    }
  }, [saveState]);

  const addVoiceNote = useCallback((note: AudioSummary) => {
    setVoiceNotes((prev) => {
      const next = [note, ...prev];
      saveState("campus_store_voice", next);
      return next;
    });

    if (note.action_items && note.action_items.length > 0) {
      const newNotif: NotificationItem = {
        id: Math.random().toString(),
        student_id: "demo",
        title: `Voice Summary Action Items: ${note.title}`,
        message: `${note.action_items.length} action items extracted from audio recording.`,
        category: "ACADEMIC",
        read: false,
        link_url: "/student/voice",
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => {
        const next = [newNotif, ...prev];
        saveState("campus_store_notifications", next);
        return next;
      });
    }
  }, [saveState]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveState("campus_store_notifications", next);
      return next;
    });
  }, [saveState]);

  // Compute live unified deadlines across ALL sources (memoized for performance)
  const deadlines: DeadlineItem[] = useMemo(() => {
    const list: DeadlineItem[] = [];

    notices.forEach((n) => {
      if (n.deadline) {
        list.push({
          id: `d_n_${n.id}`,
          title: n.title,
          description: n.description,
          deadline: n.deadline,
          source_type: "OFFICIAL_NOTICE",
          category: n.category,
          priority: n.priority,
          status: "PENDING",
        });
      }
    });

    placements.forEach((p) => {
      if (p.deadline) {
        list.push({
          id: `d_p_${p.id}`,
          title: `${p.company} Placement Registration`,
          description: `Role: ${p.role} (${p.salary})`,
          deadline: p.deadline,
          source_type: "PLACEMENT",
          category: "PLACEMENT",
          priority: "HIGH",
          status: appliedPlacementIds.includes(p.id) ? "COMPLETED" : "PENDING",
        });
      }
    });

    emails.forEach((e) => {
      if (e.analysis?.extractedDeadline) {
        list.push({
          id: `d_e_${e.message_id}`,
          title: e.subject,
          description: e.analysis.summary,
          deadline: e.analysis.extractedDeadline,
          source_type: "GMAIL_EMAIL",
          category: e.analysis.category,
          priority: e.analysis.priority,
          status: "PENDING",
        });
      }
    });

    return list;
  }, [notices, placements, appliedPlacementIds, emails]);

  const contextValue = useMemo(
    () => ({
      documents,
      addDocument,
      publishDocument,
      getPublishedChunks,
      notices,
      addNotice,
      placements,
      appliedPlacementIds,
      addPlacement,
      applyPlacement,
      skills,
      addSkill,
      emails,
      syncGmailInbox,
      voiceNotes,
      addVoiceNote,
      deadlines,
      notifications,
      markNotificationRead,
      isInitialized,
    }),
    [
      documents,
      addDocument,
      publishDocument,
      getPublishedChunks,
      notices,
      addNotice,
      placements,
      appliedPlacementIds,
      addPlacement,
      applyPlacement,
      skills,
      addSkill,
      emails,
      syncGmailInbox,
      voiceNotes,
      addVoiceNote,
      deadlines,
      notifications,
      markNotificationRead,
      isInitialized,
    ]
  );

  return (
    <CampusStoreContext.Provider value={contextValue}>
      {children}
    </CampusStoreContext.Provider>
  );
};

export const useCampusStore = () => {
  const context = useContext(CampusStoreContext);
  if (!context) {
    throw new Error("useCampusStore must be used within a CampusStoreProvider");
  }
  return context;
};
