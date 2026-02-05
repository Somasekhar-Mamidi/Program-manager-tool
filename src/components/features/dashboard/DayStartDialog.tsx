"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Sun, Target, Plus, X, ArrowRight, CheckCircle2, AlignLeft, BarChart3 } from "lucide-react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AnimatePresence, motion } from "framer-motion"

interface DraftTask {
    id: string
    title: string
    notes: string
}

export function DayStartDialog() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'dump' | 'prioritize'>('dump')

    // State for new task input
    const [newTasks, setNewTasks] = useState<DraftTask[]>([])
    const [taskInput, setTaskInput] = useState("")
    const [notesInput, setNotesInput] = useState("")
    const [showNotesInput, setShowNotesInput] = useState(false)

    const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([])

    // Formatting
    const today = format(new Date(), 'yyyy-MM-dd')
    const { intents, daySummaries, updateDaySummary, addIntent } = useCalendarStore()

    // Existing Data
    const hasStartedDay = !!daySummaries[today]?.topOutcomes?.length
    const todaysIntents = intents.filter(i => i.date === today && i.status !== 'completed')
    const todaysCompletedIntents = intents.filter(i => i.date === today && i.status === 'completed')

    // Stats for Started Day View
    const allTodayIntents = intents.filter(i => i.date === today)
    const progressStats = {
        total: allTodayIntents.length,
        completed: allTodayIntents.filter(i => i.status === 'completed').length
    }

    // Derived state for selection (combining existing intents + new draft tasks)
    const allCandidates = [
        ...todaysIntents.map(i => ({ id: i.id, title: i.objective, original: true })),
        ...newTasks.map(t => ({ id: t.id, title: t.title, original: false }))
    ]

    const handleAddTask = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (taskInput.trim()) {
            setNewTasks([...newTasks, {
                id: crypto.randomUUID(),
                title: taskInput.trim(),
                notes: notesInput.trim()
            }])
            setTaskInput("")
            setNotesInput("")
            setShowNotesInput(false)
        }
    }

    const removeNewTask = (id: string) => {
        setNewTasks(newTasks.filter(t => t.id !== id))
    }

    const toggleSelection = (title: string) => {
        if (selectedOutcomes.includes(title)) {
            setSelectedOutcomes(selectedOutcomes.filter(t => t !== title))
        } else {
            if (selectedOutcomes.length < 4) {
                setSelectedOutcomes([...selectedOutcomes, title])
            }
        }
    }

    const handleCommit = () => {
        // 1. Create Intents for new tasks
        newTasks.forEach(draft => {
            addIntent({
                objective: draft.title,
                date: today,
                type: 'work', // Default
                outputDefinition: draft.notes || 'Task from Start Ritual', // Use notes as output definition or context
                estimatedEffort: 'medium',
                notes: draft.notes // Also save to new notes field if available
            })
        })

        // 2. Update Day Summary
        updateDaySummary(today, {
            date: today,
            topOutcomes: selectedOutcomes,
            mustFinishTaskId: undefined
        })

        setOpen(false)
        // Reset state
        setStep('dump')
        setNewTasks([])
        setSelectedOutcomes([])
    }

    // Render "Read Only" view if day started
    if (hasStartedDay) return (
        <div className="flex flex-col gap-4 p-4 border rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
            <div>
                <div className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400 mb-2">
                    <Sun className="h-5 w-5" />
                    <h3>Today's Focus</h3>
                </div>
                <ul className="space-y-2">
                    {daySummaries[today].topOutcomes.map((o, i) => (
                        <li key={i} className="flex items-start gap-3 text-base text-foreground/90">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium text-muted-foreground">
                                {i + 1}
                            </span>
                            <span className="pt-0.5">{o}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Stats Section */}
            <div className="pt-4 border-t border-orange-200/50 dark:border-orange-900/50">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" /> Progress
                    </span>
                    <span className="font-medium">{Math.round((progressStats.completed / (progressStats.total || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-orange-200/50 dark:bg-orange-900/50 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(progressStats.completed / (progressStats.total || 1)) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-muted-foreground/80">
                    <div>{progressStats.completed} Completed</div>
                    <div>{progressStats.total} Total Tasks</div>
                </div>
            </div>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gap-2 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white border-0">
                    <Sun className="h-4 w-4" />
                    Start My Day
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        {step === 'dump' ? '🧠 Brain Dump' : '🎯 Prioritize'}
                    </DialogTitle>
                    <p className="text-muted-foreground">
                        {step === 'dump'
                            ? "Get everything out of your head. What needs to happen?"
                            : "Select your Top 3-4 non-negotiable outcomes."}
                    </p>
                </DialogHeader>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                    {step === 'dump' ? (
                        <div className="space-y-6">
                            {/* Input Area */}
                            <div className="space-y-3 bg-muted/30 p-4 rounded-xl border">
                                <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a task..."
                                            value={taskInput}
                                            onChange={(e) => setTaskInput(e.target.value)}
                                            className="h-10 text-base"
                                            autoFocus
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowNotesInput(!showNotesInput)}
                                            className={cn("shrink-0", (showNotesInput || notesInput) && "text-primary bg-primary/10")}
                                        >
                                            <AlignLeft className="h-5 w-5" />
                                        </Button>
                                        <Button type="submit" size="icon" className="shrink-0">
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {(showNotesInput || notesInput) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="overflow-hidden"
                                        >
                                            <Textarea
                                                placeholder="Add details, links, or context..."
                                                value={notesInput}
                                                onChange={(e) => setNotesInput(e.target.value)}
                                                className="min-h-[60px] text-sm resize-none"
                                            />
                                        </motion.div>
                                    )}
                                </form>
                            </div>

                            {/* Lists */}
                            <div className="space-y-6">
                                {newTasks.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center justify-between">
                                            <span>New Items</span>
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{newTasks.length}</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {newTasks.map((task) => (
                                                <div key={task.id} className="flex flex-col p-3 bg-muted/40 rounded-lg border group relative hover:border-primary/50 transition-colors">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className="font-medium text-sm pt-0.5">{task.title}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeNewTask(task.id)}
                                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    {task.notes && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 pl-0">
                                                            {task.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {todaysIntents.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center justify-between">
                                            <span>Already Scheduled</span>
                                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{todaysIntents.length}</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {todaysIntents.map(intent => (
                                                <div key={intent.id} className="p-3 bg-card rounded-lg border text-muted-foreground opacity-80 text-sm">
                                                    {intent.objective}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {newTasks.length === 0 && todaysIntents.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground italic bg-muted/10 rounded-xl border border-dashed">
                                        No tasks yet. Start typing above to build your day!
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {allCandidates.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    Nothing to prioritize. Go back and add tasks!
                                </div>
                            ) : (
                                allCandidates.map((task) => {
                                    const isSelected = selectedOutcomes.includes(task.title)
                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => toggleSelection(task.title)}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                                                isSelected
                                                    ? "bg-orange-50 border-orange-200 shadow-sm dark:bg-orange-900/20 dark:border-orange-800"
                                                    : "hover:bg-accent"
                                            )}
                                        >
                                            <Checkbox checked={isSelected} className="h-5 w-5" />
                                            <span className={cn("flex-1 text-sm", isSelected && "font-medium")}>{task.title}</span>
                                            {isSelected && (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-bold dark:bg-orange-800 dark:text-orange-100">
                                                    {selectedOutcomes.indexOf(task.title) + 1}
                                                </span>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-4 border-t shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-muted-foreground hidden sm:block">
                            {step === 'prioritize' && `${selectedOutcomes.length} selected (Max 4)`}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            {step === 'prioritize' && (
                                <Button variant="ghost" onClick={() => setStep('dump')}>
                                    Back
                                </Button>
                            )}
                            {step === 'dump' ? (
                                <Button
                                    onClick={() => setStep('prioritize')}
                                    className="w-full sm:w-auto"
                                    disabled={allCandidates.length === 0}
                                >
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleCommit}
                                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
                                    disabled={selectedOutcomes.length === 0}
                                >
                                    Commit to Day
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
