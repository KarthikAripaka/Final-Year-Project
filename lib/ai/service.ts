import { AIProvider } from "./provider.interface";
import { GeminiProvider } from "./providers/gemini";
import { GroqProvider } from "./providers/groq";
import { StudentSkill, CareerRole, SkillGapAnalysis, LearningRoadmap } from "@/types";

export class AIService {
  private getProviders(): { primary: AIProvider; fallback: AIProvider } {
    const isGroqPrimary = (process.env.AI_PRIMARY_PROVIDER || "groq").toLowerCase() === "groq";
    if (isGroqPrimary) {
      return { primary: new GroqProvider(), fallback: new GeminiProvider() };
    }
    return { primary: new GeminiProvider(), fallback: new GroqProvider() };
  }

  async generateAnswer(prompt: string, context?: string): Promise<{ answer: string; provider: string }> {
    const { primary, fallback } = this.getProviders();
    try {
      const answer = await primary.generateAnswer(prompt, context);
      return { answer, provider: primary.name };
    } catch (primaryErr) {
      console.warn(`Primary AI Provider (${primary.name}) failed. Attempting fallback...`, primaryErr);
      try {
        const answer = await fallback.generateAnswer(prompt, context);
        return { answer, provider: fallback.name };
      } catch (fallbackErr) {
        console.warn(`Fallback AI Provider (${fallback.name}) failed as well. Using Grounded Dev Mode fallback.`, fallbackErr);
        
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
    const { primary, fallback } = this.getProviders();
    try {
      return await primary.generateEmbeddings(text);
    } catch {
      return await fallback.generateEmbeddings(text);
    }
  }

  async summarize(text: string) {
    const { primary, fallback } = this.getProviders();
    try {
      return await primary.summarize(text);
    } catch {
      return await fallback.summarize(text);
    }
  }

  async classifyEmail(subject: string, body: string) {
    const { primary, fallback } = this.getProviders();
    try {
      return await primary.classifyEmail(subject, body);
    } catch {
      return await fallback.classifyEmail(subject, body);
    }
  }

  async extractDeadline(text: string) {
    const { primary, fallback } = this.getProviders();
    try {
      return await primary.extractDeadline(text);
    } catch {
      return await fallback.extractDeadline(text);
    }
  }

  async extractActionItems(text: string): Promise<string[]> {
    const { primary, fallback } = this.getProviders();
    try {
      return await primary.extractActionItems(text);
    } catch {
      return await fallback.extractActionItems(text);
    }
  }

  async analyzeSkillGap(studentSkills: StudentSkill[], targetRole: CareerRole): Promise<SkillGapAnalysis> {
    const { primary, fallback } = this.getProviders();
    try {
      return await primary.analyzeSkillGap(studentSkills, targetRole);
    } catch {
      return await fallback.analyzeSkillGap(studentSkills, targetRole);
    }
  }

  async generateLearningPlan(gaps: SkillGapAnalysis): Promise<LearningRoadmap> {
    const { primary, fallback } = this.getProviders();
    try {
      return await primary.generateLearningPlan(gaps);
    } catch {
      return await fallback.generateLearningPlan(gaps);
    }
  }
}

export const aiService = new AIService();
