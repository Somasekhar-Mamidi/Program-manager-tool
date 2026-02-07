"use client"

import React, { useRef, useState, useEffect } from 'react';
import { useTaskFlowStore, TaskPhase } from '@/lib/store/taskflow-store';
import { TaskNode } from './TaskNode';
import { DependencyArrow } from './DependencyArrow';
import { Plus, ZoomIn, ZoomOut, Maximize, MousePointer2, Grid } from 'lucide-react';
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"

export function TaskFlowCanvas() {
    const { tasks, dependencies, addTask, addDependency } = useTaskFlowStore();
    const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
    const [connecting, setConnecting] = useState<{ fromId: string; px: number; py: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Hydration check effectively
        if (tasks.length === 0) {
            // Mock Data to match image roughly
            addTask('Requirements Gathering', 'TODO', 100, 200, { type: 'Phase 1', description: 'Collect initial project requirements.', dueDate: 'Oct 25', assignee: { name: 'User', avatar: 'https://github.com/shadcn.png' } });
            addTask('Design Mockups', 'TODO', 450, 100, { type: 'UX/UI', description: 'Create high-fidelity wireframes.', dueDate: 'Oct 25', assignee: { name: 'User', avatar: 'https://github.com/shadcn.png' } });
            addTask('API Integration', 'DOING', 450, 350, { type: 'Development', description: 'Connect backend services.', dueDate: 'Oct 25', assignee: { name: 'User', avatar: 'https://github.com/shadcn.png' }, progress: 40 });
            addTask('Frontend Development', 'DOING', 800, 250, { type: 'Phase 2', description: 'Implement UI components and logic.', dueDate: 'Oct 30', assignee: { name: 'User', avatar: 'https://github.com/shadcn.png' }, progress: 60 });
        }
    }, [tasks.length, addTask]);

    // Handle Panning
    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent panning if clicking on a task node or other interactive elements
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
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
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
            setView(v => ({ ...v, zoom: newZoom }));
        } else {
            // Pan with wheel
            setView(v => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
        }
    };

    // Connection Logic
    const handleConnectStart = (taskId: string, startX: number, startY: number) => {
        setConnecting({ fromId: taskId, px: startX, py: startY });
    };

    const handleConnectEnd = (targetId: string) => {
        if (connecting && connecting.fromId !== targetId) {
            addDependency(connecting.fromId, targetId);
            setConnecting(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <PageHeader items={[{ label: 'Workspace' }, { label: 'TaskFlow' }]}>
                <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 border rounded-md p-0.5 bg-background shadow-sm mr-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setView(v => ({ ...v, zoom: v.zoom / 1.2 }))}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium w-10 text-center">{Math.round(view.zoom * 100)}%</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setView(v => ({ ...v, zoom: v.zoom * 1.2 }))}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setView({ x: 0, y: 0, zoom: 1 })}
                        >
                            <Maximize className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="h-4 w-px bg-slate-200 mx-1" />

                    <Button
                        size="sm"
                        onClick={() => {
                            const centerX = (-view.x + (typeof window !== 'undefined' ? window.innerWidth : 1000) / 2) / view.zoom;
                            const centerY = (-view.y + (typeof window !== 'undefined' ? window.innerHeight : 800) / 2) / view.zoom;
                            addTask('New Task', 'TODO', Math.max(50, centerX), Math.max(50, centerY));
                        }}
                        className="h-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Node
                    </Button>
                </div>
            </PageHeader>

            <div
                ref={containerRef}
                className="flex-1 w-full relative overflow-hidden cursor-grab active:cursor-grabbing font-sans bg-[#f8fafc]"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                style={{
                    // Dotted grid background
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
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
                    {/* Existing Dependencies */}
                    {dependencies.map((dep) => {
                        const fromTask = tasks.find(t => t.id === dep.from);
                        const toTask = tasks.find(t => t.id === dep.to);
                        if (!fromTask || !toTask) return null;

                        // Start from right of fromTask, End at left of toTask
                        const start = { x: fromTask.x + 240, y: fromTask.y + 100 }; // 240 width, 100 approx half height
                        const end = { x: toTask.x, y: toTask.y + 100 };

                        return (
                            <DependencyArrow
                                key={`${dep.from}-${dep.to}`}
                                start={start}
                                end={end}
                                status={fromTask.done ? 'satisfied' : 'pending'}
                                color={fromTask.phase === 'DOING' ? '#60a5fa' : fromTask.phase === 'DONE' ? '#22c55e' : '#cbd5e1'}
                            />
                        );
                    })}

                    {/* Temporary Connection Line */}
                    {connecting && (() => {
                        const fromTask = tasks.find(t => t.id === connecting.fromId);
                        if (!fromTask) return null;
                        const start = { x: fromTask.x + 240, y: fromTask.y + 100 };
                        return (
                            <DependencyArrow
                                start={start}
                                end={{ x: connecting.px, y: connecting.py }}
                                status="pending"
                                color="#60a5fa"
                            />
                        );
                    })()}

                    {/* Tasks */}
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onMouseUp={(e) => {
                                // No column switching logic anymore - free positioning
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
            </div>
        </div>
    );
}
