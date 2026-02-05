"use client"

import { useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import { Check, Plus, Rocket, Trash2, Brain, Flag } from "lucide-react"
import { IntentBlock, MicroStep } from "@/types"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface TaskBreakdownButtonProps {
    intent: IntentBlock
    children?: React.ReactNode
}

export function TaskBreakdownButton({ intent, children }: TaskBreakdownButtonProps) {
    const { addMicroStep, toggleMicroStep, updateIntent } = useCalendarStore()
    const [newStepTitle, setNewStepTitle] = useState("")
    const [newStepType, setNewStepType] = useState<'start' | 'core' | 'finish'>('core')

    const handleSubmitStep = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newStepTitle.trim()) return

        addMicroStep(intent.id, {
            id: uuidv4(),
            title: newStepTitle,
            isCompleted: false,
            type: newStepType,
        })
        setNewStepTitle("")
    }

    const startSteps = intent.microSteps.filter(s => s.type === 'start')
    const coreSteps = intent.microSteps.filter(s => s.type === 'core')
    const finishSteps = intent.microSteps.filter(s => s.type === 'finish')

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children || <Button variant="outline" size="sm">Breakdown</Button>}
            </SheetTrigger>
            <SheetContent className="sm:max-w-md w-full overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl">{intent.objective}</SheetTitle>
                    <SheetDescription>
                        Break this intent down into small, actionable steps.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Add New Step Form */}
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                        <h4 className="font-medium text-sm">Add Action</h4>
                        <div className="flex gap-2 mb-2">
                            <Button
                                type="button"
                                variant={newStepType === 'start' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setNewStepType('start')}
                                className="h-7 text-xs px-2"
                            >
                                <Rocket className="mr-1 h-3 w-3" /> Start
                            </Button>
                            <Button
                                type="button"
                                variant={newStepType === 'core' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setNewStepType('core')}
                                className="h-7 text-xs px-2"
                            >
                                <Brain className="mr-1 h-3 w-3" /> Core
                            </Button>
                            <Button
                                type="button"
                                variant={newStepType === 'finish' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setNewStepType('finish')}
                                className="h-7 text-xs px-2"
                            >
                                <Flag className="mr-1 h-3 w-3" /> Finish
                            </Button>
                        </div>
                        <form onSubmit={handleSubmitStep} className="flex gap-2">
                            <Input
                                placeholder={
                                    newStepType === 'start' ? "e.g., Open Google Doc (2 mins)" :
                                        newStepType === 'core' ? "e.g., Write first paragraph" :
                                            "e.g., Send to team"
                                }
                                value={newStepTitle}
                                onChange={(e) => setNewStepTitle(e.target.value)}
                                className="h-9"
                            />
                            <Button type="submit" size="sm" className="h-9 w-9 p-0">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>

                    {/* Steps List */}
                    <div className="space-y-6">
                        {/* Start Actions */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                <Rocket className="h-4 w-4" />
                                Start Actions (Ignition)
                            </div>
                            <div className="space-y-2">
                                {startSteps.length === 0 && (
                                    <div className="text-sm text-muted-foreground/60 italic px-2">
                                        No start actions. Add a tiny task to get momentum.
                                    </div>
                                )}
                                {startSteps.map(step => (
                                    <StepItem key={step.id} step={step} intentId={intent.id} onToggle={toggleMicroStep} />
                                ))}
                            </div>
                        </div>

                        {/* Core Actions */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                <Brain className="h-4 w-4" />
                                Core Work
                            </div>
                            <div className="space-y-2">
                                {coreSteps.length === 0 && (
                                    <div className="text-sm text-muted-foreground/60 italic px-2">
                                        No core actions defined.
                                    </div>
                                )}
                                {coreSteps.map(step => (
                                    <StepItem key={step.id} step={step} intentId={intent.id} onToggle={toggleMicroStep} />
                                ))}
                            </div>
                        </div>

                        {/* Finish Actions */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                <Flag className="h-4 w-4" />
                                Finishing Touches
                            </div>
                            <div className="space-y-2">
                                {finishSteps.length === 0 && (
                                    <div className="text-sm text-muted-foreground/60 italic px-2">
                                        No finish actions defined.
                                    </div>
                                )}
                                {finishSteps.map(step => (
                                    <StepItem key={step.id} step={step} intentId={intent.id} onToggle={toggleMicroStep} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

function StepItem({ step, intentId, onToggle }: { step: MicroStep, intentId: string, onToggle: (iid: string, sid: string) => void }) {
    return (
        <div
            onClick={() => onToggle(intentId, step.id)}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all cursor-pointer hover:bg-accent",
                step.isCompleted && "bg-muted/50 opacity-60"
            )}
        >
            <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                step.isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
            )}>
                {step.isCompleted && <Check className="h-3 w-3" />}
            </div>
            <span className={cn(
                "text-sm font-medium",
                step.isCompleted && "line-through text-muted-foreground"
            )}>
                {step.title}
            </span>
        </div>
    )
}
