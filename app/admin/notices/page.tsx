"use client";

import React, { useState } from "react";
import { useCampusStore } from "@/lib/store/campusStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Bell, Plus } from "lucide-react";
import { CampusNotice } from "@/types";

export default function AdminNoticesPage() {
  const { notices, addNotice } = useCampusStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("HIGH");

  const handleCreateNotice = () => {
    if (!title.trim()) return;
    addNotice({
      title,
      description,
      category: "NOTICE",
      priority: priority as CampusNotice["priority"],
      status: "PUBLISHED",
      created_by: "Admin Console",
      deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    });
    setTitle("");
    setDescription("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-400" /> Admin Notice Management System
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Publish official campus announcements with AI deadline extraction and publication approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader>
            <CardTitle>Create Official Notice</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input label="Notice Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Capstone Submission Extension" />
            <Select label="Priority Level" value={priority} onChange={(e) => setPriority(e.target.value)} options={[
              { label: "Normal", value: "NORMAL" },
              { label: "High Priority", value: "HIGH" },
              { label: "Urgent", value: "URGENT" },
            ]} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Notice Description</label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full notice text details..." className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <Button onClick={handleCreateNotice} leftIcon={<Plus className="w-4 h-4" />} variant="primary" size="md">
              Publish Official Notice
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {notices.map((n) => (
            <Card key={n.id} className="border-slate-800 bg-slate-900/90">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{n.title}</h3>
                    <Badge variant={n.priority === "URGENT" ? "danger" : "warning"} size="sm">{n.priority}</Badge>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{n.description}</p>
                </div>
                <Badge variant="success" size="sm">PUBLISHED</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
