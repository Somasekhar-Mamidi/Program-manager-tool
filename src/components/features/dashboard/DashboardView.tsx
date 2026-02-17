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

export function DashboardView() {
    const { intents } = useCalendarStore()

    // Calculate streaks & stats
    const totalIntents = intents.length
    const completedIntents = intents.filter(i => i.status === 'completed').length
    const completionRate = totalIntents > 0 ? Math.round((completedIntents / totalIntents) * 100) : 0
    const writingIntents = intents.filter(i => i.type === 'social' && i.status === 'completed').length

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
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
                        title="Efficiency"
                        value={`${completionRate}%`}
                        icon={<Activity className="h-4 w-4 text-emerald-500" />}
                        description="completion rate"
                        trend="+5%"
                        tooltip="Percentage of completed intents out of total intents created."
                    />
                    <StatsCard
                        title="Writing Output"
                        value={writingIntents.toString()}
                        icon={<PenTool className="h-4 w-4 text-blue-500" />}
                        description="pieces shipped"
                        tooltip="Total number of completed 'Social Media' type intents."
                    />
                    <StatsCard
                        title="Ideas Captured"
                        value={totalIntents.toString()}
                        icon={<Brain className="h-4 w-4 text-indigo-500" />}
                        description="total intents"
                        tooltip="Total count of all intents (ideas, tasks, posts) in the system."
                    />
                    <StatsCard
                        title="Focus Score"
                        value="8.5"
                        icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
                        description="daily average"
                        tooltip="Daily average focus score based on completed deep work sessions."
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Focus & Goals (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        <GoalsWidget />

                        {/* Placeholder for Recent Activity or Strategy Highlights */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Ready for Review</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground py-8 text-center italic">
                                    No items pending review today.
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Context & Calendar (1/3 width) */}
                    <div className="space-y-6">
                        <Card className="bg-slate-900 text-slate-100 border-slate-800">
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

                        {/* Placeholder for "System Alerts" or Quick Actions */}
                        <Card>
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
    )
}

function StatsCard({ title, value, icon, description, trend, tooltip }: { title: string, value: string, icon: React.ReactNode, description: string, trend?: string, tooltip?: string }) {
    return (
        <Card className="shadow-sm border-slate-200">
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
    )
}
