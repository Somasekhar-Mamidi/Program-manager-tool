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
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { BrainCircuit as BrainCircuitIcon, BookMarked, Target, Calendar, Workflow, ListTodo, PenTool } from "lucide-react"
import React, { forwardRef, useRef } from "react"

// A generic circle node representing an app/integration
const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
    ({ className, children }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-card p-3 shadow-md",
                    className
                )}
            >
                {children}
            </div>
        )
    }
)
Circle.displayName = "Circle"

export default function StrategyBoard() {
    const { steps, addStep, updateStep, deleteStep, reorderSteps } = useStrategyStore()
    const [newStepContent, setNewStepContent] = useState("")
    const [localSteps, setLocalSteps] = useState(steps)

    // Refs for the animated connection beams
    const containerRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)
    const div1Ref = useRef<HTMLDivElement>(null)
    const div2Ref = useRef<HTMLDivElement>(null)
    const div3Ref = useRef<HTMLDivElement>(null)
    const div4Ref = useRef<HTMLDivElement>(null)
    const div5Ref = useRef<HTMLDivElement>(null)
    const div6Ref = useRef<HTMLDivElement>(null)

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
        <div className="flex flex-col h-full bg-background">
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

                {/* Ecosystem Architecture Diagram */}
                <div
                    className="relative flex w-full h-[300px] items-center justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-sm mb-8"
                    ref={containerRef}
                >
                    <div className="flex h-full flex-col justify-between">
                        <Circle ref={div1Ref} className="border-purple-200 bg-purple-50 relative group h-12 w-12">
                            <span className="absolute -top-6 text-xs font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Charters</span>
                            <BookMarked className="h-5 w-5 text-purple-500" />
                        </Circle>
                        <Circle ref={div2Ref} className="border-blue-200 bg-blue-50 relative group h-12 w-12">
                            <span className="absolute -top-6 text-xs font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Strategy</span>
                            <Target className="h-5 w-5 text-blue-500" />
                        </Circle>
                        <Circle ref={div3Ref} className="border-orange-200 bg-orange-50 relative group h-12 w-12">
                            <span className="absolute -top-6 text-xs font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Calendar</span>
                            <Calendar className="h-5 w-5 text-orange-500" />
                        </Circle>
                    </div>

                    <div className="flex flex-col justify-center relative z-10">
                        <Circle ref={rootRef} className="h-20 w-20 border-primary/30 bg-primary/10 shadow-primary/20 shadow-xl relative group">
                            <span className="absolute -top-7 text-xs font-bold text-primary">DeepWork</span>
                            <BrainCircuitIcon className="h-8 w-8 text-primary" />
                        </Circle>
                    </div>

                    <div className="flex h-full flex-col justify-between">
                        <Circle ref={div4Ref} className="border-green-200 bg-green-50 relative group h-12 w-12">
                            <span className="absolute -top-6 text-xs font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">TaskFlow</span>
                            <Workflow className="h-5 w-5 text-green-500" />
                        </Circle>
                        <Circle ref={div5Ref} className="border-slate-200 bg-white relative group h-12 w-12">
                            <span className="absolute -top-6 text-xs font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Tasks</span>
                            <ListTodo className="h-5 w-5 text-slate-800" />
                        </Circle>
                        <Circle ref={div6Ref} className="border-indigo-200 bg-indigo-50 relative group h-12 w-12">
                            <span className="absolute -top-6 text-xs font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Writing</span>
                            <PenTool className="h-5 w-5 text-indigo-500" />
                        </Circle>
                    </div>

                    {/* Input Connections */}
                    <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={rootRef} curvature={-50} endYOffset={-10} />
                    <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={rootRef} />
                    <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={rootRef} curvature={50} endYOffset={10} />

                    {/* Output Connections */}
                    <AnimatedBeam containerRef={containerRef} fromRef={rootRef} toRef={div4Ref} curvature={-50} endYOffset={-10} reverse />
                    <AnimatedBeam containerRef={containerRef} fromRef={rootRef} toRef={div5Ref} reverse />
                    <AnimatedBeam containerRef={containerRef} fromRef={rootRef} toRef={div6Ref} curvature={50} endYOffset={10} reverse />
                </div>


                {/* Input Area - Cleaner Bar style */}
                <div className="bg-card p-2 rounded-lg border shadow-sm flex gap-2">
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
                "group relative bg-card border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200",
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
