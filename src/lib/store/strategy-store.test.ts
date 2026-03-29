import { expect, test, describe, beforeEach } from "bun:test";
import { useStrategyStore, StrategyStep } from "./strategy-store";

describe("Strategy Store", () => {
    beforeEach(() => {
        // Clear state before each test
        useStrategyStore.setState({ steps: [], cloudSyncStatus: 'idle' }, false);
    });

    test("should add a step with an incrementally scaled order index", () => {
        const store = useStrategyStore.getState();
        store.addStep("Define Target Audience");
        store.addStep("Determine Marketing Channels");
        
        const steps = useStrategyStore.getState().steps;
        expect(steps.length).toBe(2);
        expect(steps[0].content).toBe("Define Target Audience");
        expect(steps[0].order).toBe(0);
        
        expect(steps[1].content).toBe("Determine Marketing Channels");
        expect(steps[1].order).toBe(1);
    });

    test("should cleanly recalculate indices when steps are reordered", () => {
        useStrategyStore.getState().addStep("Step A");
        useStrategyStore.getState().addStep("Step B");
        useStrategyStore.getState().addStep("Step C");

        const originalSteps = useStrategyStore.getState().steps;
        
        // Let's simulate dragging Step C to the very top (index 0)
        // Original visual order: [A, B, C]
        // New Array Passed from Drag & Drop Component: [C, A, B]
        const reorderedArray: StrategyStep[] = [
            originalSteps[2], 
            originalSteps[0], 
            originalSteps[1]
        ];

        // Act
        useStrategyStore.getState().reorderSteps(reorderedArray);

        // Assert
        const newSteps = useStrategyStore.getState().steps;

        expect(newSteps[0].content).toBe("Step C");
        expect(newSteps[0].order).toBe(0); // Should be recomputed by the store automatically

        expect(newSteps[1].content).toBe("Step A");
        expect(newSteps[1].order).toBe(1);

        expect(newSteps[2].content).toBe("Step B");
        expect(newSteps[2].order).toBe(2);
    });
});
