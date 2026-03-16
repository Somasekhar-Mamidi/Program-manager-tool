import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { MeetingPrepMonitor } from "@/components/features/meetings/MeetingPrepMonitor"
import { DailyRolloverCheck } from "@/components/features/efficiency/DailyRolloverCheck"
import { NudgeEngineWrapper } from "@/components/features/efficiency/NudgeEngineWrapper"
import { Toaster } from "sonner";
import { StoreHydration } from "@/components/features/store/StoreHydration";
import { DataRecovery } from "@/components/debug/DataRecovery";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { OnboardingTourWrapper } from "@/components/features/onboarding/OnboardingTourWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <ErrorBoundary>
              <AppSidebar />
              <MeetingPrepMonitor />
              <DailyRolloverCheck />
              <NudgeEngineWrapper />
              <StoreHydration />
              <DataRecovery />
              <OnboardingTourWrapper />
              <main className="w-full h-screen overflow-hidden flex flex-col bg-background">
                {children}
              </main>
              <Toaster />
            </ErrorBoundary>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
