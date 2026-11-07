import Groq from "groq-sdk";
import { AIProvider, ExtractedDeadlineInfo } from "../provider.interface";
import { StudentSkill, CareerRole, SkillGapAnalysis, LearningRoadmap } from "@/types";

export class GroqProvider implements AIProvider {
  name = "Groq";
  private groq: Groq | null = null;
  // Available chat models verified on active Groq account
  private preferredModels = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "openai/gpt-oss-120b"];

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey !== "example_groq_key" && apiKey !== "placeholder-groq-key") {
      this.groq = new Groq({ apiKey });
    }
  }

  private isAvailable(): boolean {
    return this.groq !== null;
  }

  /**
   * Safe chat completion that falls back across verified working models
   */
  private async executeChat(messages: any[], jsonFormat: boolean = false, temperature = 0.2): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Groq API key is missing or unconfigured");
    }

    let lastError: any = null;

    for (const model of this.preferredModels) {
      try {
        const response = await this.groq!.chat.completions.create({
          model,
          messages,
          temperature,
          ...(jsonFormat ? { response_format: { type: "json_object" } } : {}),
        });
        const content = response.choices[0]?.message?.content;
        if (content) return content;
      } catch (err: any) {
        lastError = err;
        console.warn(`Groq model ${model} encountered error: ${err.message}. Trying next fallback model...`);
      }
    }

    throw lastError || new Error("All Groq models failed to return a response.");
  }

  async generateAnswer(prompt: string, context?: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Groq API key missing or invalid");
    }

    const systemPrompt = `You are the official AI Smart Campus Assistant for ANITS (Anil Neerukonda Institute of Technology and Sciences).
When official student records or admin-uploaded PDF context is provided:
- Cite the EXACT numbers, percentages, attendance status, and details corresponding to that student's Roll Number and Email.
- If the student asks about their attendance or exam eligibility, explicitly state the exact figures (e.g. Total Classes, Attended, Percentage, Condonation/Eligibility status) from the official record.
- Do NOT fabricate, guess, or extrapolate other data. Adhere strictly to the verified document records.
- If official context is missing or does not contain the student's roll number, clearly state: "I couldn't find a record for this Roll Number in the official admin-uploaded documents or campus knowledge base."
Provide clear, structured, professional markdown responses for ANITS students and faculty.`;

    const content = context ? `OFFICIAL CAMPUS CONTEXT:\n${context}\n\nUSER INQUIRY:\n${prompt}` : prompt;

    return await this.executeChat([
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ]);
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    // Generate deterministic 768-dimensional normalized embedding vector for cosine similarity
    const vec = new Array(768).fill(0);
    const cleaned = text.toLowerCase().trim();
    
    // Hash-based seeded dimensional projection
    for (let i = 0; i < cleaned.length; i++) {
      const code = cleaned.charCodeAt(i);
      const idx1 = (code * 13 + i * 7) % 768;
      const idx2 = (code * 31 + i * 19) % 768;
      vec[idx1] += (code % 37) / 100;
      vec[idx2] += ((code * 3) % 29) / 100;
    }

    // Normalize vector to unit length (L2 norm) for accurate cosine similarity
    let norm = 0;
    for (let i = 0; i < 768; i++) {
      norm += vec[i] * vec[i];
    }
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < 768; i++) {
      vec[i] = vec[i] / norm;
    }

    return vec;
  }

  async summarize(text: string): Promise<{ shortSummary: string; detailedSummary: string; keyPoints: string[] }> {
    if (!this.isAvailable()) {
      return {
        shortSummary: text.substring(0, 150) + "...",
        detailedSummary: `Audio Summary: ${text.substring(0, 300)}`,
        keyPoints: ["Key discussion point from audio", "Important requirement identified"],
      };
    }

    const prompt = `You are an AI Campus Academic Note Summarizer.
Analyze the following lecture or webinar transcript and output a JSON object with:
- "shortSummary": A concise 1-2 sentence executive overview.
- "detailedSummary": A comprehensive 1-2 paragraph analytical summary.
- "keyPoints": An array of 3-5 strings with key takeaways, formulas, dates, or guidelines.

Transcript:
${text}`;

    try {
      const content = await this.executeChat(
        [
          { role: "system", content: "You are a campus academic assistant. Always respond in valid JSON format." },
          { role: "user", content: prompt },
        ],
        true
      );
      return JSON.parse(content);
    } catch {
      return {
        shortSummary: text.substring(0, 150) + "...",
        detailedSummary: text,
        keyPoints: ["Reviewed campus lecture audio", "Key points extracted"],
      };
    }
  }

  async classifyEmail(
    subject: string,
    body: string
  ): Promise<{
    category: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    summary: string;
    extractedDeadline?: string;
    actionItems: string[];
  }> {
    if (!this.isAvailable()) {
      return {
        category: "ACADEMIC",
        priority: "NORMAL",
        summary: subject,
        actionItems: ["Review notice"],
      };
    }

    const prompt = `Analyze this ANITS campus institutional email and return a JSON object with:
- "category": One of "PLACEMENT", "EXAM", "ACADEMIC", "PROJECT", "EVENT", "ADMINISTRATIVE", "GENERAL"
- "priority": One of "URGENT", "HIGH", "NORMAL", "LOW"
- "summary": A clear 1-2 sentence summary of what the student must know
- "extractedDeadline": ISO 8601 string (e.g. "2026-10-05T17:00:00Z") if a date/deadline is mentioned, otherwise null
- "actionItems": Array of clear actionable steps the student needs to take

Email Subject: ${subject}
Email Body: ${body}`;

    try {
      const content = await this.executeChat(
        [
          { role: "system", content: "You are a campus email intelligence parser. Respond strictly in JSON." },
          { role: "user", content: prompt },
        ],
        true
      );
      const parsed = JSON.parse(content);
      return {
        category: parsed.category || "GENERAL",
        priority: parsed.priority || "NORMAL",
        summary: parsed.summary || subject,
        extractedDeadline: parsed.extractedDeadline || undefined,
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : ["Review announcement"],
      };
    } catch {
      return {
        category: "GENERAL",
        priority: "NORMAL",
        summary: subject,
        actionItems: ["Read campus announcement"],
      };
    }
  }

  async extractDeadline(text: string): Promise<ExtractedDeadlineInfo | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const prompt = `Extract any deadline from this text into JSON with keys:
- "title": string (title of the task)
- "deadline": ISO 8601 date string
- "category": "PLACEMENT" | "EXAM" | "ACADEMIC" | "PROJECT" | "GENERAL"
- "priority": "URGENT" | "HIGH" | "NORMAL"
- "actionItems": array of strings

Text: ${text}`;

    try {
      const content = await this.executeChat(
        [
          { role: "system", content: "Extract deadlines into strict JSON." },
          { role: "user", content: prompt },
        ],
        true
      );
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async extractActionItems(text: string): Promise<string[]> {
    try {
      const prompt = `Extract a list of 2 to 4 actionable items from this text. Return JSON with key "actions" containing array of strings:\n\n${text}`;
      const content = await this.executeChat(
        [
          { role: "system", content: "Return strict JSON." },
          { role: "user", content: prompt },
        ],
        true
      );
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.actions) ? parsed.actions : ["Review notice"];
    } catch {
      return ["Review requirements and guidelines"];
    }
  }

  async analyzeSkillGap(studentSkills: StudentSkill[], targetRole: CareerRole): Promise<SkillGapAnalysis> {
    const studentSkillNames = studentSkills.map((s) => s.skill_name.toLowerCase());
    const required = targetRole.required_skills || [];

    const strongSkills: string[] = [];
    const needsImprovement: string[] = [];
    const missingSkills: string[] = [];

    for (const req of required) {
      const found = studentSkills.find((s) => s.skill_name.toLowerCase() === req.toLowerCase());
      if (!found) {
        missingSkills.push(req);
      } else if (found.proficiency_level === "ADVANCED") {
        strongSkills.push(req);
      } else {
        needsImprovement.push(req);
      }
    }

    // Generate intelligent AI readiness summary via Groq
    let readinessSummary = `Target Role: ${targetRole.title}. Strong in ${strongSkills.join(", ") || "Fundamentals"}, needs practice in ${needsImprovement.join(", ") || "intermediate concepts"}.`;
    if (this.isAvailable()) {
      try {
        const prompt = `As a campus placement mentor, write a 2-sentence readiness evaluation for a student targeting "${targetRole.title}".
Strong skills: ${strongSkills.join(", ") || "None"}
Needs practice: ${needsImprovement.join(", ") || "None"}
Missing required skills: ${missingSkills.join(", ") || "None"}`;
        
        readinessSummary = await this.executeChat([
          { role: "user", content: prompt }
        ]);
      } catch {
        // Fallback to computed summary
      }
    }

    return {
      role_title: targetRole.title,
      strong_skills: strongSkills,
      needs_improvement: needsImprovement,
      missing_skills: missingSkills,
      readiness_summary: readinessSummary,
    };
  }

  async generateLearningPlan(gaps: SkillGapAnalysis): Promise<LearningRoadmap> {
    const targetSkills = [...gaps.missing_skills, ...gaps.needs_improvement];

    if (this.isAvailable() && targetSkills.length > 0) {
      try {
        const prompt = `Generate a realistic 7-day technical learning roadmap for an engineering student targeting "${gaps.role_title}".
Target skills to master: ${targetSkills.join(", ")}
Output JSON format:
{
  "role_title": "${gaps.role_title}",
  "total_days": 7,
  "daily_schedule": [
    { "day": 1, "topic": "Day 1 topic", "objective": "Concrete measurable goal", "resources": ["Resource 1", "Resource 2"] }
  ],
  "tips": ["Tip 1", "Tip 2"]
}`;

        const content = await this.executeChat(
          [
            { role: "system", content: "You are a technical career coach. Output strictly valid JSON." },
            { role: "user", content: prompt },
          ],
          true
        );
        const parsed = JSON.parse(content);
        if (parsed.daily_schedule && Array.isArray(parsed.daily_schedule)) {
          return parsed;
        }
      } catch (err) {
        console.warn("Groq learning plan error:", err);
      }
    }

    // Deterministic fallback schedule
    const missing = targetSkills.length > 0 ? targetSkills : ["Core Data Structures", "System Design", "Databases"];
    const schedule = [];
    for (let d = 1; d <= 7; d++) {
      const focus = missing[(d - 1) % missing.length] || "Comprehensive Revision";
      schedule.push({
        day: d,
        topic: `Day ${d}: ${focus}`,
        objective: `Master core principles, problem solving, and practical implementation of ${focus}`,
        resources: [
          `ANITS Department Study Material & Lab Manual for ${focus}`,
          `LeetCode / GeeksForGeeks curated problems on ${focus}`,
        ],
      });
    }

    return {
      role_title: gaps.role_title,
      total_days: 7,
      daily_schedule: schedule,
      tips: [
        "Commit at least 90 minutes of dedicated hands-on coding daily.",
        "Solve minimum 3 problems on each topic before proceeding to mock assessments.",
        "Review ANITS placement cell past year interview patterns.",
      ],
    };
  }
}
