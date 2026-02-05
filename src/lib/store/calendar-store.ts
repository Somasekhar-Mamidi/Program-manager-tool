import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IntentBlock, DaySummary, MicroStep, Goal, Charter } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface CalendarState {
    intents: IntentBlock[];
    daySummaries: Record<string, DaySummary>; // Keyed by date YYYY-MM-DD

    addIntent: (intent: Omit<IntentBlock, 'id' | 'createdAt' | 'microSteps' | 'status'>) => void;
    updateIntent: (id: string, updates: Partial<IntentBlock>) => void;
    reorderIntents: (ids: string[]) => void;
    deleteIntent: (id: string) => void;

    addMicroStep: (intentId: string, step: MicroStep) => void;
    toggleMicroStep: (intentId: string, stepId: string) => void;

    updateDaySummary: (date: string, summary: Partial<DaySummary>) => void;

    // Goals
    goals: Goal[];
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completedDates'>) => void;
    toggleGoalDate: (goalId: string, date: string) => void;
    deleteGoal: (id: string) => void;

    // Charters
    charters: Charter[];
    addCharter: (charter: Omit<Charter, 'id' | 'createdAt' | 'resources'>) => void;
    updateCharter: (id: string, updates: Partial<Charter>) => void;
    deleteCharter: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
    persist(
        (set) => ({
            intents: [],
            daySummaries: {},

            addIntent: (intentData) => set((state) => {
                const maxOrder = state.intents.reduce((max, i) => Math.max(max, i.order || 0), 0);
                return {
                    intents: [
                        ...state.intents,
                        {
                            ...intentData,
                            id: uuidv4(),
                            createdAt: Date.now(),
                            status: 'planned',
                            order: maxOrder + 1,
                            microSteps: [], // Initializing with empty steps, Task Breakdown engine will populate this
                        },
                    ],
                }
            }),

            updateIntent: (id, updates) => set((state) => ({
                intents: state.intents.map((intent) =>
                    intent.id === id ? { ...intent, ...updates } : intent
                ),
            })),

            reorderIntents: (ids) => set((state) => {
                // Create a map of id -> newOrder
                const orderMap = new Map(ids.map((id, index) => [id, index]));

                return {
                    intents: state.intents.map(intent => {
                        const newOrder = orderMap.get(intent.id);
                        if (newOrder !== undefined) {
                            return { ...intent, order: newOrder };
                        }
                        return intent;
                    })
                };
            }),

            deleteIntent: (id) => set((state) => ({
                intents: state.intents.filter((intent) => intent.id !== id),
            })),

            addMicroStep: (intentId, step) => set((state) => ({
                intents: state.intents.map((intent) => {
                    if (intent.id !== intentId) return intent;
                    return {
                        ...intent,
                        microSteps: [...intent.microSteps, step],
                    };
                }),
            })),

            toggleMicroStep: (intentId, stepId) => set((state) => ({
                intents: state.intents.map((intent) => {
                    if (intent.id !== intentId) return intent;
                    return {
                        ...intent,
                        microSteps: intent.microSteps.map((step) =>
                            step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
                        ),
                    };
                }),
            })),

            updateDaySummary: (date, summary) => set((state) => ({
                daySummaries: {
                    ...state.daySummaries,
                    [date]: {
                        ...(state.daySummaries[date] || { date, topOutcomes: [] }),
                        ...summary,
                    },
                },
            })),

            // Goals Implementation
            goals: [],
            addGoal: (goalData) => set((state) => ({
                goals: [
                    ...state.goals,
                    {
                        ...goalData,
                        id: uuidv4(),
                        createdAt: Date.now(),
                        completedDates: [],
                    }
                ]
            })),
            toggleGoalDate: (goalId, date) => set((state) => ({
                goals: state.goals.map(g => {
                    if (g.id !== goalId) return g;
                    const exists = g.completedDates.includes(date);
                    return {
                        ...g,
                        completedDates: exists
                            ? g.completedDates.filter(d => d !== date)
                            : [...g.completedDates, date].sort()
                    };
                })
            })),
            deleteGoal: (id) => set((state) => ({
                goals: state.goals.filter(g => g.id !== id)
            })),

            // Charters Implementation
            charters: [],
            addCharter: (charterData) => set((state) => ({
                charters: [
                    ...state.charters || [], // Safety check for existing stores
                    {
                        ...charterData,
                        id: uuidv4(),
                        createdAt: Date.now(),
                        resources: [],
                    }
                ]
            })),
            updateCharter: (id, updates) => set((state) => ({
                charters: (state.charters || []).map(c =>
                    c.id === id ? { ...c, ...updates } : c
                )
            })),
            deleteCharter: (id) => set((state) => ({
                charters: (state.charters || []).filter(c => c.id !== id)
            })),
        }),
        {
            name: 'msc-storage',
        }
    )
);

export const rehydrateStore = () => {
    useCalendarStore.persist.rehydrate()
}
