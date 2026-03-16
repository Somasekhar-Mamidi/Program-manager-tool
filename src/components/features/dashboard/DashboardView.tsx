"use client"

import { useCalendarStore } from "@/lib/store/calendar-store"
import { format } from "date-fns"
import { DayStartDialog } from "./DayStartDialog"
import { DayEndDialog } from "./DayEndDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Brain, PenTool, CheckCircle2, TrendingUp, Activity, HelpCircle } from "lucide-react"
import { GoalsWidget } from "../goals/GoalsWidget"
import { PageHeader } from "@/components/layout/PageHeader"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { TodaysFocusWidget } from "./TodaysFocusWidget"

export function DashboardView() {
    const { intents } = useCalendarStore()

    // 1. Execution Rate (Completed / Total)
    const totalIntents = intents.length
    const completedIntents = intents.filter(i => i.status === 'completed').length
    const executionRate = totalIntents > 0 ? Math.round((completedIntents / totalIntents) * 100) : 0

    // 2. Rollover/Deferral Rate (Deferred / Total)
    const deferredIntents = intents.filter(i => i.status === 'deferred').length
    const rolloverRate = totalIntents > 0 ? Math.round((deferredIntents / totalIntents) * 100) : 0

    // 3. Nudge Evasion Rate (Focus Adherence)
    // Only look at tasks that had nudges enabled and are completed
    const nudgableCompletedTasks = intents.filter(i => i.status === 'completed' && (i.nudgeInterval || 0) > 0)
    const evadedTasks = nudgableCompletedTasks.filter(i => (i.nudgeCount || 0) === 0).length
    const evasionRate = nudgableCompletedTasks.length > 0 ? Math.round((evadedTasks / nudgableCompletedTasks.length) * 100) : 100

    // 4. Pending Tasks
    const pendingTasks = intents.filter(i => i.status === 'planned' || i.status === 'in-progress').length

    return (
        <div className="flex flex-col h-full bg-background overflow-y-auto">
            <PageHeader items={[{ label: 'Workspace' }, { label: 'Dashboard' }]}>
                <div className="flex items-center gap-2">
                    <DayStartDialog />
                    <DayEndDialog />
                </div>
            </PageHeader>

            <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">

                {/* Stats Row - High Density */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatsCard
                        title="Execution Rate"
                        value={`${executionRate}%`}
                        icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        description={`${completedIntents} of ${totalIntents} tasks`}
                        tooltip="Percentage of total tasks completed."
                    />
                    <StatsCard
                        title="Rollover Rate"
                        value={`${rolloverRate}%`}
                        icon={<Activity className="h-4 w-4 text-orange-500" />}
                        description="pushed to future"
                        tooltip="Percentage of tasks planned that ended up getting pushed/deferred. Keep this under 20%."
                    />
                    <StatsCard
                        title="Nudge Evasion"
                        value={`${evasionRate}%`}
                        icon={<TrendingUp className="h-4 w-4 text-indigo-500" />}
                        description="focus adherence"
                        tooltip="Percentage of nudgable tasks completed BEFORE a nudge fired. Beating the buzzer!"
                    />
                    <StatsCard
                        title="Pending Tasks"
                        value={pendingTasks.toString()}
                        icon={<Brain className="h-4 w-4 text-blue-500" />}
                        description="active items"
                        tooltip="Total count of active tasks currently planned or in-progress."
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Focus & Goals (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        <TodaysFocusWidget />
                        <GoalsWidget />
                    </div>

                    <div className="space-y-6">
                        <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="white" />
                            <div className="relative z-10 border-[0.75px] rounded-xl overflow-hidden bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] h-full">
                                <Card className="border-none rounded-none shadow-none">
                                    <CardHeader>
                                        <CardTitle className="text-base font-medium flex items-center gap-2">
                                            <span>📅 Today</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold">{format(new Date(), 'd')}</div>
                                        <div className="text-xl text-slate-400">{format(new Date(), 'MMMM')}</div>
                                        <div className="text-sm text-slate-500 mt-1">{format(new Date(), 'EEEE')}</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Placeholder for "System Alerts" or Quick Actions */}
                        <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="default" />
                            <div className="relative z-10 border-[0.75px] rounded-xl overflow-hidden bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] h-full">
                                <Card className="border-none rounded-none shadow-none">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <button className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                                            + Draft New Charter
                                        </button>
                                        <button className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                                            + Log Meeting Notes
                                        </button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon, description, trend, tooltip }: { title: string, value: string, icon: React.ReactNode, description: string, trend?: string, tooltip?: string }) {
    return (
        <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="default" />
            <div className="relative z-10 h-full border-[0.75px] rounded-xl overflow-hidden bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                <Card className="h-full border-none rounded-none shadow-none">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                                {tooltip && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs text-xs">{tooltip}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            {icon}
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold tracking-tight">{value}</span>
                            {trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{trend}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {description}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
