"use client"

import { IntentBlock } from "@/types"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay
} from "date-fns"
import { cn } from "@/lib/utils"

interface MonthViewProps {
    currentDate: Date
    intents: IntentBlock[]
    onSelectDate: (date: Date) => void
}

export function MonthView({ currentDate, intents, onSelectDate }: MonthViewProps) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
    const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return (
        <div className="border rounded-lg overflow-hidden bg-card">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b bg-muted/40 text-xs font-medium text-muted-foreground text-center py-2">
                {weekDayNames.map(day => <div key={day}>{day}</div>)}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
                {calendarDays.map((day, idx) => {
                    const dayIntents = intents.filter(intent => isSameDay(new Date(intent.date), day))
                    const isCurrentMonth = isSameMonth(day, monthStart)
                    const isToday = isSameDay(day, new Date())

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onSelectDate(day)}
                            className={cn(
                                "min-h-[100px] p-2 border-b border-r text-sm transition-colors hover:bg-accent/50 cursor-pointer flex flex-col gap-1",
                                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                                isToday && "bg-accent/20"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium",
                                isToday && "bg-primary text-primary-foreground"
                            )}>
                                {format(day, 'd')}
                            </div>

                            <div className="flex-1 space-y-1 mt-1">
                                {dayIntents.slice(0, 3).map(intent => (
                                    <div
                                        key={intent.id}
                                        className={cn(
                                            "h-1.5 rounded-full w-full",
                                            intent.type === 'work' ? "bg-primary/60" : "bg-blue-400/60"
                                        )}
                                        title={intent.objective}
                                    />
                                ))}
                                {dayIntents.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground pl-1">
                                        + {dayIntents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
