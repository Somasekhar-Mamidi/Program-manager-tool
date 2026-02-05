import React, { useRef, useState, useEffect } from 'react';
import { useTaskFlowStore, TaskPhase } from '@/lib/store/taskflow-store';
import { TaskNode } from './TaskNode';
import { DependencyArrow } from './DependencyArrow';
import { Plus, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const COLUMN_WIDTH = 400;
const PHASES: TaskPhase[] = ['TODO', 'DOING', 'DONE'];

export function TaskFlowCanvas() {
    const { tasks, dependencies, addTask, addDependency, updateTaskPhase, updateTaskPosition } = useTaskFlowStore();
    const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
    const [connecting, setConnecting] = useState<{ fromId: string; px: number; py: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Hydration check effectively
        if (tasks.length === 0) {
            addTask('Design Data Model', 'TODO', 100, 100);
            addTask('Implement Store', 'DOING', 500, 100);
            addTask('Build Canvas UI', 'DONE', 900, 100);
        }
    }, []);

    // Handle Panning
    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent panning if clicking on a task node or other interactive elements
        // This is a backup to stopPropagation, which sometimes fails with complex nesting
        if ((e.target as HTMLElement).closest('.task-node-interactive')) {
            return;
        }

        if (e.button === 0) { // Left click
            isPanning.current = true;
            panStart.current = { x: e.clientX - view.x, y: e.clientY - view.y };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning.current) {
            setView(v => ({
                ...v,
                x: e.clientX - panStart.current.x,
                y: e.clientY - panStart.current.y
            }));
        }

        if (connecting) {
            // Update temporary line endpoint
            // Use client coords relative to canvas transform?
            // Canvas transform origin is 0,0
            // We need local coordinates for the arrow drawing
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                // Current mouse pos relative to screen
                // Transform back to canvas space:
                // localX = (clientX - rect.left - view.x) / view.zoom
                const localX = (e.clientX - rect.left - view.x) / view.zoom;
                const localY = (e.clientY - rect.top - view.y) / view.zoom;

                setConnecting(prev => prev ? { ...prev, px: localX, py: localY } : null);
            }
        }
    };

    const handleMouseUp = () => {
        isPanning.current = false;
        if (connecting) {
            setConnecting(null); // Cancel connection if dropped on nothing
        }
    };

    // Wheel Zoom
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const s = Math.exp(-e.deltaY * 0.001); // Smooth zoom
            const newZoom = Math.min(Math.max(view.zoom * s, 0.1), 3);

            // Zoom towards mouse? For now center or simple scale is fine
            // Keeping it simple: Top-left zoom or center?
            // Let's just scale around 0,0 for MVP simplicity, user can pan back
            setView(v => ({ ...v, zoom: newZoom }));
        } else {
            // Pan with wheel
            setView(v => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
        }
    };

    // Connection Logic
    const handleConnectStart = (taskId: string, startX: number, startY: number) => {
        // StartX/Y are passed from Node (Local coords relative to Canvas 0,0)
        setConnecting({ fromId: taskId, px: startX, py: startY });
    };

    const handleConnectEnd = (targetId: string) => {
        if (connecting && connecting.fromId !== targetId) {
            addDependency(connecting.fromId, targetId);
            setConnecting(null);
        }
    };

    // Phase Logic on Move
    // We monitor tasks and update phase if they cross boundaries?
    // Best done when dragging ends on the Node itself, but the Node is generic.
    // We can pass a callback wrapper to Node?
    // But wait, TaskNode calls updateTaskPosition in store.
    // We can use a useEffect here to reconcile active tasks?
    // Or better: Let TaskNode accept an `onDragEnd` prop that we wrap.

    // Actually, let's just create a wrapper for adding tasks and rendering

    // Coordinate helpers
    const screenToCanvas = (sx: number, sy: number) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: (sx - rect.left - view.x) / view.zoom,
            y: (sy - rect.top - view.y) / view.zoom
        };
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-[#f4f5f7] relative overflow-hidden cursor-grab active:cursor-grabbing font-sans"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* Transform Layer */}
            <div
                style={{
                    transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
                    transformOrigin: '0 0',
                    width: '100%',
                    height: '100%'
                }}
                className="w-full h-full relative"
            >
                {/* Phase Columns (Background) */}
                <div className="absolute top-0 left-0 h-[5000px] flex pointer-events-none opacity-50">
                    {PHASES.map((phase, i) => (
                        <div
                            key={phase}
                            className="border-r border-dashed border-gray-300"
                            style={{ width: COLUMN_WIDTH, height: '100%' }}
                        >
                            <div className="sticky top-0 p-4 font-bold text-gray-400 uppercase tracking-widest text-sm">
                                {phase}
                            </div>
                        </div>
                    ))}
                    {/* DONE column is infinite? Or just wide. */}
                </div>

                {/* Existing Dependencies */}
                {dependencies.map((dep) => {
                    const fromTask = tasks.find(t => t.id === dep.from);
                    const toTask = tasks.find(t => t.id === dep.to);
                    if (!fromTask || !toTask) return null;

                    // Simple anchor points: Right of From -> Left of To
                    const start = { x: fromTask.x + 200, y: fromTask.y + 40 }; // 200 is width
                    const end = { x: toTask.x, y: toTask.y + 40 };

                    // If To is "behind" From, curve around?
                    // DependencyArrow handles curvature logic roughly?

                    return (
                        <DependencyArrow
                            key={`${dep.from}-${dep.to}`}
                            start={start}
                            end={end}
                            status={fromTask.done ? 'satisfied' : 'pending'}
                        />
                    );
                })}

                {/* Temporary Connection Line */}
                {connecting && (() => {
                    const fromTask = tasks.find(t => t.id === connecting.fromId);
                    if (!fromTask) return null;
                    const start = { x: fromTask.x + 200, y: fromTask.y + 40 };
                    return (
                        <DependencyArrow
                            start={start}
                            end={{ x: connecting.px, y: connecting.py }}
                            status="pending"
                        />
                    );
                })()}

                {/* Tasks */}
                {tasks.map(task => (
                    // Wrapper to handle phase update on drop
                    <div
                        key={task.id}
                        onMouseUp={(e) => {
                            // Check if we dropped something here (handled by TaskNode internal logic mostly)
                            // But we want to update Phase based on X location after drag
                            // TaskNode's onDragEnd updates store position.
                            // We can react to store changes? But that's retroactive.
                            // Let's just trust the user to place it, and we update phase on next render or via a side effect?
                            // No, let's inject logic into TaskNode via store or prop.
                            // I'll update the store right here:

                            // Actually, I can't easily hook into the TaskNode's internal drag end from here without modifying TaskNode props.
                            // Let's check the tasks array for phase discrepancies?
                            const colIndex = Math.floor((task.x + 100) / COLUMN_WIDTH); // +100 for center
                            const newPhase = PHASES[Math.max(0, Math.min(2, colIndex))];
                            if (newPhase && newPhase !== task.phase) {
                                updateTaskPhase(task.id, newPhase);
                            }
                        }}
                    >
                        <TaskNode
                            task={task}
                            onConnectStart={handleConnectStart}
                            onConnectEnd={handleConnectEnd}
                            isConnecting={!!connecting}
                        />
                    </div>
                ))}
            </div>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full h-14 bg-white border-b flex items-center justify-between px-4 z-50">
                <div className="font-semibold text-lg text-gray-800">My Project</div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            const centerX = (-view.x + window.innerWidth / 2) / view.zoom;
                            const centerY = (-view.y + window.innerHeight / 2) / view.zoom;
                            addTask('New Task', 'TODO', Math.max(50, centerX), Math.max(50, centerY));
                        }}
                        className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-md hover:bg-gray-800 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Task
                    </button>

                    <div className="flex items-center gap-1 border-l pl-4">
                        <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setView(v => ({ ...v, zoom: v.zoom * 1.2 }))}>
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-500 w-12 text-center">{Math.round(view.zoom * 100)}%</span>
                        <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setView(v => ({ ...v, zoom: v.zoom / 1.2 }))}>
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setView({ x: 0, y: 0, zoom: 1 })}>
                            <Maximize className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
