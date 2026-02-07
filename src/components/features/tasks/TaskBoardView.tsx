"use client"


import React, { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useCalendarStore } from "@/lib/store/calendar-store"
import { IntentBlock, MicroStep } from "@/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
    ChevronDown,
    ChevronRight,
    ArrowUpDown,
    AlertCircle,
    CheckCircle2,
    Circle,
    Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Input } from "@/components/ui/input"
import { CharterSection } from "./CharterSection"
import { AddIntentDialog } from "../calendar/AddIntentDialog"
import { Plus, Trash2 } from "lucide-react"

export function TaskBoardView({ intents: propIntents }: { intents?: IntentBlock[] } = {}) {
    const { intents: storeIntents, charters, updateIntent, deleteIntent, toggleMicroStep, addMicroStep } = useCalendarStore()
    const intents = propIntents || storeIntents
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [editingBlocker, setEditingBlocker] = useState<string | null>(null)
    const [blockerText, setBlockerText] = useState("")
    const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'charter' | 'status'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' })

    const sortedIntents = React.useMemo(() => {
        const items = [...intents]

        return items.sort((a, b) => {
            if (sortConfig.key === 'charter') {
                const charterA = charters.find(c => c.id === a.charterId)?.title || "zz_no_charter" // Put no charter last
                const charterB = charters.find(c => c.id === b.charterId)?.title || "zz_no_charter"

                if (charterA < charterB) return sortConfig.direction === 'asc' ? -1 : 1
                if (charterA > charterB) return sortConfig.direction === 'asc' ? 1 : -1

                return b.createdAt - a.createdAt
            }

            if (sortConfig.key === 'status') {
                if (a.status < b.status) return sortConfig.direction === 'asc' ? -1 : 1
                if (a.status > b.status) return sortConfig.direction === 'asc' ? 1 : -1
                return b.createdAt - a.createdAt
            }

            // Default date sort
            return sortConfig.direction === 'asc'
                ? a.createdAt - b.createdAt
                : b.createdAt - a.createdAt
        })
    }, [intents, charters, sortConfig])

    const toggleSort = (key: 'date' | 'charter' | 'status') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    // Split into pending (planned, in-progress, deferred) and completed
    const pendingIntents = sortedIntents.filter(i => i.status !== 'completed')
    const completedIntents = sortedIntents.filter(i => i.status === 'completed')

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedRows(newExpanded)
    }

    const startEditingBlocker = (intent: IntentBlock) => {
        setEditingBlocker(intent.id)
        setBlockerText(intent.blockers || "")
    }

    const saveBlocker = (intentId: string) => {
        updateIntent(intentId, { blockers: blockerText })
        setEditingBlocker(null)
    }

    const getProgress = (steps: MicroStep[]) => {
        if (steps.length === 0) return 0
        const completed = steps.filter(s => s.isCompleted).length
        return Math.round((completed / steps.length) * 100)
    }

    const getNextAction = (steps: MicroStep[]) => {
        return steps.find(s => !s.isCompleted)
    }

    const IntentTable = ({ data, toggleSort, sortConfig }: {
        data: IntentBlock[],
        toggleSort: (key: 'date' | 'charter' | 'status') => void,
        sortConfig: { key: 'date' | 'charter' | 'status'; direction: 'asc' | 'desc' }
    }) => (
        <div className="border rounded-lg bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30px]"></TableHead>
                        <TableHead className="w-[300px]">Task / Intent</TableHead>
                        <TableHead
                            className="w-[150px] cursor-pointer hover:text-foreground transition-colors group select-none"
                            onClick={() => toggleSort('charter')}
                        >
                            <div className="flex items-center gap-1">
                                Charter
                                <ArrowUpDown className={cn("h-3 w-3 transition-opacity", sortConfig.key === 'charter' ? "opacity-100" : "opacity-0 group-hover:opacity-50")} />
                            </div>
                        </TableHead>
                        <TableHead
                            className="w-[120px] cursor-pointer hover:text-foreground transition-colors group select-none"
                            onClick={() => toggleSort('status')}
                        >
                            <div className="flex items-center gap-1">
                                Status
                                <ArrowUpDown className={cn("h-3 w-3 transition-opacity", sortConfig.key === 'status' ? "opacity-100" : "opacity-0 group-hover:opacity-50")} />
                            </div>
                        </TableHead>
                        <TableHead className="w-[150px]">Progress</TableHead>
                        <TableHead className="w-[250px]">Next Action</TableHead>
                        <TableHead>Blockers / Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(intent => {
                        const isExpanded = expandedRows.has(intent.id)
                        const progress = getProgress(intent.microSteps)
                        const nextAction = getNextAction(intent.microSteps)

                        return (
                            <React.Fragment key={intent.id}>
                                <TableRow className={cn(isExpanded && "bg-muted/50")}>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleRow(intent.id)}>
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{intent.objective}</span>
                                            <span className="text-xs text-muted-foreground">{format(new Date(intent.date), 'MMM d, yyyy')}</span>
                                        </div>
                                    </TableCell>




                                    <TableCell>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                value={intent.charterId || "none"}
                                                onValueChange={(value) => updateIntent(intent.id, { charterId: value === 'none' ? undefined : value })}
                                            >
                                                <SelectTrigger className="h-8 w-[130px] border-0 text-muted-foreground">
                                                    <SelectValue placeholder="No Charter" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No Charter</SelectItem>
                                                    {charters.map(charter => (
                                                        <SelectItem key={charter.id} value={charter.id}>
                                                            {charter.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                defaultValue={intent.status}
                                                onValueChange={(value) => updateIntent(intent.id, { status: value as any })}
                                            >
                                                <SelectTrigger className={cn(
                                                    "h-8 w-[130px] border-0",
                                                    intent.status === 'completed' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium",
                                                    intent.status === 'in-progress' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium",
                                                    intent.status === 'blocked' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium",
                                                    intent.status === 'planned' && "bg-muted text-muted-foreground",
                                                    intent.status === 'deferred' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                )}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="planned">Planned</SelectItem>
                                                    <SelectItem value="in-progress">Started</SelectItem>
                                                    <SelectItem value="blocked">Blocked</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="deferred">Deferred</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm("Are you sure you want to delete this task?")) {
                                                    deleteIntent(intent.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={progress} className="h-2 w-full" />
                                            <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {nextAction ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Circle className="h-3 w-3 text-primary animate-pulse" />
                                                <span className="truncate">{nextAction.title}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">All steps done</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingBlocker === intent.id ? (
                                            <div className="flex gap-2">
                                                <Textarea
                                                    value={blockerText}
                                                    onChange={(e) => setBlockerText(e.target.value)}
                                                    className="min-h-[60px] text-xs"
                                                    autoFocus
                                                />
                                                <Button size="icon" className="h-8 w-8 shrink-0" onClick={() => saveBlocker(intent.id)}>
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => startEditingBlocker(intent)}
                                                className={cn(
                                                    "text-sm cursor-pointer hover:bg-accent/50 p-2 rounded min-h-[40px] border border-transparent hover:border-border transition-colors line-clamp-2",
                                                    !intent.blockers && "text-muted-foreground italic opacity-50",
                                                    intent.blockers && "text-red-500 font-medium bg-red-50/50"
                                                )}
                                            >
                                                {intent.blockers || "Click to add blocker..."}
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>

                                {/* Expanded Detail Row */}
                                {isExpanded && (
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableCell colSpan={6}>
                                            <div className="p-4 pl-12 space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Full Breakdown
                                                    </h4>
                                                    <div className="space-y-1">
                                                        {intent.microSteps.map(step => (
                                                            <div
                                                                key={step.id}
                                                                className="flex items-center gap-2 text-sm p-1 hover:bg-background/80 rounded transition-colors cursor-pointer"
                                                                onClick={() => toggleMicroStep(intent.id, step.id)}
                                                            >
                                                                <div className={cn(
                                                                    "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                                                                    step.isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                                                )}>
                                                                    {step.isCompleted && <CheckCircle2 className="h-3 w-3" />}
                                                                </div>
                                                                <span className={cn(step.isCompleted && "line-through text-muted-foreground")}>
                                                                    {step.title}
                                                                    <span className="ml-2 text-[10px] uppercase text-muted-foreground/60 border px-1 rounded">
                                                                        {step.type}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        ))}

                                                        {/* Add New Step Input */}
                                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed">
                                                            <Input
                                                                placeholder="Add a micro-step..."
                                                                className="h-8 text-xs"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const target = e.target as HTMLInputElement
                                                                        if (target.value.trim()) {
                                                                            addMicroStep(intent.id, {
                                                                                id: crypto.randomUUID(),
                                                                                title: target.value,
                                                                                isCompleted: false,
                                                                                type: 'manual'
                                                                            })
                                                                            target.value = ""
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                                press Enter
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        )
                    })}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No tasks found in this category.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div >
    )

    return (
        <div className="space-y-6">
            <CharterSection />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Task Follower Board</h2>
                    <AddIntentDialog date={new Date()}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                        </Button>
                    </AddIntentDialog>
                </div>

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList>
                        <TabsTrigger value="pending">Pending ({pendingIntents.length})</TabsTrigger>
                        <TabsTrigger value="completed">Completed ({completedIntents.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4">
                        <IntentTable data={pendingIntents} toggleSort={toggleSort} sortConfig={sortConfig} />
                    </TabsContent>
                    <TabsContent value="completed" className="mt-4">
                        <IntentTable data={completedIntents} toggleSort={toggleSort} sortConfig={sortConfig} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
