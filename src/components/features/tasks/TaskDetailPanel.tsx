"use client"

import React, { useState } from "react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { IntentBlock, MicroStep, ActivityLog } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    X,
    Flag,
    CheckCircle2,
    Circle,
    Trash2,

} from "lucide-react"

interface TaskDetailPanelProps {
    taskId: string
    onClose: () => void
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
    const { intents, toggleMicroStep, deleteIntent } = useCalendarStore()
    const task = intents.find(t => t.id === taskId)

    if (!task) return null

    const completedSteps = task.microSteps.reduce((acc, step) => acc + (step.isCompleted ? 1 : 0), 0)
    const progress = task.microSteps.length > 0 ? (completedSteps / task.microSteps.length) * 100 : 0

    return (
        <div className="w-[400px] h-full border-l bg-white flex flex-col shadow-xl z-20">
            {/* Header */}
            <div className="p-5 border-b flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                        {task.objective}
                    </h2>
                    <div className="flex items-center gap-1 -mt-1 -mr-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                                if (confirm("Are you sure you want to delete this task?")) {
                                    deleteIntent(task.id);
                                    onClose();
                                }
                            }}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <div className={`
                        flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                        ${task.status === 'in-progress' ? 'bg-blue-50 text-blue-600' : ''}
                        ${task.status === 'completed' ? 'bg-green-50 text-green-600' : ''}
                        ${task.status === 'planned' ? 'bg-slate-100 text-slate-600' : ''}
                    `}>
                        {task.status === 'in-progress' && <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                        {task.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                        {task.status === 'planned' && <Circle className="h-3 w-3" />}
                        <span>{task.status === 'in-progress' ? 'In Progress' : task.status === 'completed' ? 'Done' : 'Not Started'}</span>
                    </div>

                    {/* Priority Badge */}
                    {task.priority && (
                        <div className={`
                            flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                             ${task.priority === 'High' ? 'bg-red-50 text-red-600' : ''}
                             ${task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : ''}
                             ${task.priority === 'Low' ? 'bg-blue-50 text-blue-600' : ''}
                        `}>
                            <Flag className="h-3 w-3 fill-current" />
                            <span>{task.priority}</span>
                        </div>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                    {/* Description */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900 text-sm">Description</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {task.outputDefinition || "No description provided."}
                            In a real implementation, this would be a richer description field.
                            Coordinate with the team to ensure all objectives are met efficiently.
                        </p>
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900 text-sm">Subtasks</h3>
                            <span className="text-xs font-medium text-slate-500">{completedSteps}/{task.microSteps.length}</span>
                        </div>

                        {task.microSteps.length > 0 && (
                            <Progress value={progress} className="h-1.5" />
                        )}

                        <div className="space-y-3 pt-2">
                            {task.microSteps.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No subtasks defined.</p>
                            ) : (
                                task.microSteps.map(step => (
                                    <div key={step.id} className="flex items-start gap-3">
                                        <Checkbox
                                            id={step.id}
                                            checked={step.isCompleted}
                                            onCheckedChange={() => toggleMicroStep(task.id, step.id)}
                                            className="mt-0.5"
                                        />
                                        <label
                                            htmlFor={step.id}
                                            className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${step.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                                        >
                                            {step.title}
                                            {step.isCompleted && <span className="ml-2 text-green-600 text-[10px] font-medium">(Done)</span>}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Activity */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900 text-sm">Activity</h3>
                        <div className="space-y-6 pl-2 border-l-2 border-slate-100 ml-2">
                            {task.activityLog?.map((log, index) => (
                                <div key={log.id || index} className="relative flex flex-col gap-1 pb-1">
                                    <div className="absolute -left-[13px] top-0 rounded-full border-2 border-white">
                                        <Avatar className="h-5 w-5 border border-slate-200">
                                            <AvatarImage src={log.actorAvatar} />
                                            <AvatarFallback className="text-[8px] bg-slate-100 text-slate-600">{log.actorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="text-xs text-slate-900 ml-4">
                                        <span className="font-semibold">{log.actorName}</span>{' '}
                                        <span className="text-slate-600">{log.action}</span>
                                        {log.details && (
                                            <div className="mt-1 p-2 bg-slate-50 rounded border border-slate-100 text-slate-600 italic">
                                                {log.details}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 ml-4">
                                        {/* Simple relative time logic needed or full date-fns */}
                                        Today at {new Date(log.timestamp).getHours()}:{new Date(log.timestamp).getMinutes().toString().padStart(2, '0')}
                                    </div>
                                </div>
                            ))}
                            {!task.activityLog && (
                                <p className="text-xs text-slate-400 italic ml-4">No activity recorded.</p>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
