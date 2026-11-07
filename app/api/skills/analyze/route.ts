import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/service";
import { StudentSkill, CareerRole } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { studentSkills, targetRole } = await request.json();

    const skills: StudentSkill[] = studentSkills || [
      { id: "s1", student_id: "demo", skill_name: "Java", category: "Programming", proficiency_level: "ADVANCED", updated_at: "" },
      { id: "s2", student_id: "demo", skill_name: "SQL", category: "Databases", proficiency_level: "INTERMEDIATE", updated_at: "" },
      { id: "s3", student_id: "demo", skill_name: "Git", category: "Tools", proficiency_level: "INTERMEDIATE", updated_at: "" },
    ];

    const role: CareerRole = targetRole || {
      id: "role_swe",
      title: "Software Engineer",
      description: "Full-stack software developer proficient in DSA, databases, OOP, and system design.",
      required_skills: ["Java", "DSA", "OOP", "DBMS", "SQL", "Git", "System Design"],
    };

    const gapAnalysis = await aiService.analyzeSkillGap(skills, role);
    const learningRoadmap = await aiService.generateLearningPlan(gapAnalysis);

    return NextResponse.json({
      success: true,
      gapAnalysis,
      learningRoadmap,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to run skill gap analysis" }, { status: 500 });
  }
}
