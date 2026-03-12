"use client"

import { useMemo } from "react"
import { format, subDays, differenceInCalendarDays, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/PageHeader"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { ClientOnly } from "@/components/common/ClientOnly"
import {
    BarChart3, Flame, Calendar, Trophy,
    ChevronDown, ChevronUp, CheckCircle2, XCircle, Lightbulb, AlertTriangle
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

function AnalyticsContent() {
    const { daySummaries, intents } = useCalendarStore()
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

    const toggleDay = (date: string) => {
        setExpandedDays(prev => {
            const next = new Set(prev)
            if (next.has(date)) next.delete(date)
            else next.add(date)
            return next
        })
    }

    // Get all days with summaries, sorted newest first
    const sortedDays = useMemo(() => {
        return Object.values(daySummaries)
            .filter(s => s.topOutcomes?.length > 0 || s.reflection)
            .sort((a, b) => b.date.localeCompare(a.date))
    }, [daySummaries])

    // Stats calculations
    const stats = useMemo(() => {
        const daysWithReflection = sortedDays.filter(s => s.reflection)
        const totalReflected = daysWithReflection.length

        // Calculate streak
        let streak = 0
        const today = format(new Date(), 'yyyy-MM-dd')
        let checkDate = today

        // Check if today has a reflection, if not start from yesterday
        if (!daySummaries[checkDate]?.reflection) {
            checkDate = format(subDays(new Date(), 1), 'yyyy-MM-dd')
        }

        while (daySummaries[checkDate]?.reflection) {
            streak++
            checkDate = format(subDays(parseISO(checkDate), 1), 'yyyy-MM-dd')
        }

        // Average completion rate
        let totalCompletion = 0
        let daysWithTasks = 0
        sortedDays.forEach(day => {
            const dayIntents = intents.filter(i => i.date === day.date)
            if (dayIntents.length > 0) {
                const completed = dayIntents.filter(i => i.status === 'completed').length
                totalCompletion += (completed / dayIntents.length) * 100
                daysWithTasks++
            }
        })
        const avgCompletion = daysWithTasks > 0 ? Math.round(totalCompletion / daysWithTasks) : 0

        return { totalReflected, streak, avgCompletion, totalDays: sortedDays.length }
    }, [sortedDays, daySummaries, intents])

    return (
        <div className="flex flex-col h-full bg-background overflow-y-auto">
            <PageHeader items={[{ label: 'Workspace' }, { label: 'Analytics' }]} />

            <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Days Reflected"
                        value={stats.totalReflected.toString()}
                        icon={<Calendar className="h-4 w-4 text-blue-500" />}
                        description="total reflections logged"
                    />
                    <StatCard
                        title="Current Streak"
                        value={`${stats.streak}d`}
                        icon={<Flame className="h-4 w-4 text-orange-500" />}
                        description="consecutive days reflecting"
                    />
                    <StatCard
                        title="Avg Completion"
                        value={`${stats.avgCompletion}%`}
                        icon={<Trophy className="h-4 w-4 text-emerald-500" />}
                        description="task completion rate"
                    />
                </div>

                {/* Timeline */}
                <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Reflection Timeline
                    </h2>

                    {sortedDays.length === 0 ? (
                        <Card className="border-dashed bg-muted/40">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold">No reflections yet</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm">
                                        Start your day, complete tasks, and end with a reflection to build your timeline.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {sortedDays.map(day => {
                                const dayIntents = intents.filter(i => i.date === day.date)
                                const completed = dayIntents.filter(i => i.status === 'completed').length
                                const total = dayIntents.length
                                const isExpanded = expandedDays.has(day.date)
                                const hasReflection = !!day.reflection
                                const isToday = day.date === format(new Date(), 'yyyy-MM-dd')

                                return (
                                    <div key={day.date} className="relative">
                                        <div className="relative rounded-xl border bg-card overflow-hidden transition-all hover:shadow-sm">
                                            {/* Header - always visible */}
                                            <button
                                                onClick={() => toggleDay(day.date)}
                                                className="w-full flex items-center justify-between p-4 text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Date badge */}
                                                    <div className={cn(
                                                        "flex flex-col items-center justify-center h-12 w-12 rounded-lg text-center shrink-0",
                                                        isToday
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted"
                                                    )}>
                                                        <span className="text-lg font-bold leading-none">
                                                            {format(parseISO(day.date), 'd')}
                                                        </span>
                                                        <span className="text-[10px] uppercase leading-none mt-0.5">
                                                            {format(parseISO(day.date), 'MMM')}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm">
                                                                {format(parseISO(day.date), 'EEEE')}
                                                                {isToday && <span className="text-primary ml-1">(Today)</span>}
                                                            </span>
                                                            {hasReflection && (
                                                                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">
                                                                    Reflected
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                            {total > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                                    {completed}/{total} tasks
                                                                </span>
                                                            )}
                                                            {day.topOutcomes?.length > 0 && (
                                                                <span>{day.topOutcomes.length} outcomes set</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Completion bar + expand icon */}
                                                <div className="flex items-center gap-3">
                                                    {total > 0 && (
                                                        <div className="hidden sm:flex items-center gap-2 w-24">
                                                            <div className="flex-1 bg-muted h-1.5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="bg-green-500 h-full rounded-full transition-all"
                                                                    style={{ width: `${(completed / total) * 100}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-medium w-7">
                                                                {Math.round((completed / total) * 100)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                    {isExpanded
                                                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    }
                                                </div>
                                            </button>

                                            {/* Expanded content */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 space-y-4 border-t pt-4">
                                                    {/* Top Outcomes */}
                                                    {day.topOutcomes?.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                                                                🎯 Focus Outcomes
                                                            </h4>
                                                            <ul className="space-y-1.5">
                                                                {day.topOutcomes.map((outcome, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                                                                            {i + 1}
                                                                        </span>
                                                                        <span>{outcome}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Reflection */}
                                                    {hasReflection && (
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200/50 dark:border-green-900/30">
                                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                                    <span className="text-xs font-semibold uppercase text-green-700 dark:text-green-400">Wins</span>
                                                                </div>
                                                                <p className="text-sm text-green-900 dark:text-green-200 whitespace-pre-wrap">{day.reflection?.wins}</p>
                                                            </div>

                                                            {day.reflection?.blockers && (
                                                                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-200/50 dark:border-red-900/30">
                                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                                        <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                                                        <span className="text-xs font-semibold uppercase text-red-700 dark:text-red-400">Blockers</span>
                                                                    </div>
                                                                    <p className="text-sm text-red-900 dark:text-red-200 whitespace-pre-wrap">{day.reflection?.blockers}</p>
                                                                </div>
                                                            )}

                                                            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200/50 dark:border-amber-900/30">
                                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                                    <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                                                    <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">Improvements</span>
                                                                </div>
                                                                <p className="text-sm text-amber-900 dark:text-amber-200 whitespace-pre-wrap">{day.reflection?.improvements}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!hasReflection && (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            No reflection recorded for this day.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, description }: {
    title: string; value: string; icon: React.ReactNode; description: string
}) {
    return (
        <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="default" />
            <div className="relative z-10 h-full border-[0.75px] rounded-xl overflow-hidden bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                <Card className="h-full border-none rounded-none shadow-none">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">{title}</span>
                            {icon}
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold tracking-tight">{value}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    return (
        <ClientOnly>
            <AnalyticsContent />
        </ClientOnly>
    )
}
