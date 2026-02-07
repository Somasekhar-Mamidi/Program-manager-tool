import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { MeetingPrepMonitor } from "@/components/features/meetings/MeetingPrepMonitor"
import { DailyRolloverCheck } from "@/components/features/efficiency/DailyRolloverCheck"
import { Toaster } from "sonner";
import { StoreHydration } from "@/components/features/store/StoreHydration";
import { DataRecovery } from "@/components/debug/DataRecovery";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SidebarProvider>
          <AppSidebar />
          <MeetingPrepMonitor />
          <DailyRolloverCheck />
          <StoreHydration />
          <DataRecovery />
          <main className="w-full h-screen overflow-hidden flex flex-col bg-slate-50/50">
            {children}
          </main>
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
