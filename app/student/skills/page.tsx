"use client";

import React, { useState } from "react";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Award, CheckCircle2, AlertTriangle, Plus, Sparkles, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { SkillGapAnalysis, LearningRoadmap } from "@/types";

export default function SkillsPage() {
  const { skills, addSkill } = useCampusStore();

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("INTERMEDIATE");
  const [newSkillCategory, setNewSkillCategory] = useState<any>("Programming");

  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [isLoading, setIsLoading] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    addSkill(newSkillName.trim(), newSkillCategory, newSkillLevel);
    setNewSkillName("");
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/skills/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentSkills: skills,
          targetRole: {
            id: "role_1",
            title: targetRole,
            description: "Full-stack software engineering role",
            required_skills: ["Java", "DSA", "OOP", "DBMS", "SQL", "Git", "System Design"],
          },
        }),
      });
      const data = await res.json();
      setGapAnalysis(data.gapAnalysis);
      setRoadmap(data.learningRoadmap);
    } catch (err) {
      console.error("Skill gap analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" /> Student Skill Profile & Learning Roadmap
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Maintain your skill set, analyze career role gaps, and receive explainable personalized learning roadmaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 span): Skills Profile Manager */}
        <div className="flex flex-col gap-6">
          <Card className="border-slate-800 bg-slate-900/90">
            <CardHeader>
              <CardTitle>Your Skills Matrix ({skills.length})</CardTitle>
              <CardDescription>Add and update your proficiency levels.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Data Structures, Python, Docker"
                />
                <div className="flex gap-2">
                  <Select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    options={[
                      { label: "Programming", value: "Programming" },
                      { label: "Frameworks", value: "Frameworks" },
                      { label: "Databases", value: "Databases" },
                      { label: "DSA", value: "DSA" },
                      { label: "Tools", value: "Tools" },
                    ]}
                  />
                  <Select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as any)}
                    options={[
                      { label: "Beginner", value: "BEGINNER" },
                      { label: "Intermediate", value: "INTERMEDIATE" },
                      { label: "Advanced", value: "ADVANCED" },
                    ]}
                  />
                </div>
                <Button onClick={handleAddSkill} leftIcon={<Plus className="w-4 h-4" />} variant="primary" size="sm">
                  Add Skill
                </Button>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {skills.map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">{s.skill_name}</span>
                      <p className="text-[10px] text-slate-400">{s.category}</p>
                    </div>
                    <Badge variant={s.proficiency_level === "ADVANCED" ? "success" : s.proficiency_level === "INTERMEDIATE" ? "primary" : "outline"} size="sm">
                      {s.proficiency_level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (2 span): Skill Gap Analysis & Roadmap */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border-indigo-500/30 bg-slate-900/90">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Career Skill Gap Analyzer
                </CardTitle>
                <CardDescription>Select target placement role to run instant gap assessment.</CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  options={[
                    { label: "Software Engineer", value: "Software Engineer" },
                    { label: "Data Engineer", value: "Data Engineer" },
                    { label: "Cloud Consultant", value: "Cloud Consultant" },
                  ]}
                />
                <Button onClick={handleRunAnalysis} isLoading={isLoading} variant="emerald" size="sm">
                  Analyze Gaps
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {!gapAnalysis && !isLoading && (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                  Click "Analyze Gaps" to compare your skills matrix against target role requirements.
                </div>
              )}

              {gapAnalysis && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Readiness Assessment:</strong> {gapAnalysis.readiness_summary}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/60">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4" /> Strong Skills ({gapAnalysis.strong_skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {gapAnalysis.strong_skills.map((sk, i) => (
                          <Badge key={i} variant="success" size="sm">{sk}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/60">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Needs Practice ({gapAnalysis.needs_improvement.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {gapAnalysis.needs_improvement.map((sk, i) => (
                          <Badge key={i} variant="warning" size="sm">{sk}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/60">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Missing Skills ({gapAnalysis.missing_skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {gapAnalysis.missing_skills.map((sk, i) => (
                          <Badge key={i} variant="danger" size="sm">{sk}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personalized Learning Roadmap */}
          {roadmap && (
            <Card className="border-slate-800 bg-slate-900/90 animate-in fade-in duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" /> Day-by-Day Personalized Learning Roadmap
                </CardTitle>
                <CardDescription>
                  Customized {roadmap.total_days}-Day preparation plan tailored for {roadmap.role_title}.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {roadmap.daily_schedule.map((item) => (
                  <div key={item.day} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      D{item.day}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-100">{item.topic}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.objective}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.resources.map((res, idx) => (
                          <span key={idx} className="text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/60">
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
