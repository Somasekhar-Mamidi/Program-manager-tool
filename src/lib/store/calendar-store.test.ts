import { expect, test, describe, beforeEach } from "bun:test";
import { useCalendarStore } from "./calendar-store";
import { IntentBlock } from "@/types";

describe("Calendar Store Core Logic", () => {
    beforeEach(() => {
        // Clear all arrays to ensure clean test environment and destroy initial mock data
         useCalendarStore.setState({
             intents: [],
             goals: [],
             charters: [],
             cloudSyncStatus: 'idle'
         }, false); 
    });

    test("should add an Intent, applying ID and the correct order index", () => {
        // Arrange
        useCalendarStore.getState().addIntent({
             objective: "Q4 Roadmap Review",
             date: "2024-10-28",
             startTime: "09:30",
             endTime: "11:00",
             calendarCategory: "work",
             priority: "High",
             type: "work",
             outputDefinition: "Roadmap Deck",
             estimatedEffort: "medium"
        });

        // Act
        const state = useCalendarStore.getState();

        // Assert
        expect(state.intents.length).toBe(1);
        expect(state.intents[0].objective).toBe("Q4 Roadmap Review");
        expect(state.intents[0].order).toBe(1); // Standard starts at maxOrder + 1
        expect(state.intents[0].status).toBe("planned");
    });

    test("should perfectly remap the order attribute when reordering Intents", () => {
        // Add two mocked items
        const id1 = "cal-item-1";
        const id2 = "cal-item-2";
        
        useCalendarStore.setState({ 
            intents: [
                 { id: id1, order: 1 } as IntentBlock,
                 { id: id2, order: 2 } as IntentBlock
            ] 
        });

        // Flip their index order explicitly (drag and drop sim)
        useCalendarStore.getState().reorderIntents([id2, id1]);

        const modifiedIntents = useCalendarStore.getState().intents;
        const mappedIntent1 = modifiedIntents.find((i) => i.id === id1);
        const mappedIntent2 = modifiedIntents.find((i) => i.id === id2);

        // The array orderMap maps to 0 and 1! So id2=0, id1=1
        expect(mappedIntent1?.order).toBe(1);
        expect(mappedIntent2?.order).toBe(0);
    });

    test("toggleGoalDate: should safely add and remove timestamps without breaking arrays", () => {
        useCalendarStore.getState().addGoal({
             title: "Read 10 pages",
             targetDays: 30
        });

        const goalId = useCalendarStore.getState().goals[0].id;
        
        // Add a date
        useCalendarStore.getState().toggleGoalDate(goalId, "2024-11-01");
        expect(useCalendarStore.getState().goals[0].completedDates).toContain("2024-11-01");

        // Add another date
        useCalendarStore.getState().toggleGoalDate(goalId, "2024-11-05");
        expect(useCalendarStore.getState().goals[0].completedDates.length).toBe(2);

        // Toggle the very first date OFF
        useCalendarStore.getState().toggleGoalDate(goalId, "2024-11-01");
        expect(useCalendarStore.getState().goals[0].completedDates).not.toContain("2024-11-01");
        expect(useCalendarStore.getState().goals[0].completedDates.length).toBe(1);
    });

    test("Sync State Machine: ensure manual cloud sync override behaves safely", () => {
        const store = useCalendarStore.getState();
        // Since `beforeEach` triggers Zustand `persist`, it will automatically mark as unsaved!
        expect(store.cloudSyncStatus).toBe("unsaved");

        // Manually override
        store.setCloudSyncStatus("syncing");
        expect(useCalendarStore.getState().cloudSyncStatus).toBe("syncing");
    });
});
