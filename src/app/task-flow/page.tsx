"use client"

import { TaskFlowCanvas } from "@/components/features/taskflow/TaskFlowCanvas"
import { ClientOnly } from "@/components/common/ClientOnly"

export default function TaskFlowPage() {
    return (
        <div className="h-full w-full bg-slate-50/50 flex flex-col">
            <ClientOnly>
                <TaskFlowCanvas />
            </ClientOnly>
        </div>
    )
}
