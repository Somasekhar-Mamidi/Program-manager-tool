import { TaskDetailView } from "@/components/features/tasks/TaskDetailView"
import { ClientOnly } from "@/components/common/ClientOnly"

export default async function TaskDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return (
        <ClientOnly>
            <TaskDetailView taskId={id} />
        </ClientOnly>
    )
}
