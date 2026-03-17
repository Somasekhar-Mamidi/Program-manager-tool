import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../supabase'

// No auto-sync. Cloud sync is manual-only to prevent egress overuse.

export interface StrategyStep {
    id: string;
    content: string;
    notes?: string;
    order: number;
}

export interface StrategyBoardState {
    steps: StrategyStep[];
    cloudSyncStatus: 'idle' | 'syncing' | 'error' | 'success' | 'unsaved';
    setCloudSyncStatus: (status: 'idle' | 'syncing' | 'error' | 'success' | 'unsaved') => void;
    syncToCloud: () => Promise<void>;
    addStep: (content: string) => void;
    updateStep: (id: string, updates: Partial<StrategyStep>) => void;
    deleteStep: (id: string) => void;
    reorderSteps: (newOrder: StrategyStep[]) => void;
    clearBoard: () => void;
}

export const useStrategyStore = create<StrategyBoardState>()(
    persist(
        (set, get) => ({
            steps: [],
            cloudSyncStatus: 'idle',
            setCloudSyncStatus: (status) => set({ cloudSyncStatus: status }),

            syncToCloud: async () => {
                const state = get();
                if (state.cloudSyncStatus === 'syncing') return;

                set({ cloudSyncStatus: 'syncing' });
                try {
                    const payload = {
                        state: { steps: state.steps },
                        version: 0
                    };

                    await supabase
                        .from('app_storage')
                        .upsert({ key: 'strategy-storage', value: payload }, { onConflict: 'key' });

                    set({ cloudSyncStatus: 'success' });
                    setTimeout(() => {
                        if (useStrategyStore.getState().cloudSyncStatus === 'success') {
                            set({ cloudSyncStatus: 'idle' });
                        }
                    }, 3000);
                } catch (e) {
                    console.error("Manual cloud sync failed", e);
                    set({ cloudSyncStatus: 'error' });
                }
            },

            addStep: (content) => set((state) => {
                const newStep: StrategyStep = {
                    id: crypto.randomUUID(),
                    content,
                    order: state.steps.length,
                }
                return { steps: [...state.steps, newStep] }
            }),

            updateStep: (id, updates) => set((state) => ({
                steps: state.steps.map(step =>
                    step.id === id ? { ...step, ...updates } : step
                )
            })),

            deleteStep: (id) => set((state) => ({
                steps: state.steps.filter(step => step.id !== id)
            })),

            reorderSteps: (newOrder) => set({
                steps: newOrder.map((step, index) => ({ ...step, order: index }))
            }),

            clearBoard: () => set({ steps: [] })
        }),
        {
            name: 'strategy-storage',
            partialize: (state) => ({
                steps: state.steps
            }),
            storage: {
                getItem: async (name) => {
                    // EDGE CASE FIX: Prevent SSR from massively hitting Supabase egress
                    if (typeof window === 'undefined') {
                        return null;
                    }

                    // 1. ALWAYS check Local Storage first
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

                    // 2. If Local is empty, try Cloud
                    try {
                        const { data } = await supabase
                            .from('app_storage')
                            .select('value')
                            .eq('key', name)
                            .single();

                        if (data?.value) {
                            const value = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;

                            if (typeof window !== 'undefined') {
                                localStorage.setItem(name, JSON.stringify(value));
                            }
                            return value;
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

                    // 2. Mark as unsaved (NO auto-sync to Supabase)
                    const currentStatus = useStrategyStore.getState().cloudSyncStatus;
                    if (currentStatus === 'idle' || currentStatus === 'success') {
                        useStrategyStore.getState().setCloudSyncStatus('unsaved');
                    }
                },
                removeItem: async () => { },
            },
        }
    )
)
