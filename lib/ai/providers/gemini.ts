import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, ExtractedDeadlineInfo } from "../provider.interface";
import { StudentSkill, CareerRole, SkillGapAnalysis, LearningRoadmap } from "@/types";

export class GeminiProvider implements AIProvider {
  name = "Gemini";
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = "gemini-1.5-flash";

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "example_gemini_key" && apiKey !== "placeholder-gemini-key") {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  private isAvailable(): boolean {
    return this.genAI !== null;
  }

  async generateAnswer(prompt: string, context?: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Gemini API key missing or invalid");
    }
    const fullPrompt = context
      ? `You are an AI Smart Campus Assistant for official university information.
GROUNDED CAMPUS KNOWLEDGE CONTEXT:
${context}

USER QUESTION:
${prompt}

Instructions: Answer strictly based on the official knowledge context provided above. If the information cannot be found in the context, explicitly state: "I couldn't verify this information from the official campus knowledge base."`
      : prompt;

    const model = this.genAI!.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.isAvailable()) {
      // Return 768-dim deterministic mock embedding vector in dev mode
      const dummyVec = new Array(768).fill(0);
      for (let i = 0; i < text.length && i < 768; i++) {
        dummyVec[i] = (text.charCodeAt(i) % 100) / 100;
      }
      return dummyVec;
    }
    const model = this.genAI!.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  async summarize(text: string): Promise<{ shortSummary: string; detailedSummary: string; keyPoints: string[] }> {
    if (!this.isAvailable()) {
      return {
        shortSummary: text.substring(0, 150) + "...",
        detailedSummary: `Detailed summary of audio content: ${text.substring(0, 300)}`,
        keyPoints: ["Important discussion point 1", "Key academic requirement 2", "Upcoming deadline highlighted"],
      };
    }
    const prompt = `Summarize the following transcript in JSON format with keys: "shortSummary", "detailedSummary", "keyPoints" (array of strings):\n\n${text}`;
    const model = this.genAI!.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(prompt);
    try {
      const jsonText = result.response.text().replace(/```json|```/g, "").trim();
      return JSON.parse(jsonText);
    } catch {
      return {
        shortSummary: result.response.text().substring(0, 150),
        detailedSummary: result.response.text(),
        keyPoints: ["Key discussion point extracted from recording"],
      };
    }
  }

  async classifyEmail(subject: string, body: string): Promise<{ category: string; priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"; summary: string; extractedDeadline?: string; actionItems: string[] }> {
    if (!this.isAvailable()) {
      return {
        category: subject.toLowerCase().includes("placement") ? "PLACEMENT" : "ACADEMIC",
        priority: "HIGH",
        summary: `Email regarding ${subject}: ${body.substring(0, 100)}`,
        extractedDeadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        actionItems: ["Review details and register prior to deadline"],
      };
    }
    const prompt = `Classify this student email into JSON:
Subject: ${subject}
Body: ${body}

JSON schema:
{
  "category": "ACADEMIC" | "PLACEMENT" | "EXAM" | "PROJECT" | "EVENT" | "URGENT",
  "priority": "LOW" | "NORMAL" | "HIGH" | "URGENT",
  "summary": "1-2 sentence summary",
  "extractedDeadline": "ISO date string or null",
  "actionItems": ["action item 1"]
}`;
    const model = this.genAI!.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(prompt);
    try {
      const jsonText = result.response.text().replace(/```json|```/g, "").trim();
      return JSON.parse(jsonText);
    } catch {
      return {
        category: "PLACEMENT",
        priority: "HIGH",
        summary: subject,
        actionItems: ["Check details"],
      };
    }
  }

  async extractDeadline(text: string): Promise<ExtractedDeadlineInfo | null> {
    if (!this.isAvailable()) {
      return {
        title: "Upcoming Academic Deadline",
        deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
        category: "ACADEMIC",
        priority: "HIGH",
        actionItems: ["Submit documents on portal"],
      };
    }
    const prompt = `Extract deadline details from text into JSON: "${text}". Keys: title, deadline, category, priority, actionItems.`;
    const model = this.genAI!.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(prompt);
    try {
      const jsonText = result.response.text().replace(/```json|```/g, "").trim();
      return JSON.parse(jsonText);
    } catch {
      return null;
    }
  }

  async extractActionItems(text: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return ["Review announcement", "Submit required response", "Verify eligibility"];
    }
    const prompt = `Extract action items as a simple JSON array of strings from: "${text}"`;
    const model = this.genAI!.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(prompt);
    try {
      const jsonText = result.response.text().replace(/```json|```/g, "").trim();
      return JSON.parse(jsonText);
    } catch {
      return ["Complete action items"];
    }
  }

  async analyzeSkillGap(studentSkills: StudentSkill[], targetRole: CareerRole): Promise<SkillGapAnalysis> {
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

    return {
      role_title: targetRole.title,
      strong_skills: strongSkills,
      needs_improvement: needsImprovement,
      missing_skills: missingSkills,
      readiness_summary: `Target Role: ${targetRole.title}. You have ${strongSkills.length} strong skills, ${needsImprovement.length} skills to strengthen, and ${missingSkills.length} missing skill areas.`,
    };
  }

  async generateLearningPlan(gaps: SkillGapAnalysis): Promise<LearningRoadmap> {
    const missing = gaps.missing_skills.concat(gaps.needs_improvement);
    const schedule = [];
    const days = Math.max(7, missing.length * 2);

    for (let d = 1; d <= days; d++) {
      const focusSkill = missing[(d - 1) % missing.length] || "Mock Assessment & Revision";
      schedule.push({
        day: d,
        topic: `Day ${d}: ${focusSkill} Fundamentals & Practice`,
        objective: `Master core concepts of ${focusSkill} and complete 2 practice problems.`,
        resources: [
          `Campus Library Resource: ${focusSkill} Guide`,
          `Practice Module: ${focusSkill} Problem Set`,
        ],
      });
    }

    return {
      role_title: gaps.role_title,
      total_days: days,
      daily_schedule: schedule,
      tips: [
        "Focus on hands-on coding practice daily.",
        "Review data structure complexity before technical interviews.",
        "Utilize mock interview sessions in placement portal.",
      ],
    };
  }
}
