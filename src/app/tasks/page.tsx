import { TaskBoardView } from "@/components/features/tasks/TaskBoardView";
import { ClientOnly } from "@/components/common/ClientOnly";

export default function TasksPage() {
    return (
        <ClientOnly>
            <div className="p-6">
                <TaskBoardView />
            </div>
        </ClientOnly>
    );
}
