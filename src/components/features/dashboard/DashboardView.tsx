"use client"

import { useState, useEffect } from "react"

import { useCalendarStore } from "@/lib/store/calendar-store"
import { format } from "date-fns"
import { DayStartDialog } from "./DayStartDialog"
import { DayEndDialog } from "./DayEndDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, PenTool, CheckCircle2 } from "lucide-react"
import { GoalsWidget } from "../goals/GoalsWidget"

export function DashboardView() {
    const { intents, daySummaries } = useCalendarStore()
    const today = format(new Date(), 'yyyy-MM-dd')

    // Calculate streaks & stats
    const totalIntents = intents.length
    const completedIntents = intents.filter(i => i.status === 'completed').length
    const completionRate = totalIntents > 0 ? Math.round((completedIntents / totalIntents) * 100) : 0

    const writingIntents = intents.filter(i => i.type === 'social' && i.status === 'completed').length

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-lg text-muted-foreground">Your execution command center.</p>
                </div>
                <div className="text-right text-base text-muted-foreground hidden md:block">
                    {format(new Date(), 'EEEE, MMMM do')}
                </div>
            </div>

            {/* Daily Rituals Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-orange-100 bg-orange-50/30 dark:border-orange-900/50 dark:bg-orange-900/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-medium flex items-center gap-2">
                            ☀️ Start Ritual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DayStartDialog />
                    </CardContent>
                </Card>

                <Card className="border-indigo-100 bg-indigo-50/30 dark:border-indigo-900/50 dark:bg-indigo-900/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-medium flex items-center gap-2">
                            🌙 End Ritual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DayEndDialog />
                    </CardContent>
                </Card>

                {/* Goals Widget - Spanning full width on mobile, maybe column on desktop if layout permits */}
                <div className="md:col-span-2">
                    <GoalsWidget />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
                    description="of started intents"
                />
                <StatsCard
                    title="Writing Output"
                    value={writingIntents.toString()}
                    icon={<PenTool className="h-4 w-4 text-muted-foreground" />}
                    description="social pieces shipped"
                />
                <StatsCard
                    title="Total Intents"
                    value={totalIntents.toString()}
                    icon={<Brain className="h-4 w-4 text-muted-foreground" />}
                    description="ideas captured"
                />
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{value}</div>
                <p className="text-sm text-muted-foreground mt-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
