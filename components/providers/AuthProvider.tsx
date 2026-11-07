"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { UserProfile, UserRole } from "@/types";
import { parseCampusEmail } from "@/lib/utils/campusEmail";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, explicitRole?: UserRole, explicitRollNumber?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  updateRollNumber: (rollNumber: string) => void;
}

const defaultAnitsStudent: UserProfile = {
  id: "64852f8d-e1f1-44b0-968a-813be827539c",
  email: "aripakakarthik.23.it@anits.edu.in",
  full_name: "Aripaka Karthik",
  role: "STUDENT",
  roll_number: "A23126511128",
  department_name: "Information Technology",
  graduation_year: 2027,
  cgpa: 8.65,
  active_backlogs: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(defaultAnitsStudent);
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Read cached institutional profile if stored locally
    const cachedProfile = localStorage.getItem("anits_campus_user_profile");
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        // Ensure roll number is current
        if (!parsed.roll_number || parsed.roll_number === "323126511045") {
          parsed.roll_number = "A23126511128";
        }
        setUser(parsed);
        setRole(parsed.role);
        return;
      } catch (e) {
        console.warn("Failed to parse cached profile:", e);
      }
    }

    const cachedRole = localStorage.getItem("campus_assistant_demo_role") as UserRole;
    if (cachedRole) {
      setRole(cachedRole);
      setUser((prev) => (prev ? { ...prev, role: cachedRole } : defaultAnitsStudent));
    }
  }, []);

  const login = async (email: string, explicitRole?: UserRole, explicitRollNumber?: string): Promise<UserProfile> => {
    setIsLoading(true);

    const parsed = parseCampusEmail(email);
    if (!parsed.isValid) {
      setIsLoading(false);
      throw new Error(parsed.error || "Access restricted: Only verified @anits.edu.in email accounts are permitted.");
    }

    const targetRole: UserRole = explicitRole || parsed.role;
    const finalRollNumber = explicitRollNumber || (email.includes("aripaka") ? "A23126511128" : parsed.rollNumber);

    const profile: UserProfile = {
      id: user?.id || `user-${Date.now()}`,
      email: parsed.email,
      full_name: parsed.fullName || (targetRole === "ADMIN" ? "ANITS Academic Cell" : targetRole === "FACULTY" ? "Prof. Faculty Member" : "Aripaka Karthik"),
      role: targetRole,
      roll_number: finalRollNumber,
      department_name: parsed.departmentName,
      graduation_year: parsed.graduationYear || 2027,
      cgpa: 8.65,
      active_backlogs: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Attempt to sync/verify with Supabase
    try {
      const supabase = createClient();
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", parsed.email)
        .maybeSingle();

      if (existingProfile) {
        profile.id = existingProfile.id;
        profile.cgpa = existingProfile.cgpa || profile.cgpa;
        profile.roll_number = existingProfile.roll_number || profile.roll_number;
      }
    } catch (err) {
      console.warn("Supabase profile sync notice:", err);
    }

    setUser(profile);
    setRole(targetRole);

    localStorage.setItem("anits_campus_user_profile", JSON.stringify(profile));
    localStorage.setItem("campus_assistant_demo_role", targetRole);
    localStorage.setItem("campus_student_roll", profile.roll_number || "A23126511128");

    if (typeof document !== "undefined") {
      document.cookie = "campus_session=true; path=/; max-age=604800; SameSite=Lax";
      document.cookie = `campus_role=${targetRole}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `campus_email=${encodeURIComponent(parsed.email)}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `campus_roll_number=${encodeURIComponent(profile.roll_number || "A23126511128")}; path=/; max-age=604800; SameSite=Lax`;
    }

    setIsLoading(false);
    return profile;
  };

  const updateRollNumber = async (newRollNumber: string) => {
    if (!newRollNumber || !user) return;
    const finalRoll = newRollNumber.trim().toUpperCase();
    const updated: UserProfile = {
      ...user,
      roll_number: finalRoll,
    };
    setUser(updated);
    localStorage.setItem("anits_campus_user_profile", JSON.stringify(updated));
    localStorage.setItem("campus_student_roll", finalRoll);
    if (typeof document !== "undefined") {
      document.cookie = `campus_roll_number=${encodeURIComponent(finalRoll)}; path=/; max-age=604800; SameSite=Lax`;
    }

    try {
      const supabase = createClient();
      if (user.email) {
        await supabase
          .from("profiles")
          .update({ roll_number: finalRoll, updated_at: new Date().toISOString() })
          .eq("email", user.email);
      }
    } catch (err) {
      console.warn("Could not sync roll number to Supabase:", err);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUser(null);
    localStorage.removeItem("anits_campus_user_profile");
    localStorage.removeItem("campus_assistant_demo_role");
    localStorage.removeItem("campus_student_roll");
    if (typeof document !== "undefined") {
      document.cookie = "campus_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie = "campus_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie = "campus_roll_number=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
    setIsLoading(false);
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (!user) {
      setRole(newRole);
      return;
    }

    let updatedName = user.full_name;
    if (newRole === "ADMIN") updatedName = "ANITS Administrator (Exam Cell)";
    else if (newRole === "FACULTY") updatedName = "Prof. K. Srinivas (HOD - IT)";
    else updatedName = "Aripaka Karthik";

    const updated: UserProfile = {
      ...user,
      role: newRole,
      full_name: updatedName,
    };

    setUser(updated);
    localStorage.setItem("anits_campus_user_profile", JSON.stringify(updated));
    localStorage.setItem("campus_assistant_demo_role", newRole);

    if (typeof document !== "undefined") {
      document.cookie = "campus_session=true; path=/; max-age=604800; SameSite=Lax";
      document.cookie = `campus_role=${newRole}; path=/; max-age=604800; SameSite=Lax`;
    }
  };

  const authValue = useMemo(
    () => ({ user, role, isLoading, login, logout, switchRole, updateRollNumber }),
    [user, role, isLoading]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
