"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import dynamic from "next/dynamic"

// Dynamic imports to prevent build issues and enable code splitting
const DynamicTasksListView = dynamic(() => import("@/components/features/tasks/TasksListView").then(mod => mod.TasksListView), {
    loading: () => <div className="w-full h-full bg-slate-50/50 animate-pulse" />
})

const TaskDetailPanel = dynamic(() => import("@/components/features/tasks/TaskDetailPanel").then(mod => mod.TaskDetailPanel), {
    loading: () => <div className="w-[400px] border-l bg-background animate-pulse" />
})
const TaskBoardView = dynamic(() => import("@/components/features/tasks/TaskBoardView").then(mod => mod.TaskBoardView), {
    loading: () => <div className="flex-1 bg-slate-50/50 animate-pulse" />
})
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/lib/store/calendar-store"
import {
    LayoutList,
    LayoutGrid,
    SlidersHorizontal,
    ArrowUpDown,
    Check
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function TasksPage() {
    const [viewMode, setViewMode] = useState<'list' | 'board'>('board')
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const { intents } = useCalendarStore()

    const filteredTasks = intents.filter(task => {
        if (!statusFilter) return true;
        return task.status === statusFilter;
    });

    const statuses = [
        { value: "planned", label: "Not Started" },
        { value: "in-progress", label: "In Progress" },
        { value: "completed", label: "Done" },
        { value: "blocked", label: "Blocked" },
    ]

    return (
        <div className="flex flex-col h-full bg-background">
            <ErrorBoundary>
                <PageHeader items={[{ label: 'Workspace' }, { label: 'Tasks' }]}>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-muted p-1 rounded-lg border">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 px-2.5 text-xs font-medium",
                                    viewMode === 'board' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setViewMode('board')}
                            >
                                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                                View: Board
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 px-2.5 text-xs font-medium",
                                    viewMode === 'list' ? "bg-primary/10 text-primary shadow-sm border border-primary/20" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setViewMode('list')}
                            >
                                <LayoutList className="h-3.5 w-3.5 mr-1.5" />
                                View: List
                            </Button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className={cn("h-9 gap-2 bg-background", statusFilter ? "text-primary border-primary/30 bg-primary/10" : "text-muted-foreground")}>
                                    <SlidersHorizontal className="h-4 w-4" />
                                    {statusFilter ? statuses.find(s => s.value === statusFilter)?.label : "Filter"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setStatusFilter(null)} className="cursor-pointer">
                                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", !statusFilter ? "bg-primary text-primary-foreground" : "opacity-0")} >
                                        <Check className="h-3 w-3" />
                                    </div>
                                    All Statuses
                                </DropdownMenuItem>
                                {statuses.map((status) => (
                                    <DropdownMenuItem
                                        key={status.value}
                                        onClick={() => setStatusFilter(status.value === statusFilter ? null : status.value)}
                                        className="cursor-pointer"
                                    >
                                        <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", statusFilter === status.value ? "bg-primary text-primary-foreground" : "opacity-0")} >
                                            <Check className="h-3 w-3" />
                                        </div>
                                        {status.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground bg-background">
                            <ArrowUpDown className="h-4 w-4" />
                            Sort
                        </Button>
                    </div>
                </PageHeader>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Main Content */}
                    <div className={cn(
                        "flex-1 p-6 transition-all duration-300",
                        viewMode === 'list' ? "overflow-hidden" : "overflow-y-auto",
                        selectedTaskId ? "mr-0" : ""
                    )}>
                        <div className="max-w-[1600px] mx-auto h-full">
                            {viewMode === 'list' ? (
                                <DynamicTasksListView
                                    onSelectTask={setSelectedTaskId}
                                    selectedTaskId={selectedTaskId}
                                    tasks={filteredTasks}
                                />
                            ) : (
                                <div className="h-full">
                                    <TaskBoardView intents={filteredTasks} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    {selectedTaskId && (
                        <div className="h-full border-l bg-background shadow-xl z-20 animate-in slide-in-from-right duration-300">
                            <TaskDetailPanel
                                taskId={selectedTaskId}
                                onClose={() => setSelectedTaskId(null)}
                            />
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </div>
    )
}
