import { SkillGapAnalysis, LearningRoadmap, StudentSkill, CareerRole } from "@/types";

export interface ExtractedDeadlineInfo {
  title: string;
  deadline: string;
  category: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  actionItems: string[];
}

export interface AIProvider {
  name: string;
  generateAnswer(prompt: string, context?: string): Promise<string>;
  generateEmbeddings(text: string): Promise<number[]>;
  summarize(text: string): Promise<{ shortSummary: string; detailedSummary: string; keyPoints: string[] }>;
  classifyEmail(subject: string, body: string): Promise<{ category: string; priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"; summary: string; extractedDeadline?: string; actionItems: string[] }>;
  extractDeadline(text: string): Promise<ExtractedDeadlineInfo | null>;
  extractActionItems(text: string): Promise<string[]>;
  analyzeSkillGap(studentSkills: StudentSkill[], targetRole: CareerRole): Promise<SkillGapAnalysis>;
  generateLearningPlan(gaps: SkillGapAnalysis): Promise<LearningRoadmap>;
}
