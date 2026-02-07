import { CalendarViewContainer } from "@/components/features/calendar/CalendarViewContainer";
import { ClientOnly } from "@/components/common/ClientOnly";

export default function CalendarPage() {
    return (
        <ClientOnly>
            <div className="h-full flex flex-col">
                <CalendarViewContainer />
            </div>
        </ClientOnly>
    );
}
