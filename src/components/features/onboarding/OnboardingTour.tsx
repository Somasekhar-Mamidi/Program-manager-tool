"use client";

import Joyride, { CallBackProps, EVENTS, STATUS, Step, ACTIONS } from "react-joyride";
import { useCalendarStore } from "@/lib/store/calendar-store";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function OnboardingTour() {
    const { isTourRunning, setIsTourRunning, tourStepIndex, setTourStepIndex } = useCalendarStore();
    const { theme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const steps: Step[] = [
        // Dashboard
        {
            target: "body",
            content: (
                <div className="text-left space-y-2">
                    <h3 className="text-lg font-bold">Welcome to DeepWork 🚀</h3>
                    <p className="text-sm text-muted-foreground">This is your new command center for focused execution. Let's take a quick tour across the entire platform.</p>
                </div>
            ),
            placement: "center",
            disableBeacon: true,
            data: { path: "/dashboard" }
        },
        {
            target: ".tour-dashboard-stats",
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-semibold">Your Live Metrics Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Watch your Execution Rate grow here. We track behavioral metrics (like Nudge Evasion and Rollover Rate) to help you build better focus habits.</p>
                </div>
            ),
            placement: "bottom",
            data: { path: "/dashboard" }
        },
        {
            target: ".tour-start-day-btn",
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-semibold">The Most Important Button</h3>
                    <p className="text-sm text-muted-foreground">Every morning, click "Start My Day" to set your daily intention, select the tasks you will actually complete, and clear your mind before diving into deep work.</p>
                </div>
            ),
            placement: "bottom-end",
            data: { path: "/dashboard" }
        },
        // Sidebar - global but we highlight it here
        {
            target: ".tour-sidebar-nav",
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-semibold">Navigation & Workspaces</h3>
                    <p className="text-sm text-muted-foreground">Navigate here. Let's move to <strong>Strategy</strong> next to see where your long-term goals live.</p>
                </div>
            ),
            placement: "right",
            data: { path: "/dashboard" }
        },
        // Strategy / Charters
        {
            target: ".tour-charters-list",
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-semibold">Strategy & Charters</h3>
                    <p className="text-sm text-muted-foreground">Define your 1-3 month goals here. Everything you do on a daily basis should roll up to these high-level Charters to ensure you are moving the needle.</p>
                </div>
            ),
            placement: "bottom-start",
            data: { path: "/strategy" }
        },
        // Calendar
        {
            target: ".tour-calendar-view",
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-semibold">Time-Blocking Calendar</h3>
                    <p className="text-sm text-muted-foreground">Drag and drop your tasks into specific time slots. Deep work requires blocking out distraction-free periods on your schedule.</p>
                </div>
            ),
            placement: "left",
            data: { path: "/calendar" }
        },
        // Task Flow
        {
            target: ".tour-taskflow-board",
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-semibold">TaskFlow (MIRO Board)</h3>
                    <p className="text-sm text-muted-foreground">Visualize complex dependencies. Drag tasks to connect them. If Task A blocks Task B, you'll see it clearly on this infinite canvas.</p>
                </div>
            ),
            placement: "center",
            data: { path: "/task-flow" }
        },
        // Meeting Prep
        {
            target: ".tour-meeting-questions",
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-semibold">Meeting Prep AI</h3>
                    <p className="text-sm text-muted-foreground">Never go into a meeting unprepared. The AI highlights action items and suggests critical questions you should ask based on past context.</p>
                </div>
            ),
            placement: "left-start",
            data: { path: "/meeting-prep" }
        },
        // Task Resources
        {
            target: ".tour-task-resources",
            content: (
                <div className="text-left space-y-2">
                    <h3 className="font-semibold">Task Resources</h3>
                    <p className="text-sm text-muted-foreground">Attach URLs, PDFs, or Image references directly to your tasks so you don't break focus searching for links when execution time arrives.</p>
                </div>
            ),
            placement: "bottom-start",
            data: { path: "/task-resources" }
        }
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { action, index, status, type } = data;
        
        // Stop the tour if it's finished or skipped
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setIsTourRunning(false);
            setTourStepIndex(0);
            return;
        }

        // When the user clicks Next or Prev, Joyride fires 'step:after'
        // We need to intercept this to handle the route change BEFORE we tell Joyride to advance
        if (type === EVENTS.STEP_AFTER) {
            const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
            
            if (nextStepIndex >= 0 && nextStepIndex < steps.length) {
                const nextPath = steps[nextStepIndex]?.data?.path;
                
                // If the next step is on a different page, push the router
                if (nextPath && pathname !== nextPath) {
                    router.push(nextPath);
                    // Add a tiny delay to let the Next.js router mount the new page's DOM
                    // before we tell Joyride to look for the CSS target wrapper
                    setTimeout(() => {
                        setTourStepIndex(nextStepIndex);
                    }, 400); 
                } else {
                    // Same page, advance immediately
                    setTourStepIndex(nextStepIndex);
                }
            }
        }
    };

    // Force hide if already seen to prevent unnecessary rendering
    if (!isTourRunning || !mounted) return null;

    // Define sleek custom styles matching our app theme
    const isDark = theme === "dark";

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            run={isTourRunning}
            stepIndex={tourStepIndex}
            scrollToFirstStep
            showProgress
            showSkipButton
            steps={steps}
            styles={{
                options: {
                    zIndex: 10000,
                    arrowColor: isDark ? "#1a1a1a" : "#ffffff",
                    backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
                    overlayColor: "rgba(0, 0, 0, 0.6)",
                    primaryColor: "#3b82f6", // tailwind blue-500
                    textColor: isDark ? "#f8fafc" : "#0f172a", // tailwind slate-50/900
                },
                tooltipContainer: {
                    textAlign: "left",
                    padding: "12px",
                },
                buttonNext: {
                    backgroundColor: "#3b82f6",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 500,
                    padding: "8px 16px",
                },
                buttonBack: {
                    color: isDark ? "#94a3b8" : "#64748b",
                    marginRight: "8px",
                    fontSize: "14px",
                },
                buttonSkip: {
                    color: isDark ? "#94a3b8" : "#64748b",
                    fontSize: "14px",
                },
                tooltip: {
                    borderRadius: "12px",
                    border: isDark ? "1px solid #333333" : "1px solid #e2e8f0",
                }
            }}
        />
    );
}
