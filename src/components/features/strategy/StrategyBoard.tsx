"use client"

import { useState, useEffect } from "react"
import { useStrategyStore, StrategyStep } from "@/lib/store/strategy-store"
import { Reorder, useDragControls } from "framer-motion"
import { Plus, GripVertical, Trash2, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function StrategyBoard() {
    const { steps, addStep, updateStep, deleteStep, reorderSteps } = useStrategyStore()
    const [newStepContent, setNewStepContent] = useState("")

    // Local state for reordering to prevent flicker before sync
    const [localSteps, setLocalSteps] = useState(steps)

    useEffect(() => {
        setLocalSteps(steps)
    }, [steps])

    const handleReorder = (newOrder: StrategyStep[]) => {
        setLocalSteps(newOrder)
        reorderSteps(newOrder)
    }

    const handleAddStep = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newStepContent.trim()) return
        addStep(newStepContent.trim())
        setNewStepContent("")
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Strategy Board</h1>
                <p className="text-lg text-muted-foreground">
                    Brainstorm, sequence, and plan your next big move.
                </p>
            </div>

            {/* Input Area */}
            <Card className="border-2 border-dashed bg-muted/20">
                <CardContent className="pt-6">
                    <form onSubmit={handleAddStep} className="flex gap-4">
                        <Input
                            placeholder="What's the next step? (e.g., 'Research Competitors')"
                            className="text-lg h-12 bg-background"
                            value={newStepContent}
                            onChange={(e) => setNewStepContent(e.target.value)}
                        />
                        <Button size="lg" type="submit" className="h-12 px-8">
                            <Plus className="mr-2 h-5 w-5" />
                            Add Step
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Strategy List */}
            <div className="space-y-4">
                {localSteps.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Your strategy canvas is empty. Start adding steps above.</p>
                    </div>
                ) : (
                    <Reorder.Group axis="y" values={localSteps} onReorder={handleReorder} className="space-y-3">
                        {localSteps.map((step) => (
                            <StepItem
                                key={step.id}
                                step={step}
                                onUpdate={(updates) => updateStep(step.id, updates)}
                                onDelete={() => deleteStep(step.id)}
                            />
                        ))}
                    </Reorder.Group>
                )}
            </div>
        </div>
    )
}

function StepItem({ step, onUpdate, onDelete }: {
    step: StrategyStep,
    onUpdate: (u: Partial<StrategyStep>) => void,
    onDelete: () => void
}) {
    const controls = useDragControls()
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <Reorder.Item value={step} dragListener={false} dragControls={controls}>
            <Card className={cn(
                "group relative hover:shadow-md transition-shadow cursor-default",
                isExpanded ? "ring-2 ring-primary/20" : ""
            )}>
                <div className="flex items-start p-4 gap-3">
                    {/* Drag Handle */}
                    <div
                        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-foreground touch-none"
                        onPointerDown={(e) => controls.start(e)}
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                            <Input
                                value={step.content}
                                onChange={(e) => onUpdate({ content: e.target.value })}
                                className="font-medium text-lg border-transparent px-0 h-auto focus-visible:ring-0 focus:border-input hover:border-input bg-transparent"
                            />
                        </div>

                        {/* Notes Area (Collapsible) */}
                        {isExpanded && (
                            <Textarea
                                placeholder="Add detailed notes, links, or sub-tasks..."
                                value={step.notes || ""}
                                onChange={(e) => onUpdate({ notes: e.target.value })}
                                className="min-h-[100px] resize-none bg-muted/30"
                            />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                            title={isExpanded ? "Collapse Notes" : "Expand Notes"}
                        >
                            <StickyNote className={cn("h-4 w-4", step.notes ? "fill-primary/20 text-primary" : "text-muted-foreground")} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </Reorder.Item>
    )
}
