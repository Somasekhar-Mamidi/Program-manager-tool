"use client"

import { useState, useEffect } from "react"
import { useStrategyStore, StrategyStep } from "@/lib/store/strategy-store"
import { Reorder, useDragControls } from "framer-motion"
import { Plus, GripVertical, Trash2, StickyNote, Filter, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/PageHeader"

export default function StrategyBoard() {
    const { steps, addStep, updateStep, deleteStep, reorderSteps } = useStrategyStore()
    const [newStepContent, setNewStepContent] = useState("")
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
        <div className="flex flex-col h-full bg-slate-50/50">
            <PageHeader items={[{ label: 'Workspace' }, { label: 'Strategy' }]}>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-muted-foreground">
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-muted-foreground">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        Sort
                    </Button>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-auto p-4 lg:p-6 max-w-5xl mx-auto w-full space-y-6">

                {/* Input Area - Cleaner Bar style */}
                <div className="bg-white p-2 rounded-lg border shadow-sm flex gap-2">
                    <form onSubmit={handleAddStep} className="flex-1 flex gap-2">
                        <Input
                            placeholder="Add a new strategic initiative..."
                            className="border-0 focus-visible:ring-0 text-base h-10 bg-transparent flex-1"
                            value={newStepContent}
                            onChange={(e) => setNewStepContent(e.target.value)}
                        />
                        <Button size="sm" type="submit" className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                            Add Step
                        </Button>
                    </form>
                </div>

                {/* Strategy List */}
                <div className="space-y-2">
                    {localSteps.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl border-slate-200">
                            <StickyNote className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-500 font-medium">No strategy steps yet</p>
                            <p className="text-slate-400 text-sm">Add one above to get started</p>
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
            <div className={cn(
                "group relative bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200",
                isExpanded ? "ring-1 ring-indigo-500 border-indigo-500" : ""
            )}>
                <div className="flex items-start p-3 gap-3">
                    {/* Drag Handle */}
                    <div
                        className="mt-1.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 touch-none flex-shrink-0"
                        onPointerDown={(e) => controls.start(e)}
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3 pt-0.5">
                        <div className="flex gap-3">
                            <Input
                                value={step.content}
                                onChange={(e) => onUpdate({ content: e.target.value })}
                                className="font-medium text-base border-transparent px-0 h-auto focus-visible:ring-0 focus:border-input hover:border-slate-200 bg-transparent transition-colors p-1"
                            />
                        </div>

                        {/* Notes Area (Collapsible) */}
                        {isExpanded && (
                            <Textarea
                                placeholder="Add detailed notes, links, or sub-tasks..."
                                value={step.notes || ""}
                                onChange={(e) => onUpdate({ notes: e.target.value })}
                                className="min-h-[100px] resize-none bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/20"
                            />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsExpanded(!isExpanded)}
                            title={isExpanded ? "Collapse Notes" : "Expand Notes"}
                        >
                            <StickyNote className={cn("h-4 w-4", step.notes ? "fill-indigo-100 text-indigo-600" : "text-slate-400")} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Reorder.Item>
    )
}
