"use client"

import { format } from "date-fns"
import { Sun, BarChart3, CheckCircle2 } from "lucide-react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { cn } from "@/lib/utils"

export function TodaysFocusWidget() {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { intents, daySummaries, updateIntent } = useCalendarStore()

    const daySummary = daySummaries[today]
    const hasStartedDay = !!daySummary?.topOutcomes?.length

    const allTodayIntents = intents.filter(i => i.date === today)
    const progressStats = {
        total: allTodayIntents.length,
        completed: allTodayIntents.filter(i => i.status === 'completed').length
    }

    if (!hasStartedDay && allTodayIntents.length === 0) return null

    const toggleIntentStatus = (id: string, currentStatus: string) => {
        updateIntent(id, {
            status: currentStatus === 'completed' ? 'planned' : 'completed'
        })
    }

    return (
        <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="default" />
            <div className="relative z-10 border-[0.75px] rounded-xl overflow-hidden bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                <Card className="border-none rounded-none shadow-none">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <Sun className="h-4 w-4 text-orange-500" />
                            <span>Today's Focus</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Top Outcomes */}
                        {hasStartedDay && (
                            <ul className="space-y-2">
                                {daySummary.topOutcomes.map((outcome, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-orange-50 dark:bg-orange-900/30 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                                            {i + 1}
                                        </span>
                                        <span className="pt-0.5">{outcome}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Today's Tasks List */}
                        {allTodayIntents.length > 0 && (
                            <div className="space-y-1.5">
                                {!hasStartedDay && (
                                    <p className="text-xs font-medium uppercase text-muted-foreground tracking-wider mb-2">Today's Tasks</p>
                                )}
                                {allTodayIntents.map(intent => (
                                    <button
                                        key={intent.id}
                                        onClick={() => toggleIntentStatus(intent.id, intent.status)}
                                        className={cn(
                                            "flex items-center gap-2.5 w-full text-left px-2.5 py-2 rounded-lg transition-colors text-sm",
                                            intent.status === 'completed'
                                                ? "text-muted-foreground line-through opacity-60"
                                                : "hover:bg-accent"
                                        )}
                                    >
                                        <CheckCircle2 className={cn(
                                            "h-4 w-4 shrink-0",
                                            intent.status === 'completed'
                                                ? "text-green-500"
                                                : "text-muted-foreground/40"
                                        )} />
                                        <span className="truncate">{intent.objective}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Progress Bar */}
                        {allTodayIntents.length > 0 && (
                            <div className="pt-3 border-t">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                    <span className="flex items-center gap-1">
                                        <BarChart3 className="h-3.5 w-3.5" /> Progress
                                    </span>
                                    <span className="font-medium">
                                        {Math.round((progressStats.completed / (progressStats.total || 1)) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-orange-200/50 dark:bg-orange-900/30 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-orange-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(progressStats.completed / (progressStats.total || 1)) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground/70">
                                    <span>{progressStats.completed} Completed</span>
                                    <span>{progressStats.total} Total</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
