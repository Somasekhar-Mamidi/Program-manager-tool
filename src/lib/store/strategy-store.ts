import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../supabase'

// Debounced Cloud Sync Helper
const cloudSyncTimers = new Map<string, ReturnType<typeof setTimeout>>();
const CLOUD_SYNC_DEBOUNCE_MS = 3000; // 3 seconds

const debouncedCloudSync = (name: string, value: any) => {
    const existing = cloudSyncTimers.get(name);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
        cloudSyncTimers.delete(name);
        try {
            await supabase
                .from('app_storage')
                .upsert({ key: name, value: value }, { onConflict: 'key' });
        } catch (e) {
            console.error("Cloud sync failed", e);
        }
    }, CLOUD_SYNC_DEBOUNCE_MS);

    cloudSyncTimers.set(name, timer);
};

export interface StrategyStep {
    id: string;
    content: string;
    notes?: string;
    order: number;
}

export interface StrategyBoardState {
    steps: StrategyStep[];
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

                    // 2. DEBOUNCED sync to Supabase (reduces bandwidth)
                    debouncedCloudSync(name, value);
                },
                removeItem: async (name) => {
                    // 1. Remove from LocalStorage
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(name);
                    }

                    // 2. Remove from Supabase
                    try {
                        await supabase
                            .from('app_storage')
                            .delete()
                            .eq('key', name);
                    } catch (e) {
                        console.error("Cloud delete failed", e);
                    }
                },
            },
        }
    )
)
