"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { IntentBlockCard } from "./IntentBlockCard"

interface DayViewProps {
    currentDate: Date
}

export function DayView({ currentDate }: DayViewProps) {
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    const allIntents = useCalendarStore(state => state.intents)

    const intents = useMemo(() =>
        allIntents.filter(i => i.date === dateKey),
        [allIntents, dateKey]
    )

    return (
        <div className="space-y-4">
            {intents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                    <p className="text-muted-foreground">No intents planned for today.</p>
                    <p className="text-sm text-muted-foreground/60">"The secret of getting ahead is getting started."</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {intents.map(intent => (
                        <IntentBlockCard key={intent.id} intent={intent} />
                    ))}
                </div>
            )}
        </div>
    )
}
