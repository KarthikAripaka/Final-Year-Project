"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  CampusDocument,
  Notice,
  PlacementOpportunity,
  StudentSkill,
  EmailAnalysis,
  AudioSummary,
  DeadlineItem,
  NotificationItem,
  RAGCitation,
} from "@/types";

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
  addSkill: (name: string, category: any, level: any) => void;

  // Gmail Emails
  emails: any[];
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
    version: "2026.1",
    document_type: "PDF",
    file_url: "/uploads/anits_academic_regulations_2026.pdf",
    uploaded_by: "Dean of Academic Affairs (ANITS)",
    status: "PUBLISHED",
    chunks_count: 48,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc_102",
    title: "ANITS Campus Placement Guidelines & Recruiter Criteria 2026-27",
    description: "Placement eligibility criteria (7.0+ CGPA for Super Dream drives, 0 active backlogs), test schedules, Accenture (₹9.5 LPA), Amazon (₹44 LPA), and company registration procedures.",
    category: "PLACEMENT",
    academic_year: "2026-2027",
    version: "2026.2",
    document_type: "PDF",
    file_url: "/uploads/anits_placement_guidelines_2026.pdf",
    uploaded_by: "ANITS Training & Placement Cell",
    status: "PUBLISHED",
    chunks_count: 32,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc_103",
    title: "ANITS Department of IT - IV/IV B.Tech Syllabus & Capstone Guidelines",
    description: "Course syllabus for IT411 Full Stack Web Development, IT412 Cloud Computing & DevOps, IT413 Machine Learning, IT414 Cryptography, IT415 Capstone Project, and IT416 AI Lab.",
    category: "ACADEMIC",
    academic_year: "2026-2027",
    version: "2026.1",
    document_type: "PDF",
    file_url: "/uploads/anits_it_curriculum_2026.pdf",
    uploaded_by: "Head of Department (IT), ANITS",
    status: "PUBLISHED",
    chunks_count: 56,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const defaultInitialNotices: Notice[] = [
  {
    id: "n1",
    title: "IV/IV B.Tech Mid-Term Examination Schedule & Condonation Notice",
    description: "Mid-Term Examinations will commence from November 2, 2026. Hall tickets will be issued starting October 28. Attendance verification must be completed by department HODs by October 25. Students between 65%-74% attendance must submit medical condonation applications.",
    category: "EXAM",
    priority: "URGENT",
    status: "PUBLISHED",
    created_by: "Dean Academic Affairs (ANITS)",
    deadline: "2026-10-25T17:00:00Z",
    created_at: new Date().toISOString(),
  },
  {
    id: "n2",
    title: "Accenture Solutions Campus Recruitment Drive 2026-27 (₹9.5 LPA)",
    description: "Accenture is hiring for Advanced Application Developer. Minimum CGPA required is 7.5 with 0 active backlogs. All eligible IV/IV B.Tech IT & CSE students must register before October 5, 2026 at 5:00 PM.",
    category: "PLACEMENT",
    priority: "HIGH",
    status: "PUBLISHED",
    created_by: "ANITS Training & Placement Cell",
    deadline: "2026-10-05T17:00:00Z",
    created_at: new Date().toISOString(),
  },
  {
    id: "n3",
    title: "Department Capstone Project Phase-1 Abstract Review Schedule",
    description: "All final year B.Tech IT project batches must submit their Phase-1 architecture documents and problem abstracts for faculty panel review before October 20, 2026.",
    category: "PROJECT",
    priority: "NORMAL",
    status: "PUBLISHED",
    created_by: "Department Project Committee, IT",
    deadline: "2026-10-20T17:00:00Z",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const defaultInitialPlacements: PlacementOpportunity[] = [
  {
    id: "p1",
    company: "Accenture Solutions",
    role: "Advanced Application Developer",
    description: "Build cloud-native enterprise solutions using Microservices, Java, React, and DevOps pipelines.",
    salary: "₹9.5 LPA",
    location: "Bengaluru / Hyderabad",
    employment_type: "FULL_TIME",
    allowed_departments: ["IT", "CSE", "ECE"],
    minimum_cgpa: 7.5,
    max_backlogs: 0,
    graduation_year: 2026,
    deadline: "2026-10-05T17:00:00Z",
    test_date: "2026-10-15T10:00:00Z",
    interview_date: "2026-10-22T09:00:00Z",
    application_url: "https://accenture.campus.portal",
    status: "ACTIVE",
    created_at: new Date().toISOString(),
  },
  {
    id: "p2",
    company: "Deloitte USI",
    role: "Analyst — Technology Consulting",
    description: "Provide enterprise IT consulting, data analytics, and digital transformation services.",
    salary: "₹8.2 LPA",
    location: "Gurugram / Hyderabad",
    employment_type: "FULL_TIME",
    allowed_departments: ["IT", "CSE", "ECE", "EEE", "MECH"],
    minimum_cgpa: 7.0,
    max_backlogs: 0,
    graduation_year: 2026,
    deadline: "2026-10-12T18:00:00Z",
    test_date: "2026-10-20T10:00:00Z",
    interview_date: "2026-10-28T09:00:00Z",
    application_url: "https://deloitte.campus.portal",
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

const defaultInitialEmails: any[] = [];

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
  const [emails, setEmails] = useState<any[]>(defaultInitialEmails);
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
  const saveState = (key: string, val: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  };

  const addDocument = (doc: CampusDocument) => {
    setDocuments((prev) => {
      const next = [doc, ...prev];
      saveState("campus_store_documents", next);
      return next;
    });
  };

  const publishDocument = (docId: string) => {
    setDocuments((prev) => {
      const next = prev.map((d) => (d.id === docId ? { ...d, status: "PUBLISHED" as const } : d));
      saveState("campus_store_documents", next);
      return next;
    });

    // Generate system notification
    const targetDoc = documents.find((d) => d.id === docId);
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
      setNotifications((prev) => {
        const next = [newNotif, ...prev];
        saveState("campus_store_notifications", next);
        return next;
      });
    }
  };

  const getPublishedChunks = () => {
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
  };

  const addNotice = (noticeData: Omit<Notice, "id" | "created_at">) => {
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

    // Auto-generate notification
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
  };

  const addPlacement = (placementData: Omit<PlacementOpportunity, "id" | "created_at">) => {
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

    // Auto-generate notification
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
  };

  const applyPlacement = (placementId: string) => {
    setAppliedPlacementIds((prev) => {
      if (prev.includes(placementId)) return prev;
      const next = [...prev, placementId];
      saveState("campus_store_applied", next);
      return next;
    });
  };

  const addSkill = (name: string, category: any, level: any) => {
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
  };

  const syncGmailInbox = async (explicitEmail?: string) => {
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
  };

  const addVoiceNote = (note: AudioSummary) => {
    setVoiceNotes((prev) => {
      const next = [note, ...prev];
      saveState("campus_store_voice", next);
      return next;
    });

    // Auto-generate deadline if action item present
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
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveState("campus_store_notifications", next);
      return next;
    });
  };

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
      notices,
      placements,
      appliedPlacementIds,
      skills,
      emails,
      voiceNotes,
      deadlines,
      notifications,
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
