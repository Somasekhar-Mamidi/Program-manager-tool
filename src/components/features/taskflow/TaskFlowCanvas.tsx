"use client"

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useTaskFlowStore, TaskPhase } from '@/lib/store/taskflow-store';
import { TaskNode } from './TaskNode';
import { Plus, Save, Loader2, Check, ServerCrash } from 'lucide-react';
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import {
    ReactFlow,
    Background,
    Controls,
    Node,
    Edge,
    Connection,
    useNodesState,
    useEdgesState,
    NodeTypes,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodeTypes: NodeTypes = {
    customTask: TaskNode,
};

function TaskFlowCanvasContent() {
    const { tasks, dependencies, addTask, addDependency, updateTaskPosition, cloudSyncStatus, syncToCloud } = useTaskFlowStore();

    // Local state for React Flow dragging/selection
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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

    // Sync store to local state
    useEffect(() => {
        setNodes(tasks.map(task => ({
            id: task.id,
            type: 'customTask',
            position: { x: task.x, y: task.y },
            data: task as any
        })));
    }, [tasks, setNodes]);

    useEffect(() => {
        setEdges(dependencies.map((dep) => {
            const fromTask = tasks.find(t => t.id === dep.from);
            const color = fromTask?.phase === 'DOING' ? '#60a5fa' : fromTask?.phase === 'DONE' ? '#22c55e' : '#cbd5e1';

            return {
                id: `${dep.from}-${dep.to}`,
                source: dep.from,
                target: dep.to,
                type: 'smoothstep', // Gives a nice angled line
                style: { strokeWidth: 2, stroke: color },
                animated: fromTask?.phase === 'DOING'
            };
        }));
    }, [dependencies, tasks, setEdges]);

    const onConnect = useCallback((params: Connection) => {
        if (params.source && params.target) {
            addDependency(params.source, params.target);
        }
    }, [addDependency]);

    const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        updateTaskPosition(node.id, Math.round(node.position.x), Math.round(node.position.y));
    }, [updateTaskPosition]);

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <PageHeader items={[{ label: 'Workspace' }, { label: 'TaskFlow' }]}>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant={cloudSyncStatus === 'unsaved' ? 'default' : 'outline'}
                        onClick={() => syncToCloud()}
                        disabled={cloudSyncStatus === 'syncing' || cloudSyncStatus === 'idle' || cloudSyncStatus === 'success'}
                        className={`h-8 gap-2 mr-2 transition-all ${cloudSyncStatus === 'unsaved' ? 'bg-orange-500 hover:bg-orange-600 text-white border-none shadow-sm' : ''}`}
                    >
                        {cloudSyncStatus === 'syncing' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {cloudSyncStatus === 'success' && <Check className="h-3.5 w-3.5 text-green-600" />}
                        {cloudSyncStatus === 'error' && <ServerCrash className="h-3.5 w-3.5 text-red-500" />}
                        {(cloudSyncStatus === 'idle' || cloudSyncStatus === 'unsaved') && <Save className="h-3.5 w-3.5" />}

                        {cloudSyncStatus === 'syncing' ? 'Saving...' :
                            cloudSyncStatus === 'success' ? 'Saved' :
                                cloudSyncStatus === 'error' ? 'Retry Save' :
                                    cloudSyncStatus === 'unsaved' ? 'Save Changes' : 'Saved'}
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => {
                            addTask('New Task', 'TODO', window.innerWidth / 2 - 120, window.innerHeight / 2 - 100);
                        }}
                        className="h-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Node
                    </Button>
                </div>
            </PageHeader>

            <div className="flex-1 w-full relative tour-taskflow-board">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeDragStop={onNodeDragStop}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={3}
                    className="bg-[#f8fafc]"
                >
                    <Background color="#cbd5e1" gap={20} size={1} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}

export function TaskFlowCanvas() {
    return (
        <ReactFlowProvider>
            <TaskFlowCanvasContent />
        </ReactFlowProvider>
    );
}
