import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Task, useTaskFlowStore } from '@/lib/store/taskflow-store';
import { cn } from '@/lib/utils';
import { GripVertical, AlertCircle, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TaskNodeProps {
    task: Task;
    onConnectStart: (taskId: string, startX: number, startY: number) => void;
    onConnectEnd: (taskId: string) => void;
    isConnecting: boolean;
}

export const TaskNode: React.FC<TaskNodeProps> = ({
    task,
    onConnectStart,
    onConnectEnd,
    isConnecting
}) => {
    const { updateTaskPosition, toggleTaskDone, isTaskBlocked, getBlockers, updateTaskTitle } = useTaskFlowStore();
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localTitle, setLocalTitle] = useState(task.title);
    const nodeRef = useRef<HTMLDivElement>(null);

    const blocked = isTaskBlocked(task.id);
    const blockers = getBlockers(task.id);

    // Update local title if task updates from outside
    useEffect(() => {
        setLocalTitle(task.title);
    }, [task.title]);

    const handleDragEnd = (_: any, info: any) => {
        // Round to nearest pixel to avoid sub-pixel blurring
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
        e.stopPropagation(); // Prevent drag of the card
        e.preventDefault(); // Prevent text selection/native drag
        if (nodeRef.current) {
            const rect = nodeRef.current.getBoundingClientRect();
            // Calculate center of the right edge relative to the canvas? 
            // Actually, the parent handles the coordinate space.
            // We pass the starting client coordinates or similar, 
            // but the Canvas needs to convert them.
            // Let's pass the NODE's current center-right coordinate.
            // But wait, the Store stores X/Y. 
            // The visual element might have moved via transform if dragging?
            // No, we only allow connection when not dragging the node.

            // Let's pass the event to let parent handle coords
            onConnectStart(task.id, task.x + 200, task.y + 40); // 200 width, 40 approx half height
        }
    };

    // Border colors
    const getBorderColor = () => {
        if (task.done) return 'border-green-500 bg-green-50 shadow-green-100';
        if (blocked) return 'border-red-300 bg-red-50 opacity-90'; // Blocked
        if (task.phase === 'DOING') return 'border-blue-500 bg-blue-50 shadow-blue-100';
        return 'border-gray-200 bg-white hover:border-gray-300';
    };

    return (
        <motion.div
            ref={nodeRef}
            drag
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            initial={{ x: task.x, y: task.y }}
            // We use initial + ref updating for position to avoid re-renders on every frame driving the store
            // But if the store updates (e.g. alignment), we need to reflect it. 
            // motion uses style x/y transforms.
            animate={{ x: task.x, y: task.y }}
            transition={{ duration: 0 }} // Instant update when state changes
            onPointerDown={(e) => {
                // Prevent canvas panning when interacting with node
                e.preventDefault();
                e.stopPropagation();
            }}
            className={cn(
                "task-node-interactive absolute w-[200px] rounded-lg border-2 shadow-sm p-3 select-none flex flex-col gap-2 group cursor-grab active:cursor-grabbing z-10",
                getBorderColor(),
                isConnecting ? "z-0" : "z-10"
            )}
        >
            {/* Header / grip */}
            <div className="flex items-start justify-between gap-2">
                {/* Checkbox / Status */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Add shake here if blocked?
                        toggleTaskDone(task.id);
                    }}
                    className={cn(
                        "mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        task.done ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-gray-400",
                        blocked && !task.done ? "cursor-not-allowed opacity-50 bg-gray-100" : ""
                    )}
                    title={blocked ? "Blocked by dependencies" : "Mark as done"}
                >
                    {task.done && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* Title */}
                {isEditing ? (
                    <textarea
                        autoFocus
                        className="flex-1 bg-transparent border-none outline-none resize-none text-sm font-medium leading-tight h-full"
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
                    <div
                        className="flex-1 text-sm font-medium leading-tight break-words cursor-text min-h-[1.25em]"
                        onClick={() => setIsEditing(true)}
                    >
                        {task.title}
                        {blocked && !task.done && (
                            <div className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-normal">
                                <AlertCircle className="w-3 h-3" />
                                Blocked
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Blocked Popover */}
            {blocked && !task.done && (
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-3 text-xs">
                        <p className="font-semibold mb-2">Blocked by:</p>
                        <ul className="space-y-1">
                            {blockers.map(b => (
                                <li key={b.id} className="flex items-center gap-2">
                                    <span className={cn("w-2 h-2 rounded-full", b.done ? "bg-green-500" : "bg-gray-300")} />
                                    <span className={b.done ? "line-through text-gray-400" : "text-gray-700"}>{b.title}</span>
                                </li>
                            ))}
                        </ul>
                    </PopoverContent>
                </Popover>
            )}

            {/* Connection Handle (Dot) */}
            {/* Visible on hover or always? User said "Hover task -> small dot" */}
            <div
                className={cn(
                    "absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-300 border-2 border-white shadow-sm cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500 hover:scale-110",
                    isConnecting ? "opacity-0 !pointer-events-none" : ""
                )}
                onPointerDown={onConnectionHandlePointerDown}
            />
        </motion.div>
    );
};
