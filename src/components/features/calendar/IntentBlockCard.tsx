"use client"

import { IntentBlock } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, PenTool, CheckCircle2, ChevronDown, Clock } from "lucide-react" // Icons for types
import { cn } from "@/lib/utils"
import { TaskBreakdownButton } from "@/components/features/tasks/TaskBreakdownButton"

import { useCalendarStore } from "@/lib/store/calendar-store"

interface IntentBlockCardProps {
    intent: IntentBlock
}

export function IntentBlockCard({ intent }: IntentBlockCardProps) {
    const isWork = intent.type === 'work'
    const updateIntent = useCalendarStore(state => state.updateIntent)

    const toggleComplete = () => {
        const newStatus = intent.status === 'completed' ? 'planned' : 'completed'
        updateIntent(intent.id, { status: newStatus })
    }

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all hover:shadow-md border-l-4",
            isWork ? "border-l-primary" : "border-l-blue-500" // Example color diff
        )}>
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {isWork ? <BrainCircuit className="h-3 w-3" /> : <PenTool className="h-3 w-3" />}
                            <span>{intent.type}</span>
                            <span>•</span>
                            <span className={cn(
                                "flex items-center gap-1",
                                intent.estimatedEffort === 'high' ? "text-red-500" :
                                    intent.estimatedEffort === 'medium' ? "text-yellow-500" : "text-green-500"
                            )}>
                                <Clock className="h-3 w-3" />
                                {intent.estimatedEffort}
                            </span>
                            {intent.isMeeting && intent.scheduledTime && (
                                <>
                                    <span>•</span>
                                    <Badge variant="secondary" className="px-1 py-0 h-5 text-[10px] font-mono">
                                        @{intent.scheduledTime}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "px-1 py-0 h-5 text-[10px] border-0",
                                            intent.prepNotes ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        )}
                                    >
                                        {intent.prepNotes ? "Ready" : "Not Ready"}
                                    </Badge>
                                </>
                            )}
                        </div>
                        <h3 className={cn("font-medium text-lg leading-tight transition-all", intent.status === 'completed' && "line-through text-muted-foreground")}>{intent.objective}</h3>
                    </div>
                    <div className="shrink-0" onClick={toggleComplete}>
                        {intent.status === 'completed' ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500 cursor-pointer hover:scale-110 transition-transform" />
                        ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-muted hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer" />
                        )}
                    </div>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/40 p-2 rounded-md">
                    <span className="font-medium text-xs text-muted-foreground/80 uppercase mr-1">Output:</span>
                    {intent.outputDefinition}
                </div>

                <div className="mt-2 pt-2 border-t flex flex-col gap-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-muted-foreground">Breakdown</div>
                        <TaskBreakdownButton intent={intent} />
                    </div>

                    {intent.microSteps.length > 0 ? (
                        <div className="space-y-1">
                            {intent.microSteps.slice(0, 3).map(step => (
                                <div key={step.id} className="flex items-center gap-2 text-sm">
                                    <div className={cn("h-3 w-3 rounded-full border", step.isCompleted ? "bg-primary border-primary" : "border-muted-foreground")} />
                                    <span className={cn(step.isCompleted && "line-through text-muted-foreground")}>{step.title}</span>
                                </div>
                            ))}
                            {intent.microSteps.length > 3 && (
                                <div className="text-xs text-muted-foreground pl-5">
                                    + {intent.microSteps.length - 3} more
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground italic">
                            No steps yet. Break it down to get started.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
