import { CalendarViewContainer } from "@/components/features/calendar/CalendarViewContainer";
import { ClientOnly } from "@/components/common/ClientOnly";

export default function CalendarPage() {
    return (
        <ClientOnly>
            <div className="h-[calc(100vh-8rem)]">
                <CalendarViewContainer />
            </div>
        </ClientOnly>
    );
}
