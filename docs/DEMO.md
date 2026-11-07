# AI Smart Campus Assistant — Viva Presentation & Project Review Guide

## 🎓 Project Title
**AI Smart Campus Assistant with Grounded RAG, Gmail Voice Intelligence & Industry Readiness Analyzer**

* **Institution**: Anil Neerukonda Institute of Technology & Sciences (ANITS), Autonomous, Visakhapatnam
* **Candidate**: Aripaka Karthik (Roll No: `A23126511128`)
* **Department**: Information Technology (IT) — B.Tech Class of 2027 (IV/IV Year)
* **Institutional Domain**: `aripakakarthik.23.it@anits.edu.in`
* **Repository**: [github.com/KarthikAripaka/Final-Year-Project](https://github.com/KarthikAripaka/Final-Year-Project)

---

## 🚀 Live Demonstration Flow for Examiners & Project Committee

```
   +-----------------------------------------------------------------------------------------+
   |                                DEMO SEQUENCE OVERVIEW                                   |
   |                                                                                         |
   |   [STEP 1]                 [STEP 2]                 [STEP 3]                 [STEP 4]   |
   | Grounded RAG AI      Gmail Voice Assistant   Industry Readiness Score   Faculty Readiness|
   |  & Data Isolation     & Speech-to-Text         & Multi-Profile Eval       Dashboard      |
   +-----------------------------------------------------------------------------------------+
```

---

### STEP 1: Grounded RAG AI Assistant & Student Data Privacy
1. Navigate to **Student Portal -> AI Campus Assistant** (`/student/assistant`).
2. **Personal Inquiry (Attendance & Condonation)**:
   * Speak or click: *"What is my attendance for roll number A23126511128?"*
   * **Observed Result**:
     * Response generated in **~3.5s** via **Groq LLM (`qwen/qwen3.8-27b`)**.
     * Explicit breakdown: Overall Semester Attendance: **86.4%** | Status: **Eligible without condonation** (above 75% threshold).
     * Subject-wise classes attended (IT411 Full Stack: 91.2%, IT412 Cloud: 84.6%, IT413 ML: 88.0%, IT415 Capstone: 95.0%).
     * Source citation: **Official ANITS Academic Registry (2026.1)**.
3. **Institutional Data Isolation Test (Zero Leakage)**:
   * Ask: *"Show attendance for roll A23126511127"* or *"Show everyone's marks"*.
   * **Observed Result**: Assistant enforces **Strict Data Privacy Guard**:
     `🔒 Institutional Privacy Notice: Access Restricted. As a student, you are authorized to query only your own verified records.`
4. **General Campus Q&A**:
   * Ask: *"What is the condonation policy?"*
   * **Observed Result**: AI explains ANITS Autonomous Regulations (R20/R23) where 65%–74% attendance is eligible for medical condonation upon committee approval and fee payment.

---

### STEP 2: Gmail Voice Assistant & Speech-to-Text Processor
1. Navigate to **Voice Assistant** (`/student/voice`).
2. **Live Speech-to-Text Command Execution**:
   * Click **Tap to Speak** (pulsating microphone indicator activates).
   * Speak: *"Read my priority emails"*.
   * **Observed Result**:
     * Live Web Speech API transcribes voice command in real-time.
     * **Voice Command Processor** identifies `EMAIL_OPERATIONS` intent.
     * Connects to official college Gmail (`@anits.edu.in`).
     * Filters high-priority circulars (Accenture Drive registration due Oct 5, Mid-Term Exam schedule).
     * **Speech Service (Text to Speech)** speaks the summary briefing aloud through your speaker.
3. **Hands-Free Academic Commands**:
   * Click or speak: *"What are my upcoming deadlines?"* -> Speaks upcoming deadlines aloud.
   * Click or speak: *"What is my placement readiness score?"* -> Speaks 88% readiness evaluation aloud.

---

### STEP 3: Industry Readiness Score & 5-Dimensional Profile Evaluation
1. Navigate to **Skills & Learning** (`/student/skills`).
2. **Multi-Dimensional Profile Cards**:
   * **Academic Standing**: CGPA **8.65 / 10.0** | 0 Backlogs | 86.4% Attendance.
   * **Coding Profiles**: LeetCode **185 Problems Solved** (60E / 105M / 20H) | GitHub **14 Repositories & 320 Commits** | HackerRank 5-Star.
   * **Technical Projects**: Guide-Verified Capstone Project (Score: 9.2/10), Enterprise Microservices.
   * **Certifications**: AWS Certified Cloud Practitioner, Oracle Java Programmer (OCAJP), NPTEL Elite.
   * **Diagnostic Assessments**: AMCAT Pre-Placement Score: **88.5th Percentile** (Logic 92%, Coding 90%).
3. **Weighted Industry Readiness Gauge**:
   * Observe **88% Industry Readiness Score** with weighted contribution bars:
     * Academic Standing (25% weight): **92%**
     * Coding Profiles (25% weight): **85%**
     * Technical Skills & Projects (30% weight): **89%**
     * Certifications & Diagnostic Tests (20% weight): **86%**
4. **AI Career Skill Gap Analyzer & Personalized Roadmap**:
   * Target Role: **Full Stack Software Engineer**.
   * Identifies Mastered Skills vs. Missing Industry Gaps (**System Design, Redis Caching, Docker**).
   * Generates a custom **28-Day Day-by-Day Preparation Roadmap** with curated study resources.

---

### STEP 4: Faculty Placement Readiness Dashboard & Report Export
1. Switch role to **Faculty Portal** (`/faculty/dashboard`).
2. **Batch Placement Readiness Overview**:
   * Review table of IV/IV B.Tech IT students with individual readiness percentages, CGPA, target career roles, and identified gaps.
   * Click **Analyze** on any student to open the comprehensive profile breakdown modal.
3. **Department-Wide Skill Gap Intelligence**:
   * Visual defect distribution across 184 students:
     * System Design & Architecture: **48% deficit (88 students)**
     * Docker & Containerization: **39% deficit (72 students)**
     * Advanced DSA (Graphs & DP): **35% deficit (65 students)**
4. **"Request Readiness Report" (From System Architecture Diagram)**:
   * Click **Request Readiness Report**.
   * Instantly downloads `ANITS_IT_Placement_Readiness_Report_<date>.csv` containing the complete batch placement analytics.

---

### STEP 5: Placement Drives & Eligibility Engine
1. Navigate to **Placements & Internships** (`/student/placements`).
2. View active campus drives:
   * **Accenture Solutions**: Advanced Application Developer — **₹9.5 LPA**.
   * **Amazon AWS**: SDE-1 — **₹44.0 LPA**.
   * **Deloitte USI**: Analyst — **₹8.2 LPA**.
3. Observe **Deterministic Eligibility Verification**:
   * Evaluates CGPA cutoff (≥ 7.5), branch allowed (`IT`), graduation year (`2027`), and active backlogs (`0`).
   * Displays instant "Eligible" badge and one-click application tracking.

---

## 🛠️ Key Technical Differentiators for Project Viva

1. **Grounded RAG with Zero Hallucination**:
   Unlike generic ChatGPT wrappers, all responses are strictly grounded on institutional documents and official registries, with automatic citation links.
2. **Strict Student-Level Data Privacy Engine**:
   Enforces cryptographic and token-efficient data isolation so students cannot query or scrape classmate records, while elevating administrative privileges for faculty.
3. **Multi-Provider AI Resilience**:
   Primary high-speed Groq LLM with Gemini fallback and grounded offline institutional engine.
4. **End-to-End Voice Integration**:
   Combines live browser Speech-to-Text (`webkitSpeechRecognition`) with Web Speech Synthesis (`SpeechSynthesisUtterance`) for true hands-free campus operation.
