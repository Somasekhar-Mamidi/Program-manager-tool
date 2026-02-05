"use client"

import { useEffect, useState } from "react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { format, differenceInMinutes, parse, addHours, isAfter, isBefore } from "date-fns"
import { BellRing, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { IntentBlock } from "@/types"

export function MeetingPrepMonitor() {
    const { intents, updateIntent } = useCalendarStore()
    const [activeAlert, setActiveAlert] = useState<IntentBlock | null>(null)
    const [prepNotes, setPrepNotes] = useState("")

    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

    // Check for meetings every minute
    useEffect(() => {
        const checkMeetings = () => {
            const now = new Date()
            const today = format(now, 'yyyy-MM-dd')

            const upcomingMeeting = intents.find(intent => {
                if (intent.date !== today || !intent.isMeeting || !intent.scheduledTime || intent.status === 'completed') return false
                if (dismissedIds.has(intent.id)) return false // Skip dismissed

                // Parse meeting time
                // Assuming scheduledTime is HH:mm
                const [hours, minutes] = intent.scheduledTime.split(':').map(Number)
                const meetingTime = new Date(now)
                meetingTime.setHours(hours, minutes, 0, 0)

                // Check if meeting is in 3-4 hours range (roughly)
                // User asked: "ask me to prepare at least 3-4 hours before"
                // So we trigger if within 4 hours, but maybe not if it's super close (e.g. 10 mins?) 
                // Let's say window is [Now, Now + 4h] AND [Now + 3h, Now + 4h] preferred?
                // "ask me to prepare at least 3-4 hours before" -> Ideally trigger exactly 4 hours before.
                // Let's trigger if diff is between 180 (3h) and 240 (4h) minutes?
                // Or just generally "Upcoming in < 4 hours" and "No notes".

                const diffMins = differenceInMinutes(meetingTime, now)

                // Alert logic:
                // 1. Meeting is in future (diff > 0)
                // 2. Meeting is within 4 hours (diff <= 240)
                // 3. No prep notes yet (!intent.prepNotes)
                // 4. Not already alerting for this one (activeAlert check handled outside find)

                // Alert window: 15 mins to 4 hours
                return diffMins > 15 && diffMins <= 240 && !intent.prepNotes
            })

            if (upcomingMeeting && activeAlert?.id !== upcomingMeeting.id) {
                setActiveAlert(upcomingMeeting)
                setPrepNotes("") // Reset notes
            }
        }

        const interval = setInterval(checkMeetings, 60000) // Check every minute
        checkMeetings() // Initial check

        return () => clearInterval(interval)
    }, [intents, activeAlert, dismissedIds])

    const handleDismiss = () => {
        if (activeAlert) {
            setDismissedIds(prev => new Set(prev).add(activeAlert.id))
            setActiveAlert(null)
        }
    }

    const handleSavePrep = () => {
        if (!activeAlert) return
        updateIntent(activeAlert.id, {
            prepNotes: prepNotes
        })
        setActiveAlert(null)
    }

    // If no alert, return null (invisible background component)
    if (!activeAlert) return null

    return (
        <Dialog open={!!activeAlert} onOpenChange={(open) => !open && setActiveAlert(null)}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-600">
                        <BellRing className="h-5 w-5" />
                        Meeting Prep Alert
                    </DialogTitle>
                    <DialogDescription>
                        You have <strong>{activeAlert.objective}</strong> coming up at {activeAlert.scheduledTime}.
                        <br />
                        Preparation prevents poor performance. Capture your thoughts now.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Preparation Notes
                        </label>
                        <Textarea
                            placeholder="- Goal of the meeting&#10;- Key talking points&#10;- Questions involved"
                            className="h-[200px]"
                            value={prepNotes}
                            onChange={(e) => setPrepNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={handleDismiss}>Later</Button>
                    <Button onClick={handleSavePrep} className="gap-2">
                        <PenLine className="h-4 w-4" />
                        Save Notes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
