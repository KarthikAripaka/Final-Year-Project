"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    if (role === "ADMIN") {
      router.replace("/admin/dashboard");
    } else if (role === "FACULTY") {
      router.replace("/faculty/dashboard");
    } else {
      router.replace("/student/dashboard");
    }
  }, [role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wide">Loading AI Smart Campus Platform...</p>
      </div>
    </div>
  );
}
