import { expect, test, describe, beforeEach } from "bun:test";
import { useTaskFlowStore } from "./taskflow-store";

describe("TaskFlow Store", () => {
    // Clear out the store before each test so they don't interfere with one another
    beforeEach(() => {
        useTaskFlowStore.getState().clearTasks();
    });

    test("should add a new task with default phase TODO", () => {
        // 1. Arrange: Get the store
        const store = useTaskFlowStore.getState();
        
        // 2. Act: Add a standard task
        store.addTask("Build AI Scribe Feature");

        // 3. Assert: Verify the task was created accurately
        const state = useTaskFlowStore.getState();
        expect(state.tasks.length).toBe(1);
        expect(state.tasks[0].title).toBe("Build AI Scribe Feature");
        expect(state.tasks[0].phase).toBe("TODO");
        expect(state.tasks[0].done).toBe(false);
    });

    test("should reject circular dependencies (Infinite Loops)", () => {
        const store = useTaskFlowStore.getState();
        
        // Create two tasks
        store.addTask("Task A");
        store.addTask("Task B");
        
        const tasks = useTaskFlowStore.getState().tasks;
        const taskA = tasks[0];
        const taskB = tasks[1];

        // 1. Make Task B dependent on Task A (A -> B)
        store.addDependency(taskA.id, taskB.id);
        
        // 2. Try to make Task A dependent on Task B (B -> A). 
        // This should be rejected by our cycle detection logic!
        store.addDependency(taskB.id, taskA.id);

        // 3. Assert: Verify only the first dependency was saved
        const deps = useTaskFlowStore.getState().dependencies;
        expect(deps.length).toBe(1);
        expect(deps[0].from).toBe(taskA.id);
        expect(deps[0].to).toBe(taskB.id);
    });
});
