import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { MeetingPrepMonitor } from "@/components/features/meetings/MeetingPrepMonitor"
import { DailyRolloverCheck } from "@/components/features/efficiency/DailyRolloverCheck"
import { Toaster } from "sonner";

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
          <main className="w-full">
            <div className="p-4 flex items-center gap-2 border-b bg-background sticky top-0 z-10">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">My Social Calendar</span>
            </div>
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
