"use client"

import React, { useState, useMemo } from "react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { Charter, IntentBlock } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    BookMarked,
    CheckCircle2,
    Clock,
    History as HistoryIcon,
    ArrowRight,
    Trash2
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function ChartersPage() {
    const { charters, intents, deleteIntent } = useCalendarStore()
    const [selectedCharterId, setSelectedCharterId] = useState<string | null>(null)

    // Select the first charter by default if available and none selected
    React.useEffect(() => {
        if (!selectedCharterId && charters.length > 0) {
            setSelectedCharterId(charters[0].id)
        }
    }, [charters, selectedCharterId])

    const selectedCharter = useMemo(() =>
        charters.find(c => c.id === selectedCharterId),
        [charters, selectedCharterId])

    const completedTasks = useMemo(() => {
        if (!selectedCharterId) return []
        return intents
            .filter(i => i.charterId === selectedCharterId && i.status === 'completed')
            .sort((a, b) => b.date.localeCompare(a.date)) // Newest first
    }, [intents, selectedCharterId])

    const activeTasksCount = useMemo(() => {
        if (!selectedCharterId) return 0
        return intents.filter(i => i.charterId === selectedCharterId && i.status !== 'completed').length
    }, [intents, selectedCharterId])

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
            {/* Left Sidebar: Charter List */}
            <div className="w-1/3 min-w-[300px] flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                    <BookMarked className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Charters History</h1>
                </div>

                <ScrollArea className="flex-1 -mx-2 px-2">
                    <div className="space-y-2">
                        {charters.length === 0 && (
                            <div className="p-8 text-center border rounded-lg border-dashed text-muted-foreground">
                                No charters defined.
                            </div>
                        )}
                        {charters.map(charter => (
                            <Card
                                key={charter.id}
                                className={cn(
                                    "cursor-pointer transition-all hover:border-primary/50",
                                    selectedCharterId === charter.id ? "border-primary bg-primary/5 shadow-md" : "hover:bg-accent/50"
                                )}
                                onClick={() => setSelectedCharterId(charter.id)}
                            >
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base flex justify-between items-start">
                                        <span className="line-clamp-1">{charter.title}</span>
                                        {selectedCharterId === charter.id && <ArrowRight className="h-4 w-4 text-primary" />}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs">
                                        {charter.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
                <div className="mt-auto pt-4 border-t text-xs text-muted-foreground">
                    Select a charter to view details and history.
                </div>
            </div>

            {/* Right Panel: Detail View */}
            <div className="flex-1 flex flex-col">
                {selectedCharter ? (
                    <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-none bg-background/50">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-3xl">{selectedCharter.title}</CardTitle>
                                    <CardDescription className="mt-2 text-base">
                                        {selectedCharter.description}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        {activeTasksCount} Active
                                    </Badge>
                                    <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {completedTasks.length} Completed
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>

                        <Separator />

                        <CardContent className="flex-1 overflow-auto py-6 space-y-8">

                            {/* History Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                                    Completion History
                                </h3>

                                {completedTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                                        <HistoryIcon className="h-10 w-10 mb-2 opacity-50" />
                                        <p>No completed tasks in history yet.</p>
                                        <p className="text-sm">Finish tasks on the board to build your history!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {completedTasks.map((task, index) => {
                                            const showDateHeader = index === 0 || task.date !== completedTasks[index - 1].date

                                            return (
                                                <div key={task.id} className="group">
                                                    {showDateHeader && (
                                                        <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2 mb-2 border-b text-sm font-semibold text-muted-foreground flex items-center">
                                                            {format(new Date(task.date), "MMMM d, yyyy")}
                                                        </div>
                                                    )}
                                                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-all group-hover:border-primary/20">
                                                        <div className="mt-1 h-5 w-5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-base leading-tight">
                                                                {task.objective}
                                                            </p>
                                                            {task.outputDefinition && (
                                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                    Output: {task.outputDefinition}
                                                                </p>
                                                            )}
                                                            {task.notes && (
                                                                <div className="mt-2 text-xs bg-muted/50 p-2 rounded text-muted-foreground">
                                                                    {task.notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground/60 whitespace-nowrap flex flex-col items-end gap-2">
                                                            <span>{task.estimatedEffort} effort</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => {
                                                                    if (confirm("Are you sure you want to delete this task record?")) {
                                                                        deleteIntent(task.id)
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a charter to view details
                    </div>
                )}
            </div>
        </div>
    )
}
