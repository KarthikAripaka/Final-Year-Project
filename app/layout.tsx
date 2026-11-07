import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { CampusStoreProvider } from "@/lib/store/campusStore";

import { Suspense } from "react";
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar";

export const metadata: Metadata = {
  title: "AI Smart Campus Assistant",
  description: "Intelligent Campus Information, RAG Official Knowledge Base, Placement & Student Support Platform",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <ToastProvider>
          <AuthProvider>
            <CampusStoreProvider>{children}</CampusStoreProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
