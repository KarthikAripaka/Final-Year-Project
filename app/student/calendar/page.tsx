"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Calendar as CalendarIcon, Clock, MapPin, Briefcase, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const campusEvents = [
  { date: "Oct 5", title: "Accenture Placement Registration Closes", type: "Placement", time: "5:00 PM" },
  { date: "Oct 12", title: "Deloitte Technology Drive Registration", type: "Placement", time: "6:00 PM" },
  { date: "Oct 15", title: "Accenture Online Assessment Test", type: "Exam", time: "10:00 AM" },
  { date: "Oct 20", title: "Capstone Project Phase-1 Submission", type: "Project", time: "11:59 PM" },
  { date: "Oct 28", title: "Hall Ticket Issue for Mid-Terms", type: "Academic", time: "9:00 AM" },
  { date: "Nov 2", title: "Mid-Term Examinations Commencement", type: "Exam", time: "9:30 AM" },
];

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-indigo-400" /> Interactive Campus Calendar
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Official academic schedule, exams, placement tests, and submission deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campusEvents.map((evt, idx) => (
          <Card key={idx} className="border-slate-800 bg-slate-900/90 hover:border-indigo-500/50 transition">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex flex-col items-center justify-center font-bold flex-shrink-0">
                <span className="text-sm">{evt.date}</span>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <Badge variant={evt.type === "Exam" ? "danger" : evt.type === "Placement" ? "success" : "info"} size="sm">
                  {evt.type}
                </Badge>
                <h3 className="text-xs font-bold text-white mt-1">{evt.title}</h3>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {evt.time}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
