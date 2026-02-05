"use client"

import { useCalendarStore } from "@/lib/store/calendar-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface TaskDetailViewProps {
    taskId: string
}

export function TaskDetailView({ taskId }: TaskDetailViewProps) {
    const router = useRouter()
    const intent = useCalendarStore(state => state.intents.find(i => i.id === taskId))

    if (!intent) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-xl font-semibold text-muted-foreground">Task not found</h2>
                <Button onClick={() => router.push('/tasks')}>Back to Board</Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header / Nav */}
            <div className="flex items-center gap-4 border-b pb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        {intent.type} • {intent.status}
                    </div>
                    <h1 className="text-2xl font-bold">{intent.objective}</h1>
                </div>
            </div>

            {/* Placeholder for Sections */}
            <div className="grid gap-6">
                <div className="p-4 border border-dashed rounded-lg bg-muted/20">
                    <p className="text-center text-muted-foreground">Task Lifecycle Sections will appear here.</p>
                </div>
            </div>
        </div>
    )
}
