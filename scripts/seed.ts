import { createAdminClient } from "../lib/supabase/admin";
import { GroqProvider } from "../lib/ai/providers/groq";

async function seedDatabase() {
  console.log("🌱 Starting ANITS AI Smart Campus Assistant Database Seed...");

  const supabase = createAdminClient();
  const groq = new GroqProvider();

  // 1. Departments Seed
  const departments = [
    { code: "IT", name: "Information Technology", head_of_department: "Prof. K. Srinivas" },
    { code: "CSE", name: "Computer Science & Engineering", head_of_department: "Dr. M. Ramakrishna Murty" },
    { code: "ECE", name: "Electronics & Communication Engineering", head_of_department: "Dr. V. Kulkarni" },
    { code: "EEE", name: "Electrical & Electronics Engineering", head_of_department: "Dr. P. Rajasekhar" },
    { code: "MECH", name: "Mechanical Engineering", head_of_department: "Dr. T. Subrahmanyam" },
    { code: "CIVIL", name: "Civil Engineering", head_of_department: "Dr. K. Murali" },
    { code: "CSM", name: "Computer Science (AI & ML)", head_of_department: "Dr. S. Deepa" },
    { code: "CSD", name: "Computer Science (Data Science)", head_of_department: "Dr. R. Anuradha" },
  ];

  console.log("Seeding ANITS departments...");
  try {
    const { data: deptData, error: deptErr } = await supabase
      .from("departments")
      .upsert(departments, { onConflict: "code" })
      .select();

    if (deptErr) {
      console.warn("Departments seed error:", deptErr.message);
    } else {
      console.log(`✅ ${deptData?.length || departments.length} Departments seeded successfully.`);
    }
  } catch (err: any) {
    console.warn("Department seed warning:", err.message);
  }

  // 2. Career Roles Seed
  const roles = [
    {
      title: "Software Development Engineer (SDE)",
      description: "Full-stack and backend software engineer proficient in DSA, System Design, Java, Spring Boot, and databases.",
      required_skills: ["Java", "DSA", "SQL", "OOP", "System Design", "Git", "Spring Boot"],
    },
    {
      title: "Cloud & DevOps Engineer",
      description: "Cloud infrastructure architect specialist in AWS/Azure, Docker, Kubernetes, CI/CD, and Linux scripting.",
      required_skills: ["Docker", "Kubernetes", "AWS", "Linux", "Git", "CI/CD", "Python"],
    },
    {
      title: "Full Stack Web Developer",
      description: "Modern web engineer proficient in React, Next.js, Node.js, TypeScript, REST APIs, and PostgreSQL.",
      required_skills: ["React", "TypeScript", "Node.js", "SQL", "Git", "REST APIs", "Tailwind CSS"],
    },
  ];

  console.log("Seeding career roles...");
  try {
    const { error: roleErr } = await supabase.from("career_roles").upsert(roles, { onConflict: "title" });
    if (roleErr) console.warn("Error seeding roles:", roleErr.message);
    else console.log("✅ Career roles seeded successfully.");
  } catch (err: any) {
    console.warn("Career role seed warning:", err.message);
  }

  // 3. Placements Seed
  const placements = [
    {
      company: "Accenture Solutions",
      role: "Advanced Application Developer",
      description: "Build cloud-native enterprise microservices, event-driven architectures, and scalable web solutions.",
      salary: "₹9.5 LPA",
      location: "Bengaluru / Hyderabad",
      employment_type: "FULL_TIME",
      allowed_departments: ["IT", "CSE", "ECE"],
      minimum_cgpa: 7.5,
      max_backlogs: 0,
      graduation_year: 2027,
      deadline: "2026-10-05T17:00:00Z",
      test_date: "2026-10-15T10:00:00Z",
      interview_date: "2026-10-22T09:00:00Z",
      application_url: "https://anits.edu.in/placements/accenture",
      status: "ACTIVE",
    },
    {
      company: "ServiceNow",
      role: "Associate Software Engineer",
      description: "Enterprise digital workflow platform engineering, scalable cloud APIs, and distributed systems.",
      salary: "₹16.0 LPA",
      location: "Hyderabad",
      employment_type: "FULL_TIME",
      allowed_departments: ["IT", "CSE"],
      minimum_cgpa: 8.0,
      max_backlogs: 0,
      graduation_year: 2027,
      deadline: "2026-10-18T18:00:00Z",
      test_date: "2026-10-25T10:00:00Z",
      interview_date: "2026-11-02T09:00:00Z",
      application_url: "https://anits.edu.in/placements/servicenow",
      status: "ACTIVE",
    },
    {
      company: "Cognizant Technology Solutions",
      role: "GenC Elevate — Digital Specialist",
      description: "Full-stack development, modern web applications, and enterprise software engineering.",
      salary: "₹7.0 LPA",
      location: "Chennai / Hyderabad",
      employment_type: "FULL_TIME",
      allowed_departments: ["IT", "CSE", "ECE", "EEE", "MECH"],
      minimum_cgpa: 7.0,
      max_backlogs: 0,
      graduation_year: 2027,
      deadline: "2026-10-12T17:00:00Z",
      test_date: "2026-10-20T10:00:00Z",
      interview_date: "2026-10-28T09:00:00Z",
      application_url: "https://anits.edu.in/placements/cognizant",
      status: "ACTIVE",
    },
  ];

  console.log("Seeding placement opportunities...");
  try {
    const { error: pErr } = await supabase.from("placements").upsert(placements, { onConflict: "company,role" });
    if (pErr) console.warn("Error seeding placements:", pErr.message);
    else console.log("✅ Placement drives seeded successfully.");
  } catch (err: any) {
    console.warn("Placement seed warning:", err.message);
  }

  // 4. Official ANITS Documents & Chunks for Grounded RAG
  console.log("Seeding official documents & RAG chunks...");
  try {
    const doc = {
      title: "ANITS Autonomous Academic Regulations 2023-2027 (R20/R23)",
      description: "Official statutory rules on grading system, minimum attendance (75%), condonation, detention, and degree criteria.",
      category: "REGULATION",
      academic_year: "2023-2027",
      version: "R23.2",
      document_type: "PDF",
      file_url: "/uploads/anits_academic_regulations_r23.pdf",
      status: "PUBLISHED",
      chunks_count: 4,
    };

    const { data: insertedDoc } = await supabase
      .from("documents")
      .upsert(doc, { onConflict: "title" })
      .select()
      .maybeSingle();

    if (insertedDoc) {
      const chunks = [
        {
          document_id: insertedDoc.id,
          page_number: 12,
          content: "RULE 4.1 ATTENDANCE REQUIREMENT: A candidate shall be deemed to have eligibility to write Semester End Examinations only if he/she puts in a minimum of 75% of attendance in aggregate of all the subjects in that semester. Condonation of shortage of attendance between 65% and 74% may be granted on medical grounds provided valid certificates are submitted along with the prescribed condonation fee within 3 days of announcement.",
          metadata: { section: "Attendance & Condonation", regulation: "R23" },
        },
        {
          document_id: insertedDoc.id,
          page_number: 13,
          content: "RULE 4.2 DETENTION: A student who earns less than 65% of aggregate attendance in any semester shall be detained and will not be permitted to take the Semester End Examinations. Such candidate shall repeat the semester when offered next.",
          metadata: { section: "Detention Policy", regulation: "R23" },
        },
        {
          document_id: insertedDoc.id,
          page_number: 24,
          content: "RULE 7.3 PLACEMENT ELIGIBILITY NORMS: To be considered eligible for Tier-1 Super Dream placements (salary >= 9 LPA), a student must possess a minimum CGPA of 7.5 with zero active backlogs at the commencement of the recruitment drive. Mass recruiters require minimum 65% aggregate or 6.5 CGPA with maximum 1 active backlog.",
          metadata: { section: "Placements Eligibility", regulation: "R23" },
        },
        {
          document_id: insertedDoc.id,
          page_number: 35,
          content: "RULE 9.1 CAPSTONE PROJECT EVALUATION: Final year capstone projects are divided into Phase-1 (Seventh Semester) and Phase-2 (Eighth Semester). Phase-1 carries 100 marks (30% internal continuous evaluation by faculty guide + 70% external committee viva). Deliverables include working source code, architecture document, and demonstration.",
          metadata: { section: "Capstone Project", regulation: "R23" },
        },
      ];

      for (const ch of chunks) {
        const embedding = await groq.generateEmbeddings(ch.content);
        await supabase.from("document_chunks").upsert(
          {
            document_id: ch.document_id,
            page_number: ch.page_number,
            content: ch.content,
            embedding,
            metadata: ch.metadata,
          },
          { onConflict: "document_id,page_number" }
        );
      }
      console.log("✅ ANITS Official Knowledge Base Documents & Chunks seeded.");
    }
  } catch (err: any) {
    console.warn("Document seed warning:", err.message);
  }

  // 5. Official Notices Seed
  const notices = [
    {
      title: "IV/IV B.Tech Mid-Term Examination Timetable & Condonation Schedule",
      description: "Mid-Term Examinations commence November 2, 2026. Hall tickets issued October 28. Attendance verification must be completed by department HODs by October 25. Condonation fee is applicable for attendance between 65% and 74%.",
      category: "EXAM",
      priority: "URGENT",
      status: "PUBLISHED",
      created_by: "Dean Academic Affairs (ANITS)",
      deadline: "2026-10-25T17:00:00Z",
    },
    {
      title: "Accenture Solutions Campus Recruitment Drive 2026-27",
      description: "Registration deadline is October 5, 2026 at 5:00 PM on the ANITS placement portal. Eligibility: B.Tech IT/CSE/ECE with minimum 7.5 CGPA and 0 active backlogs.",
      category: "PLACEMENT",
      priority: "HIGH",
      status: "PUBLISHED",
      created_by: "ANITS Training & Placement Cell",
      deadline: "2026-10-05T17:00:00Z",
    },
    {
      title: "Final Year Capstone Project Phase-1 Guide Review Schedule",
      description: "Phase-1 project demonstrations and documentation submissions must be completed with assigned faculty guides by October 20, 2026.",
      category: "PROJECT",
      priority: "HIGH",
      status: "PUBLISHED",
      created_by: "HOD Information Technology",
      deadline: "2026-10-20T17:00:00Z",
    },
  ];

  console.log("Seeding ANITS official notices...");
  try {
    const { error: nErr } = await supabase.from("notices").upsert(notices, { onConflict: "title" });
    if (nErr) console.warn("Error seeding notices:", nErr.message);
    else console.log("✅ ANITS notices seeded successfully.");
  } catch (err: any) {
    console.warn("Notices seed warning:", err.message);
  }

  console.log("🎉 ANITS Database Seed Complete!");
}

seedDatabase().catch((err) => {
  console.error("❌ Seed error:", err);
});
