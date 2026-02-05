"use client"

import { IntentBlock } from "@/types"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WeekViewProps {
    currentDate: Date
    intents: IntentBlock[]
    onSelectDate: (date: Date) => void
}

export function WeekView({ currentDate, intents, onSelectDate }: WeekViewProps) {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

    return (
        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border h-[600px]">
            {weekDays.map((day) => {
                const dayIntents = intents.filter(intent => isSameDay(new Date(intent.date), day))
                const isToday = isSameDay(day, new Date())

                return (
                    <div
                        key={day.toISOString()}
                        className={cn("bg-card flex flex-col min-h-0", isToday && "bg-accent/20")}
                        onClick={() => onSelectDate(day)}
                    >
                        {/* Header */}
                        <div className={cn("p-2 text-center border-b text-sm", isToday && "font-bold text-primary")}>
                            <div className="opacity-70 text-xs">{format(day, 'EEE')}</div>
                            <div>{format(day, 'd')}</div>
                        </div>

                        {/* Content */}
                        <ScrollArea className="flex-1 p-1">
                            <div className="space-y-1">
                                {dayIntents.map(intent => (
                                    <div
                                        key={intent.id}
                                        className={cn(
                                            "p-1.5 rounded text-[10px] leading-tight border-l-2 truncate cursor-pointer hover:opacity-80",
                                            intent.type === 'work' ? "bg-primary/5 border-primary" : "bg-blue-50 border-blue-500"
                                        )}
                                        title={intent.objective}
                                    >
                                        {intent.isMeeting && (
                                            <span className="font-mono opacity-70 mr-1">{intent.scheduledTime}</span>
                                        )}
                                        {intent.objective}
                                    </div>
                                ))}
                                {dayIntents.length === 0 && (
                                    <div className="text-[10px] text-muted-foreground text-center py-4 opacity-50">
                                        -
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )
            })}
        </div>
    )
}
