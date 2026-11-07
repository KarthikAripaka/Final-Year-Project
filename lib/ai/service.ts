import { AIProvider } from "./provider.interface";
import { GeminiProvider } from "./providers/gemini";
import { GroqProvider } from "./providers/groq";
import { StudentSkill, CareerRole, SkillGapAnalysis, LearningRoadmap } from "@/types";

export class AIService {
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider;

  constructor() {
    const isGroqPrimary = process.env.AI_PRIMARY_PROVIDER === "groq";
    if (isGroqPrimary) {
      this.primaryProvider = new GroqProvider();
      this.fallbackProvider = new GeminiProvider();
    } else {
      this.primaryProvider = new GeminiProvider();
      this.fallbackProvider = new GroqProvider();
    }
  }

  async generateAnswer(prompt: string, context?: string): Promise<{ answer: string; provider: string }> {
    try {
      const answer = await this.primaryProvider.generateAnswer(prompt, context);
      return { answer, provider: this.primaryProvider.name };
    } catch (primaryErr) {
      console.warn(`Primary AI Provider (${this.primaryProvider.name}) failed. Attempting fallback...`, primaryErr);
      try {
        const answer = await this.fallbackProvider.generateAnswer(prompt, context);
        return { answer, provider: this.fallbackProvider.name };
      } catch (fallbackErr) {
        console.warn(`Fallback AI Provider (${this.fallbackProvider.name}) failed as well. Using Grounded Dev Mode fallback.`, fallbackErr);
        
        if (context) {
          return {
            answer: `[AI Campus Assistant Response]\nBased on official published documents:\n\n${context.substring(0, 400)}...\n\nFor official verification, please refer to the attached document citations.`,
            provider: "Campus-Engine (Grounded Dev Mode)",
          };
        }

        return {
          answer: "I couldn't verify this information from the official campus knowledge base.",
          provider: "Campus-Engine (Grounded Dev Mode)",
        };
      }
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      return await this.primaryProvider.generateEmbeddings(text);
    } catch {
      return await this.fallbackProvider.generateEmbeddings(text);
    }
  }

  async summarize(text: string) {
    try {
      return await this.primaryProvider.summarize(text);
    } catch {
      return await this.fallbackProvider.summarize(text);
    }
  }

  async classifyEmail(subject: string, body: string) {
    try {
      return await this.primaryProvider.classifyEmail(subject, body);
    } catch {
      return await this.fallbackProvider.classifyEmail(subject, body);
    }
  }

  async extractDeadline(text: string) {
    try {
      return await this.primaryProvider.extractDeadline(text);
    } catch {
      return await this.fallbackProvider.extractDeadline(text);
    }
  }

  async extractActionItems(text: string): Promise<string[]> {
    try {
      return await this.primaryProvider.extractActionItems(text);
    } catch {
      return await this.fallbackProvider.extractActionItems(text);
    }
  }

  async analyzeSkillGap(studentSkills: StudentSkill[], targetRole: CareerRole): Promise<SkillGapAnalysis> {
    try {
      return await this.primaryProvider.analyzeSkillGap(studentSkills, targetRole);
    } catch {
      return await this.fallbackProvider.analyzeSkillGap(studentSkills, targetRole);
    }
  }

  async generateLearningPlan(gaps: SkillGapAnalysis): Promise<LearningRoadmap> {
    try {
      return await this.primaryProvider.generateLearningPlan(gaps);
    } catch {
      return await this.fallbackProvider.generateLearningPlan(gaps);
    }
  }
}

export const aiService = new AIService();
