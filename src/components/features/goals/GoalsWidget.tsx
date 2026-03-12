"use client"

import { useState } from "react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { Goal } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Plus, Check, Trash2, Target } from "lucide-react"
import { format, subDays, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { GlowingEffect } from "@/components/ui/glowing-effect"

export function GoalsWidget() {
    const { goals, addGoal, toggleGoalDate, deleteGoal } = useCalendarStore()
    const [newGoalTitle, setNewGoalTitle] = useState("")
    const [targetDays, setTargetDays] = useState("30")
    const [isAdding, setIsAdding] = useState(false)

    const handleAddGoal = () => {
        if (!newGoalTitle.trim()) return
        addGoal({
            title: newGoalTitle,
            targetDays: parseInt(targetDays) || 30
        })
        setNewGoalTitle("")
        setIsAdding(false)
    }

    const calculateStreak = (dates: string[]) => {
        if (!dates.length) return 0

        const sortedDates = [...dates].sort().reverse() // Newest first
        const today = format(new Date(), 'yyyy-MM-dd')
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

        let streak = 0
        let currentDate = new Date()

        // If done today, start counting from today
        // If not done today, check if done yesterday to keep streak alive
        const hasToday = dates.includes(today)
        const hasYesterday = dates.includes(yesterday)

        if (!hasToday && !hasYesterday) return 0

        // We check iteratively backwards
        // Naive approach: check simply consecutive days present in array
        // Better: iterate backwards from (Today if present else Yesterday)

        let checkDate = hasToday ? new Date() : subDays(new Date(), 1)

        while (true) {
            const dateStr = format(checkDate, 'yyyy-MM-dd')
            if (dates.includes(dateStr)) {
                streak++
                checkDate = subDays(checkDate, 1)
            } else {
                break
            }
        }

        return streak
    }

    return (
        <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant="default" />
            <div className="relative z-10 h-full border-[0.75px] rounded-xl overflow-hidden bg-background shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                <Card className="h-full border-none rounded-none shadow-none bg-background">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xl font-medium flex items-center gap-2">
                            <Target className="h-6 w-6 text-indigo-500" />
                            Goal Consistency
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsAdding(!isAdding)}>
                            <Plus className={cn("h-4 w-4 transition-transform", isAdding && "rotate-45")} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isAdding && (
                            <div className="mb-4 space-y-2 p-3 bg-muted/50 rounded-lg animate-in slide-in-from-top-2">
                                <Input
                                    placeholder="What habit do you want to build?"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    className="bg-background"
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Target Days (e.g. 30)"
                                        value={targetDays}
                                        onChange={(e) => setTargetDays(e.target.value)}
                                        className="w-24 bg-background"
                                    />
                                    <Button size="sm" className="flex-1" onClick={handleAddGoal}>Add Goal</Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {goals.length === 0 && !isAdding && (
                                <div className="text-center py-6 text-muted-foreground text-base">
                                    No active goals. Start a streak today!
                                </div>
                            )}

                            {goals.map(goal => {
                                const streak = calculateStreak(goal.completedDates)
                                const today = format(new Date(), 'yyyy-MM-dd')
                                const isDoneToday = goal.completedDates.includes(today)
                                const progress = Math.min(100, Math.round((goal.completedDates.length / goal.targetDays) * 100))

                                return (
                                    <div key={goal.id} className="group">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="font-medium text-base truncate pr-2 flex-1">
                                                {goal.title}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center text-sm font-mono text-orange-500">
                                                    <Flame className="h-4 w-4 mr-0.5 fill-orange-500" />
                                                    {streak}
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant={isDoneToday ? "default" : "outline"}
                                                    className={cn("h-6 w-6", isDoneToday && "bg-green-600 hover:bg-green-700")}
                                                    onClick={() => toggleGoalDate(goal.id, today)}
                                                >
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                    onClick={() => deleteGoal(goal.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Progress value={progress} className="h-2" />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{goal.completedDates.length} / {goal.targetDays} days</span>
                                                <span>{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
