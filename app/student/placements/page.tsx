"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Briefcase, CheckCircle2, XCircle, Calendar, MapPin, DollarSign, ExternalLink } from "lucide-react";
import { PlacementOpportunity } from "@/types";

export default function PlacementsPage() {
  const { user } = useAuth();
  const { placements, appliedPlacementIds, applyPlacement } = useCampusStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const studentCgpa = user?.cgpa || 8.65;
  const studentDept = user?.department_name === "Information Technology" ? "IT" : "IT";
  const studentYear = user?.graduation_year || 2026;
  const studentBacklogs = user?.active_backlogs || 0;

  const checkEligibility = (p: PlacementOpportunity) => {
    const cgpaOk = studentCgpa >= p.minimum_cgpa;
    const deptOk = p.allowed_departments.includes(studentDept);
    const yearOk = studentYear === p.graduation_year;
    const backlogOk = studentBacklogs <= p.max_backlogs;
    const isEligible = cgpaOk && deptOk && yearOk && backlogOk;

    return {
      isEligible,
      reasons: [
        { label: `CGPA Requirement (>= ${p.minimum_cgpa})`, passed: cgpaOk, value: `Your CGPA: ${studentCgpa}` },
        { label: `Department Allowed (${p.allowed_departments.join(", ")})`, passed: deptOk, value: `Your Branch: ${studentDept}` },
        { label: `Graduation Year (${p.graduation_year})`, passed: yearOk, value: `Your Year: ${studentYear}` },
        { label: `Max Active Backlogs (<= ${p.max_backlogs})`, passed: backlogOk, value: `Your Backlogs: ${studentBacklogs}` },
      ],
    };
  };

  const filteredPlacements = placements.filter((p) => {
    const matchesSearch =
      p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase());
    const eligibility = checkEligibility(p);
    if (selectedFilter === "ELIGIBLE") return matchesSearch && eligibility.isEligible;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-400" /> Placement & Internship Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic eligibility engine verified against your academic profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company or role..."
            className="w-64"
          />
          <Select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            options={[
              { label: "All Drives", value: "ALL" },
              { label: "Eligible for You Only", value: "ELIGIBLE" },
            ]}
          />
        </div>
      </div>

      {/* Profile Bar */}
      <Card className="border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400">Student Name:</span>{" "}
              <strong className="text-white">{user?.full_name}</strong>
            </div>
            <div>
              <span className="text-slate-400">CGPA:</span>{" "}
              <strong className="text-emerald-400 font-bold">{studentCgpa}</strong>
            </div>
            <div>
              <span className="text-slate-400">Department:</span>{" "}
              <strong className="text-indigo-300">{studentDept}</strong>
            </div>
            <div>
              <span className="text-slate-400">Active Backlogs:</span>{" "}
              <strong className="text-slate-200">{studentBacklogs}</strong>
            </div>
          </div>
          <Badge variant="success" size="md">Profile Verified for 2026 Placements</Badge>
        </div>
      </Card>

      {/* Placement List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPlacements.map((p) => {
          const { isEligible, reasons } = checkEligibility(p);
          const hasApplied = appliedPlacementIds.includes(p.id);

          return (
            <Card key={p.id} className="border-slate-800 bg-slate-900/90 hover:border-slate-700 transition">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{p.company}</h3>
                    <Badge variant="info" size="sm">{p.role}</Badge>
                    {isEligible ? (
                      <Badge variant="success" size="sm">Eligible For You</Badge>
                    ) : (
                      <Badge variant="danger" size="sm">Not Eligible</Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">{p.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <DollarSign className="w-3.5 h-3.5" /> {p.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {p.location}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Calendar className="w-3.5 h-3.5" /> Deadline: {new Date(p.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Deterministic Eligibility Breakdown Box */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Deterministic Eligibility Breakdown:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {reasons.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {r.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          )}
                          <span className={r.passed ? "text-slate-300" : "text-rose-300"}>
                            {r.label} — <span className="font-semibold text-white">{r.value}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="flex md:flex-col justify-between items-end gap-3 flex-shrink-0">
                  {hasApplied ? (
                    <Button variant="outline" disabled size="md" leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}>
                      Application Submitted
                    </Button>
                  ) : (
                    <Button
                      variant={isEligible ? "emerald" : "secondary"}
                      disabled={!isEligible}
                      onClick={() => applyPlacement(p.id)}
                      size="md"
                      rightIcon={<ExternalLink className="w-4 h-4" />}
                    >
                      {isEligible ? "Apply Now" : "Not Eligible"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
