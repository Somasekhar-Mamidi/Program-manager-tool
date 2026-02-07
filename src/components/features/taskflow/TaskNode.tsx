import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task, useTaskFlowStore } from '@/lib/store/taskflow-store';
import { cn } from '@/lib/utils';
import { Calendar, User, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from "@/components/ui/button";

interface TaskNodeProps {
    task: Task;
    onConnectStart: (taskId: string, startX: number, startY: number) => void;
    onConnectEnd: (taskId: string) => void;
    isConnecting: boolean;
}

export const TaskNode: React.FC<TaskNodeProps> = ({
    task,
    onConnectStart,
    // onConnectEnd, // Handled implicitly by drop on container? No, we need to pass it up or handle here.
    // Actually, parent handles drop logic.
    isConnecting
}) => {
    const { updateTaskPosition, updateTaskTitle, deleteTask, updateTask } = useTaskFlowStore();
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localTitle, setLocalTitle] = useState(task.title);

    // Calculate color based on status
    const statusColor = {
        'TODO': 'bg-blue-500 text-white',
        'DOING': 'bg-orange-500 text-white',
        'DONE': 'bg-green-500 text-white'
    }[task.phase] || 'bg-slate-500 text-white';

    const statusLabel = {
        'TODO': 'To Do',
        'DOING': 'In Progress',
        'DONE': 'Completed'
    }[task.phase];

    const handleDragEnd = (_: any, info: any) => {
        const newX = Math.round(task.x + info.offset.x);
        const newY = Math.round(task.y + info.offset.y);
        updateTaskPosition(task.id, newX, newY);
    };

    const handleTitleSubmit = () => {
        setIsEditing(false);
        if (localTitle.trim() !== task.title) {
            updateTaskTitle(task.id, localTitle);
        }
    };

    const onConnectionHandlePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onConnectStart(task.id, task.x + 240, task.y + 100); // Approximate center-right of the new larger card
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            initial={{ x: task.x, y: task.y }}
            animate={{ x: task.x, y: task.y }}
            transition={{ duration: 0 }}
            onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={cn(
                "absolute w-[240px] bg-white rounded-xl shadow-md border cursor-grab active:cursor-grabbing z-10 font-sans group select-none flex flex-col transition-all duration-200",
                isHovered ? "shadow-lg scale-[1.02]" : "shadow-sm",
                // "Frontend Development" style selection ring - using blue ring if DOING
                task.phase === 'DOING' ? "ring-2 ring-blue-400 border-blue-400" : "border-slate-100"
            )}
        >
            {/* Top Status Badge */}
            <div className="p-4 pb-2">
                <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3", statusColor)}>
                    {statusLabel}
                </div>

                {/* Title */}
                {isEditing ? (
                    <textarea
                        autoFocus
                        className="w-full bg-transparent border-b border-blue-500 outline-none resize-none text-base font-bold text-slate-900 leading-tight min-h-[3rem]"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        onBlur={handleTitleSubmit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleTitleSubmit();
                            }
                        }}
                    />
                ) : (
                    <h3
                        className="text-base font-bold text-slate-900 leading-tight mb-1 cursor-text"
                        onDoubleClick={() => setIsEditing(true)}
                    >
                        {task.title}
                    </h3>
                )}

                {/* Type/Subtitle */}
                <p className="text-sm text-slate-500 font-medium mb-1">{task.type || 'Task'}</p>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {task.description || 'No description provided.'}
                </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-50 mx-4" />

            {/* Footer */}
            <div className="p-4 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Avatar */}
                    <div className="h-6 w-6 rounded-full bg-slate-200 border border-white shadow-sm flex items-center justify-center overflow-hidden">
                        {task.assignee?.avatar ? (
                            <img src={task.assignee.avatar} alt="User" />
                        ) : (
                            <User className="h-3.5 w-3.5 text-slate-500" />
                        )}
                    </div>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{task.dueDate || 'No Date'}</span>
                </div>
            </div>

            {/* Progress Bar (Only for DOING) */}
            {task.phase === 'DOING' && (
                <div className="mx-4 mb-4 relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                        style={{ width: `${task.progress || 50}%` }}
                    />
                </div>
            )}
            {task.phase === 'DOING' && (
                <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-600">
                    {task.progress || 50}%
                </div>
            )}


            {/* Context Menu (Hover) */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-32 p-1" align="end">
                        <div className="flex flex-col gap-1">
                            <Button variant="ghost" size="sm" className="h-8 justify-start gap-2 text-xs font-medium" onClick={() => setIsEditing(true)}>
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 justify-start gap-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteTask(task.id)}>
                                <Trash className="h-3.5 w-3.5" />
                                Delete
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Connection Handles (Left and Right) */}
            <div
                className={cn(
                    "absolute -right-3 top-[40%] w-6 h-6 rounded-full flex items-center justify-center cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity z-20",
                    isConnecting ? "opacity-0 !pointer-events-none" : ""
                )}
                onPointerDown={onConnectionHandlePointerDown}
            >
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-white shadow-sm" />
            </div>
            {/* We can act as a target anywhere on the body, handled by the canvas logic mainly, or we can add a left handle visual if needed. Expected: Drop on node to connect. */}

        </motion.div>
    );
};
