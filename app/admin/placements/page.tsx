"use client";

import React, { useState } from "react";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Briefcase, Plus } from "lucide-react";

export default function AdminPlacementsPage() {
  const { placements, addPlacement } = useCampusStore();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("₹10.0 LPA");
  const [minCgpa, setMinCgpa] = useState("7.5");

  const handleAddPlacement = () => {
    if (!company.trim()) return;
    addPlacement({
      company,
      role: role || "Software Engineer",
      description: `Campus recruitment drive for ${company}. Full-time software role.`,
      salary,
      location: "Bengaluru / Remote",
      employment_type: "FULL_TIME",
      allowed_departments: ["IT", "CSE"],
      minimum_cgpa: parseFloat(minCgpa),
      max_backlogs: 0,
      graduation_year: 2026,
      deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
      status: "ACTIVE",
    });
    setCompany("");
    setRole("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-400" /> Admin Placement Drive Management
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure campus placement recruitment drives, minimum CGPA rules, and department criteria.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader>
            <CardTitle>Post Placement Opportunity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Amazon India" />
            <Input label="Role Title" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Development Engineer" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Salary Package" value={salary} onChange={(e) => setSalary(e.target.value)} />
              <Input label="Minimum CGPA" value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} />
            </div>
            <Button onClick={handleAddPlacement} leftIcon={<Plus className="w-4 h-4" />} variant="emerald" size="md">
              Publish Placement Drive
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {placements.map((d) => (
            <Card key={d.id} className="border-slate-800 bg-slate-900/90">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{d.company}</h3>
                  <p className="text-xs text-slate-300">{d.role} • {d.salary}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Min CGPA Cutoff: {d.minimum_cgpa}</p>
                </div>
                <Badge variant="success" size="sm">{d.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
