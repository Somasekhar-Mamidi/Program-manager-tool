import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
            storage: createJSONStorage(() => localStorage),
        }
    )
)
