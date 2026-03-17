import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type TaskPhase = 'TODO' | 'DOING' | 'DONE';

export interface Task {
    id: string;
    title: string;
    description?: string;
    type?: string; // e.g. "Milestone", "Phase 1"
    assignee?: { name: string; avatar?: string };
    dueDate?: string;
    progress?: number; // 0-100
    phase: TaskPhase;
    x: number;
    y: number;
    done: boolean;
}

export interface Dependency {
    from: string;
    to: string;
}

export interface TaskFlowState {
    tasks: Task[];
    dependencies: Dependency[];
    cloudSyncStatus: 'idle' | 'syncing' | 'error' | 'success' | 'unsaved';

    // Actions
    syncToCloud: () => Promise<void>;
    addTask: (title: string, phase?: TaskPhase, x?: number, y?: number, data?: Partial<Task>) => void;
    updateTaskPosition: (id: string, x: number, y: number) => void;
    updateTask: (id: string, updates: Partial<Task>) => void; // Generic update
    updateTaskPhase: (id: string, phase: TaskPhase) => void;
    updateTaskTitle: (id: string, title: string) => void;
    toggleTaskDone: (id: string) => void;
    deleteTask: (id: string) => void;

    addDependency: (from: string, to: string) => void;
    removeDependency: (from: string, to: string) => void;
    clearTasks: () => void;
    setCloudSyncStatus: (status: 'idle' | 'syncing' | 'error' | 'success' | 'unsaved') => void;

    // Selectors/Helpers
    getTask: (id: string) => Task | undefined;
    getIncomingDependencies: (taskId: string) => string[]; // returns task IDs
    isTaskBlocked: (taskId: string) => boolean;
    getBlockers: (taskId: string) => Task[];
}

// Store functionality starts here


export const useTaskFlowStore = create<TaskFlowState>()(
    persist(
        (set, get) => ({
            tasks: [],
            dependencies: [],
            cloudSyncStatus: 'idle',

            setCloudSyncStatus: (status) => set({ cloudSyncStatus: status }),

            syncToCloud: async () => {
                const state = get();
                if (state.cloudSyncStatus === 'syncing') return;

                set({ cloudSyncStatus: 'syncing' });
                try {
                    // Replicate Zustand persist wrapper structure
                    const payload = {
                        state: {
                            tasks: state.tasks,
                            dependencies: state.dependencies
                        },
                        version: 0
                    };

                    await supabase
                        .from('app_storage')
                        .upsert({ key: 'taskflow-storage', value: payload }, { onConflict: 'key' });

                    set({ cloudSyncStatus: 'success' });

                    setTimeout(() => {
                        // Revert checkmark to idle after 3 seconds
                        if (get().cloudSyncStatus === 'success') {
                            set({ cloudSyncStatus: 'idle' });
                        }
                    }, 3000);
                } catch (e) {
                    console.error("Manual cloud sync failed", e);
                    set({ cloudSyncStatus: 'error' });
                }
            },

            addTask: (title, phase = 'TODO', x = 100, y = 100, data = {}) => {
                set((state) => ({
                    tasks: [
                        ...state.tasks,
                        {
                            id: uuidv4(),
                            title,
                            phase,
                            x,
                            y,
                            done: phase === 'DONE',
                            progress: phase === 'DONE' ? 100 : 0,
                            description: 'No description added.',
                            type: 'Task',
                            assignee: { name: 'User' }, // Default assignee
                            ...data
                        },
                    ],
                }));
            },

            updateTaskPosition: (id, x, y) => {
                // Clamp coordinates to prevent infinite canvas issues
                const clampedX = Math.max(-10000, Math.min(10000, x));
                const clampedY = Math.max(-10000, Math.min(10000, y));

                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, x: clampedX, y: clampedY } : task
                    ),
                }));
            },

            updateTask: (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, ...updates } : task
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
            partialize: (state) => ({
                tasks: state.tasks,
                dependencies: state.dependencies
            }),
            storage: {
                getItem: async (name) => {
                    // 1. ALWAYS check Local Storage first
                    if (typeof window !== 'undefined') {
                        const local = localStorage.getItem(name);
                        if (local) {
                            try {
                                const parsed = JSON.parse(local);
                                if (parsed && parsed.state) {
                                    return parsed; // Return OBJECT
                                }
                            } catch (e) {
                                console.warn("Local storage parse failed", e);
                            }
                        }
                    }

                    // 2. If Local is empty, try Cloud
                    try {
                        const { data } = await supabase
                            .from('app_storage')
                            .select('value')
                            .eq('key', name)
                            .single();

                        if (data?.value) {
                            // Cloud likely returns valid JSON object if configured correctly
                            const value = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;

                            if (typeof window !== 'undefined') {
                                localStorage.setItem(name, JSON.stringify(value));
                            }
                            return value; // Return OBJECT
                        }
                    } catch (e) {
                        console.error("Cloud fetch failed", e);
                    }
                    return null;
                },
                setItem: async (name, value) => {
                    // 1. Save to LocalStorage IMMEDIATELY (no data loss risk)
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(name, JSON.stringify(value));
                    }

                    // 2. ONLY notify the UI that unsaved changes exist that haven't hit the cloud
                    // IMPORTANT: We must NOT call this if the status is already 'unsaved' or we are currently syncing,
                    // otherwise Zustand's persist middleware will detect the state change and call `setItem` again,
                    // causing an infinite loop (Maximum call stack size exceeded).
                    const currentStatus = useTaskFlowStore.getState().cloudSyncStatus;
                    if (currentStatus === 'idle' || currentStatus === 'success') {
                        useTaskFlowStore.getState().setCloudSyncStatus('unsaved');
                    }
                },
                removeItem: async () => { },
            },
        }
    )
);
