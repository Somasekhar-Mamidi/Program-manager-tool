"use client"

import React from "react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { IntentBlock } from "@/types"
import { format } from "date-fns"
import { FixedSizeList, ListChildComponentProps } from "react-window"
import { AutoSizer } from "react-virtualized-auto-sizer"
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
    Trash2,
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
    const { updateIntent, deleteIntent } = useCalendarStore()
    const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
    const AutoSizerAny = AutoSizer as any;

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

    const Row = ({ index, style }: ListChildComponentProps) => {
        const task = tasks[index];
        const isSelected = selectedTaskId === task.id;

        return (
            <div
                style={style}
                className={cn(
                    "flex items-center border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group",
                    isSelected ? "bg-blue-50/60 hover:bg-blue-50/80 border-l-2 border-l-blue-600" : "border-l-2 border-l-transparent"
                )}
                onClick={() => onSelectTask(task.id)}
            >
                {/* Title & Assignee */}
                <div className="flex-1 min-w-0 px-4 py-2">
                    <div className="space-y-1.5">
                        <div className="font-medium text-slate-900 truncate">{task.objective}</div>
                        {task.assignee && (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={task.assignee.avatar} />
                                    <AvatarFallback className="text-[9px]">{task.assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-slate-500 truncate">{task.assignee.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className="w-[150px] px-4" onClick={(e) => e.stopPropagation()}>
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

                {/* Priority */}
                <div className="w-[120px] px-4" onClick={(e) => e.stopPropagation()}>
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

                {/* Due Date */}
                <div className="w-[150px] px-4 text-slate-600 font-medium text-sm">
                    {task.dueDate || (task.date && format(new Date(task.date), 'MMM dd, yyyy'))}
                </div>

                {/* Project */}
                <div className="w-[150px] px-4 text-slate-600 font-medium text-sm truncate">
                    {task.project || "General"}
                </div>
                {/* Delete Action */}
                <div className="w-[50px] px-4 flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this task?")) {
                                deleteIntent(task.id);
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center bg-slate-50/80 border-b border-slate-200 py-3 pr-4"> {/* Added pr-4 for scrollbar offset */}
                <div className="flex-1 px-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900" onClick={() => handleSort('objective')}>
                        Title <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                </div>
                <div className="w-[150px] px-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900" onClick={() => handleSort('status')}>
                        Status <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                </div>
                <div className="w-[120px] px-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900" onClick={() => handleSort('priority')}>
                        Priority <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                </div>
                <div className="w-[150px] px-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900" onClick={() => handleSort('dueDate')}>
                        Due Date <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                </div>
                <div className="w-[150px] px-4 font-semibold text-slate-700 text-sm">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900" onClick={() => handleSort('project')}>
                        Project <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* List Body */}
            <div className="flex-1">
                {tasks.length > 0 ? (
                    <AutoSizerAny>
                        {({ height, width }: { height: number; width: number }) => (
                            <FixedSizeList
                                height={height}
                                width={width}
                                itemCount={tasks.length}
                                itemSize={72}
                            >
                                {Row}
                            </FixedSizeList>
                        )}
                    </AutoSizerAny>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No tasks found.
                    </div>
                )}
            </div>
        </div >
    )
}
