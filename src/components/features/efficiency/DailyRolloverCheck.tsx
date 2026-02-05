"use client"

import { useEffect, useState } from "react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { format, isBefore, startOfDay } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, CheckCircle2 } from "lucide-react"

export function DailyRolloverCheck() {
    const { intents, updateIntent } = useCalendarStore()
    const [overdueCount, setOverdueCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Runs on mount
        const today = new Date()
        const todayStr = format(today, 'yyyy-MM-dd')

        const overdue = intents.filter(intent => {
            // Is not completed AND date is strictly before today
            // Note: We use string comparison for YYYY-MM-DD which works, or date objects
            return intent.status !== 'completed' && intent.date < todayStr
        })

        if (overdue.length > 0) {
            setOverdueCount(overdue.length)
            setIsOpen(true)
        }
    }, [intents])

    const handleRollover = () => {
        const today = new Date()
        const todayStr = format(today, 'yyyy-MM-dd')

        // Move all overdue items to today
        const overdueIntents = intents.filter(intent => intent.status !== 'completed' && intent.date < todayStr)

        overdueIntents.forEach(intent => {
            updateIntent(intent.id, {
                date: todayStr
            })
        })

        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5 text-indigo-500" />
                        Daily Task Rollover
                    </DialogTitle>
                    <DialogDescription>
                        You have <strong>{overdueCount}</strong> unfinished task{overdueCount > 1 ? 's' : ''} from previous days.
                        <br />
                        Consistency is key. Would you like to carry them over to today?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Leave them in the past
                    </Button>
                    <Button onClick={handleRollover}>
                        Move to Today
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
