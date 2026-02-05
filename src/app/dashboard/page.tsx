import { DashboardView } from "@/components/features/dashboard/DashboardView";
import { ClientOnly } from "@/components/common/ClientOnly";

export default function DashboardPage() {
    return (
        <ClientOnly>
            <DashboardView />
        </ClientOnly>
    );
}
