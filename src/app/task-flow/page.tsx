"use client"

import { TaskFlowCanvas } from "@/components/features/taskflow/TaskFlowCanvas"
import { ClientOnly } from "@/components/common/ClientOnly"

export default function TaskFlowPage() {
    return (
        <div className="h-[calc(100vh-8rem)] w-full bg-background border rounded-xl overflow-hidden shadow-sm">
            <ClientOnly>
                <TaskFlowCanvas />
            </ClientOnly>
        </div>
    )
}
