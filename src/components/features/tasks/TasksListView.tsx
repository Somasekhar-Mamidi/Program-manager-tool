"use client"

import React from "react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { IntentBlock } from "@/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    CheckCircle2,
    Circle,
    Flag,
    ArrowUpDown,
    Filter,
    List
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TasksListViewProps {
    onSelectTask: (taskId: string) => void
    selectedTaskId: string | null
    tasks: IntentBlock[]
}

export function TasksListView({ onSelectTask, selectedTaskId, tasks: initialTasks }: TasksListViewProps) {
    const { updateIntent } = useCalendarStore()
    const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

    const tasks = React.useMemo(() => {
        let sorted = [...initialTasks];
        if (sortConfig) {
            sorted.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof IntentBlock];
                let bValue: any = b[sortConfig.key as keyof IntentBlock];

                // Handle specific keys like assignee name
                if (sortConfig.key === 'assignee') {
                    aValue = a.assignee?.name || '';
                    bValue = b.assignee?.name || '';
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }, [initialTasks, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig((current) => {
            if (current?.key === key) {
                return current.direction === 'asc' ? { key, direction: 'desc' } : null;
            }
            return { key, direction: 'asc' };
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <div className="flex items-center gap-1.5 text-green-600 bg-transparent font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Done</span>
                    </div>
                )
            case 'in-progress':
                return (
                    <div className="flex items-center gap-1.5 text-blue-600 bg-transparent font-medium">
                        <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        <span>In Progress</span>
                    </div>
                )
            case 'planned':
            default:
                return (
                    <div className="flex items-center gap-1.5 text-slate-500 bg-transparent font-medium">
                        <Circle className="h-4 w-4" />
                        <span>Not Started</span>
                    </div>
                )
        }
    }

    const getPriorityBadge = (priority?: string) => {
        if (!priority) return null;
        const p = priority.toLowerCase();
        let colorClass = "text-slate-500";
        if (p === 'high') colorClass = "text-red-600";
        if (p === 'medium') colorClass = "text-amber-500";
        if (p === 'low') colorClass = "text-blue-500";

        return (
            <div className={`flex items-center gap-1.5 ${colorClass} font-medium`}>
                <Flag className="h-3.5 w-3.5 fill-current" />
                <span>{priority}</span>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-slate-50/80 border-b border-slate-200">
                        <TableHead className="w-[400px] font-semibold text-slate-700">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('objective')}>
                                Title <ArrowUpDown className="h-3 w-3 text-slate-400" />
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('status')}>
                                Status <ArrowUpDown className="h-3 w-3 text-slate-400" />
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('priority')}>
                                Priority <ArrowUpDown className="h-3 w-3 text-slate-400" />
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('dueDate')}>
                                Due Date <ArrowUpDown className="h-3 w-3 text-slate-400" />
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('project')}>
                                Project <ArrowUpDown className="h-3 w-3 text-slate-400" />
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow
                            key={task.id}
                            className={cn(
                                "cursor-pointer transition-colors hover:bg-slate-50",
                                selectedTaskId === task.id ? "bg-blue-50/60 hover:bg-blue-50/80 border-l-2 border-l-blue-600" : "border-l-2 border-l-transparent"
                            )}
                            onClick={() => onSelectTask(task.id)}
                        >
                            <TableCell className="py-4">
                                <div className="space-y-1.5">
                                    <div className="font-medium text-slate-900">{task.objective}</div>
                                    {task.assignee && (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={task.assignee.avatar} />
                                                <AvatarFallback className="text-[9px]">{task.assignee.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-slate-500">{task.assignee.name}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <Select
                                        defaultValue={task.status}
                                        onValueChange={(value) => updateIntent(task.id, { status: value as any })}
                                    >
                                        <SelectTrigger className="h-8 border-transparent bg-transparent hover:bg-slate-100 px-2 -ml-2 w-auto min-w-[120px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planned">
                                                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                                    <Circle className="h-4 w-4" />
                                                    <span>Not Started</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="in-progress">
                                                <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                                                    <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                    <span>In Progress</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                <div className="flex items-center gap-1.5 text-green-600 font-medium">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Done</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="blocked">
                                                <div className="flex items-center gap-1.5 text-red-600 font-medium">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Blocked</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <Select
                                        defaultValue={task.priority || "Medium"}
                                        onValueChange={(value) => updateIntent(task.id, { priority: value as any })}
                                    >
                                        <SelectTrigger className="h-8 border-transparent bg-transparent hover:bg-slate-100 px-2 -ml-2 w-auto min-w-[100px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High">
                                                <div className="flex items-center gap-1.5 text-red-600 font-medium">
                                                    <Flag className="h-3.5 w-3.5 fill-current" />
                                                    <span>High</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Medium">
                                                <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                                                    <Flag className="h-3.5 w-3.5 fill-current" />
                                                    <span>Medium</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Low">
                                                <div className="flex items-center gap-1.5 text-blue-500 font-medium">
                                                    <Flag className="h-3.5 w-3.5 fill-current" />
                                                    <span>Low</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TableCell>
                            <TableCell className="text-slate-600 font-medium">{task.dueDate || format(new Date(task.date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="text-slate-600 font-medium">{task.project || "General"}</TableCell>
                        </TableRow>
                    ))}
                    {tasks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                No tasks found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

import { format } from "date-fns"
