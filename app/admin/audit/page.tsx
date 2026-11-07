"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { History, ShieldCheck } from "lucide-react";

const mockAuditLogs = [
  { id: "1", action: "DOCUMENT_PUBLISHED", user: "Admin", target: "Academic Regulations 2026.pdf", timestamp: "2026-09-23 18:30" },
  { id: "2", action: "DOCUMENT_PUBLISHED", user: "Admin", target: "Placement Guidelines 2026.pdf", timestamp: "2026-09-23 17:15" },
  { id: "3", action: "NOTICE_CREATED", user: "Admin", target: "Mid-Term Examination Schedule", timestamp: "2026-09-23 15:40" },
  { id: "4", action: "PLACEMENT_POSTED", user: "Admin", target: "Accenture Solutions Campus Drive", timestamp: "2026-09-23 14:00" },
];

export default function AdminAuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-400" /> Administrative Audit Logs
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable audit record of official document uploads, knowledge publication, notice creations, and role changes.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target Entity</TableHead>
            <TableHead>Performed By</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAuditLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-xs text-slate-400 font-mono">{log.timestamp}</TableCell>
              <TableCell className="text-xs font-bold text-slate-200">{log.action}</TableCell>
              <TableCell className="text-xs text-slate-300">{log.target}</TableCell>
              <TableCell className="text-xs text-slate-400">{log.user}</TableCell>
              <TableCell>
                <Badge variant="success" size="sm">Audited & Verified</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
