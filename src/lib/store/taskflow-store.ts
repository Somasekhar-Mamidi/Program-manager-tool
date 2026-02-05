import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';

export type TaskPhase = 'TODO' | 'DOING' | 'DONE';

export interface Task {
    id: string;
    title: string;
    phase: TaskPhase;
    x: number;
    y: number;
    done: boolean;
}

export interface Dependency {
    from: string;
    to: string;
}

interface TaskFlowState {
    tasks: Task[];
    dependencies: Dependency[];

    // Actions
    addTask: (title: string, phase?: TaskPhase, x?: number, y?: number) => void;
    updateTaskPosition: (id: string, x: number, y: number) => void;
    updateTaskPhase: (id: string, phase: TaskPhase) => void;
    updateTaskTitle: (id: string, title: string) => void;
    toggleTaskDone: (id: string) => void;
    deleteTask: (id: string) => void;

    addDependency: (from: string, to: string) => void;
    removeDependency: (from: string, to: string) => void;
    clearTasks: () => void;

    // Selectors/Helpers
    getTask: (id: string) => Task | undefined;
    getIncomingDependencies: (taskId: string) => string[]; // returns task IDs
    isTaskBlocked: (taskId: string) => boolean;
    getBlockers: (taskId: string) => Task[];
}

export const useTaskFlowStore = create<TaskFlowState>()(
    persist(
        (set, get) => ({
            tasks: [],
            dependencies: [],

            addTask: (title, phase = 'TODO', x = 100, y = 100) => {
                set((state) => ({
                    tasks: [
                        ...state.tasks,
                        {
                            id: uuidv4(),
                            title,
                            phase,
                            x,
                            y,
                            done: false,
                        },
                    ],
                }));
            },

            updateTaskPosition: (id, x, y) => {
                let newPhase: TaskPhase = 'TODO';
                if (x >= 800) newPhase = 'DONE';
                else if (x >= 400) newPhase = 'DOING';
                else newPhase = 'TODO';

                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, x, y, phase: newPhase } : task
                    ),
                }));
            },

            updateTaskPhase: (id, phase) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, phase } : task
                    ),
                }));
            },

            updateTaskTitle: (id, title) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, title } : task
                    ),
                }));
            },

            toggleTaskDone: (id) => {
                const { isTaskBlocked, tasks, updateTaskPhase } = get();
                const task = tasks.find((t) => t.id === id);
                if (!task) return;

                // If trying to mark done but blocked, do nothing (UI should handle feedback)
                if (!task.done && isTaskBlocked(id)) {
                    // Ideally should throw or return false, but for now we just prevent state change
                    // The UI should check isTaskBlocked before calling this or show feedback if it fails
                    return;
                }

                const newDone = !task.done;
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, done: newDone } : t
                    ),
                }));

                // Auto move to DONE phase if marked done
                if (newDone && task.phase !== 'DONE') {
                    get().updateTaskPhase(id, 'DONE');
                }
                // Auto move to TODO if unchecked? Optional, maybe keep in current phase?
                // Let's keep it simple: manual phase movement usually, but done check forces DONE.
            },

            deleteTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                    dependencies: state.dependencies.filter(
                        (d) => d.from !== id && d.to !== id
                    ),
                }));
            },

            addDependency: (from, to) => {
                if (from === to) return; // No self-loops

                const { dependencies } = get();
                // Check for existence
                if (dependencies.some((d) => d.from === from && d.to === to)) return;

                // Check for cycles
                // DFS to check if adding this edge creates a cycle
                const hasPath = (start: string, end: string, visited = new Set<string>()): boolean => {
                    if (start === end) return true;
                    if (visited.has(start)) return false;
                    visited.add(start);

                    const outgoing = dependencies.filter(d => d.from === start);
                    for (const edge of outgoing) {
                        if (hasPath(edge.to, end, visited)) return true;
                    }
                    return false;
                };

                if (hasPath(to, from)) {
                    // Adding from->to would create a cycle because to->...->from exists
                    console.warn('Cycle detected, dependency rejected');
                    return;
                }

                set((state) => ({
                    dependencies: [...state.dependencies, { from, to }],
                }));
            },

            removeDependency: (from, to) => {
                set((state) => ({
                    dependencies: state.dependencies.filter(
                        (d) => !(d.from === from && d.to === to)
                    ),
                }));
            },

            clearTasks: () => {
                set({ tasks: [], dependencies: [] });
            },

            getTask: (id) => get().tasks.find((t) => t.id === id),

            getIncomingDependencies: (taskId) => {
                return get()
                    .dependencies.filter((d) => d.to === taskId)
                    .map((d) => d.from);
            },

            getBlockers: (taskId) => {
                const { tasks, dependencies } = get();
                const blockerIds = dependencies
                    .filter(d => d.to === taskId)
                    .map(d => d.from);

                return tasks.filter(t => blockerIds.includes(t.id) && !t.done);
            },

            isTaskBlocked: (taskId) => {
                const blockers = get().getBlockers(taskId);
                return blockers.length > 0;
            },
        }),
        {
            name: 'taskflow-storage',
        }
    )
);
