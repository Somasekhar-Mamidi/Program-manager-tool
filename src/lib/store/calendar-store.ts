import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IntentBlock, DaySummary, MicroStep, Goal, Charter } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { CalendarStateSchema } from '@/lib/schemas';

interface CalendarState {
    intents: IntentBlock[];
    daySummaries: Record<string, DaySummary>; // Keyed by date YYYY-MM-DD
    
    // Onboarding
    hasSeenTour: boolean;
    setHasSeenTour: (hasSeen: boolean) => void;
    isTourRunning: boolean;
    setIsTourRunning: (run: boolean) => void;
    tourStepIndex: number;
    setTourStepIndex: (index: number) => void;

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

    cloudSyncStatus: 'idle' | 'syncing' | 'error' | 'success' | 'unsaved';
    setCloudSyncStatus: (status: 'idle' | 'syncing' | 'error' | 'success' | 'unsaved') => void;
    syncToCloud: () => Promise<void>;
}

// No auto-sync. Cloud sync is manual-only to prevent egress overuse.

export const useCalendarStore = create<CalendarState>()(
    persist(
        (set) => ({
            hasSeenTour: false,
            setHasSeenTour: (hasSeen) => set({ hasSeenTour: hasSeen }),
            isTourRunning: false,
            setIsTourRunning: (run) => set({ isTourRunning: run }),
            tourStepIndex: 0,
            setTourStepIndex: (index) => set({ tourStepIndex: index }),
            cloudSyncStatus: 'idle',
            setCloudSyncStatus: (status) => set({ cloudSyncStatus: status }),

            syncToCloud: async () => {
                const state = useCalendarStore.getState();
                if (state.cloudSyncStatus === 'syncing') return;

                set({ cloudSyncStatus: 'syncing' });
                try {
                    const payload = {
                        state: {
                            intents: state.intents,
                            daySummaries: state.daySummaries,
                            goals: state.goals,
                            charters: state.charters
                        },
                        version: 0
                    };

                    await supabase
                        .from('app_storage')
                        .upsert({ key: 'msc-storage', value: payload }, { onConflict: 'key' });

                    set({ cloudSyncStatus: 'success' });
                    setTimeout(() => {
                        if (useCalendarStore.getState().cloudSyncStatus === 'success') {
                            set({ cloudSyncStatus: 'idle' });
                        }
                    }, 3000);
                } catch (e) {
                    console.error("Manual cloud sync failed", e);
                    set({ cloudSyncStatus: 'error' });
                }
            },

            intents: [
                // --- Mock Data for Weekly Calendar Grid (Oct 28 - Nov 3) ---
                {
                    id: 'cal-1',
                    objective: 'Q3 Roadmap Review - Team Alpha',
                    status: 'planned',
                    date: '2024-10-28', // Monday
                    startTime: '09:30',
                    endTime: '11:00',
                    calendarCategory: 'work',
                    priority: 'High',
                    type: 'work',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Roadmap Deck',
                    estimatedEffort: 'medium'
                },
                {
                    id: 'cal-2',
                    objective: 'Standup & Planning',
                    status: 'planned',
                    date: '2024-10-29', // Tuesday
                    startTime: '10:00',
                    endTime: '11:00',
                    calendarCategory: 'meeting',
                    priority: 'Medium',
                    type: 'work',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Sprint Backlog',
                    estimatedEffort: 'medium'
                },
                {
                    id: 'cal-3',
                    objective: 'Stakeholder Update',
                    status: 'planned',
                    date: '2024-10-30', // Wednesday
                    startTime: '11:00',
                    endTime: '12:30',
                    calendarCategory: 'personal', // Using 'personal' for the reddish color in mockup
                    priority: 'High',
                    type: 'work',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Status Email',
                    estimatedEffort: 'medium'
                },
                {
                    id: 'cal-4',
                    objective: 'Team Sync',
                    status: 'planned',
                    date: '2024-10-31', // Thursday
                    startTime: '09:00',
                    endTime: '10:30',
                    calendarCategory: 'meeting',
                    priority: 'Medium',
                    type: 'work',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Sync Notes',
                    estimatedEffort: 'medium'
                },
                {
                    id: 'cal-5',
                    objective: 'Lunch & Learn: New Tools',
                    status: 'planned',
                    date: '2024-10-31', // Thursday
                    startTime: '12:00',
                    endTime: '13:30',
                    calendarCategory: 'personal',
                    priority: 'Low',
                    type: 'social',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Attendance',
                    estimatedEffort: 'medium'
                },
                {
                    id: 'cal-6',
                    objective: 'Weekly Progress Review',
                    status: 'planned',
                    date: '2024-11-01', // Friday
                    startTime: '10:30',
                    endTime: '12:00',
                    calendarCategory: 'work',
                    priority: 'Medium',
                    type: 'work',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Report',
                    estimatedEffort: 'medium'
                },
                {
                    id: 'cal-7',
                    objective: 'Workshop: Agile Best Practices',
                    status: 'planned',
                    date: '2024-11-01', // Friday
                    startTime: '14:00',
                    endTime: '15:30',
                    calendarCategory: 'meeting',
                    priority: 'Low',
                    type: 'work',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Slides',
                    estimatedEffort: 'medium'
                },
                {
                    id: 'cal-8',
                    objective: 'Design Sprint - Phase 2',
                    status: 'planned',
                    date: '2024-10-29', // Tuesday
                    startTime: '14:00',
                    endTime: '16:00',
                    calendarCategory: 'work',
                    priority: 'High',
                    type: 'work',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Designs',
                    estimatedEffort: 'medium'
                },
                {
                    id: 'cal-9',
                    objective: 'Technical Deep Dive',
                    status: 'planned',
                    date: '2024-10-30', // Wednesday
                    startTime: '15:30',
                    endTime: '17:00',
                    calendarCategory: 'work',
                    priority: 'Medium',
                    type: 'work',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Tech Spec',
                    estimatedEffort: 'medium'
                },
                {
                    id: 'cal-10',
                    objective: 'Client Feedback Sync',
                    status: 'planned',
                    date: '2024-10-28', // Monday
                    startTime: '13:00',
                    endTime: '14:30',
                    calendarCategory: 'personal',
                    priority: 'High',
                    type: 'work',
                    createdAt: Date.now(),
                    microSteps: [],
                    outputDefinition: 'Feedback Doc',
                    estimatedEffort: 'medium'
                },

                // --- Existing Tasks (keeping them for Task List view context) ---
                {
                    id: 't1',
                    objective: 'Q4 Strategy Document Finalization',
                    status: 'completed',
                    priority: 'Low',
                    dueDate: 'Oct 15, 2024',
                    project: 'Project Alpha',
                    assignee: { name: 'Sarah Lee', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                    date: '2024-10-15',
                    createdAt: Date.now(),
                    microSteps: [],
                    type: 'work',
                    outputDefinition: 'Final PDF',
                    estimatedEffort: 'medium'
                },
                {
                    id: 't2',
                    objective: 'Develop Core API Endpoints',
                    status: 'in-progress',
                    priority: 'High',
                    dueDate: 'Nov 01, 2024',
                    project: 'Beta Launch',
                    assignee: { name: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=mike' },
                    date: '2024-11-01',
                    createdAt: Date.now(),
                    microSteps: [],
                    type: 'work',
                    outputDefinition: 'API Spec',
                    estimatedEffort: 'high'
                },

                {
                    id: 't3',
                    objective: 'User Acceptance Testing (UAT) Phase 1',
                    status: 'in-progress',
                    priority: 'Medium',
                    dueDate: 'Nov 10, 2024',
                    project: 'Project Gamma',
                    assignee: { name: 'Somasekhar', avatar: 'https://i.pravatar.cc/150?u=somasekhar' },
                    date: '2024-11-10',
                    createdAt: Date.now(),
                    type: 'work',
                    outputDefinition: 'Test Report',
                    estimatedEffort: 'medium',
                    microSteps: [
                        { id: 'ms1', title: 'Define Test Scenarios', isCompleted: true, type: 'core' },
                        { id: 'ms2', title: 'Prepare Test Data', isCompleted: true, type: 'core' },
                        { id: 'ms3', title: 'Schedule UAT Sessions with Users', isCompleted: false, type: 'core' },
                        { id: 'ms4', title: 'Collect and Categorize Feedback', isCompleted: false, type: 'core' },
                        { id: 'ms5', title: 'Review Feedback with Development Team', isCompleted: false, type: 'finish' }
                    ],
                    activityLog: [
                        { id: 'a1', actorName: 'Somasekhar', action: 'moved to In Progress', timestamp: Date.now() - 3600000, actorAvatar: 'https://i.pravatar.cc/150?u=somasekhar' },
                        { id: 'a2', actorName: 'Emily Davis', action: 'added a comment', details: '"Test environment is ready."', timestamp: Date.now() - 7200000, actorAvatar: 'https://i.pravatar.cc/150?u=emily' },
                        { id: 'a3', actorName: 'Sarah Lee', action: 'created task', timestamp: Date.now() - 86400000, actorAvatar: 'https://i.pravatar.cc/150?u=sarah' }
                    ]
                },
                {
                    id: 't4',
                    objective: 'Website Redesign Mockups',
                    status: 'completed',
                    priority: 'Medium',
                    dueDate: 'Oct 22, 2024',
                    project: 'Website Revamp',
                    assignee: { name: 'David Kim', avatar: 'https://i.pravatar.cc/150?u=david' },
                    date: '2024-10-22',
                    createdAt: Date.now(),
                    microSteps: [],
                    type: 'work',
                    outputDefinition: 'Figma Links',
                    estimatedEffort: 'medium'
                },
                {
                    id: 't5',
                    objective: 'Client Onboarding Process Review',
                    status: 'in-progress',
                    priority: 'High',
                    dueDate: 'Nov 05, 2024',
                    project: 'Operations Optimization',
                    assignee: { name: 'Sarah Lee', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                    date: '2024-11-05',
                    createdAt: Date.now(),
                    microSteps: [],
                    type: 'work',
                    outputDefinition: 'Process Doc',
                    estimatedEffort: 'medium'
                },
                {
                    id: 't6',
                    objective: 'Quarterly Performance Report',
                    status: 'planned',
                    priority: 'Low',
                    dueDate: 'Nov 20, 2024',
                    project: 'Internal Reporting',
                    assignee: { name: 'Somasekhar', avatar: 'https://i.pravatar.cc/150?u=somasekhar' },
                    date: '2024-11-20',
                    createdAt: Date.now(),
                    microSteps: [],
                    type: 'work',
                    outputDefinition: 'Slides',
                    estimatedEffort: 'low'
                },
                {
                    id: 't7',
                    objective: 'Migrate Database to New Server',
                    status: 'in-progress',
                    priority: 'High',
                    dueDate: 'Dec 01, 2024',
                    project: 'Infrastructure Upgrade',
                    assignee: { name: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=mike' },
                    date: '2024-12-01',
                    createdAt: Date.now(),
                    microSteps: [],
                    type: 'work',
                    outputDefinition: 'Migration Complete',
                    estimatedEffort: 'high'
                },
                {
                    id: 't8',
                    objective: 'Create Marketing Campaign Assets',
                    status: 'planned',
                    priority: 'Medium',
                    dueDate: 'Nov 15, 2024',
                    project: 'Q4 Marketing Push',
                    assignee: { name: 'Emily Davis', avatar: 'https://i.pravatar.cc/150?u=emily' },
                    date: '2024-11-15',
                    createdAt: Date.now(),
                    microSteps: [],
                    type: 'work',
                    outputDefinition: 'Ad Creatives',
                    estimatedEffort: 'medium'
                }
            ],
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
            partialize: (state) => ({
                intents: state.intents,
                daySummaries: state.daySummaries,
                goals: state.goals,
                charters: state.charters
            }),
            storage: {
                getItem: async (name) => {
                    // EDGE CASE FIX: Prevent Next.js Server-Side Rendering (SSR) from relentlessly hitting Supabase
                    // because localStorage is undefined on the server. Only hydrate on the browser client!
                    if (typeof window === 'undefined') {
                        return null;
                    }

                    // 1. ALWAYS check Local Storage first
                    const local = localStorage.getItem(name);
                    if (local) {
                            try {
                                const parsed = JSON.parse(local);
                                if (parsed && parsed.state) {
                                    // Validation Guard
                                    const result = CalendarStateSchema.safeParse(parsed.state);
                                    if (result.success) {
                                        // We only validate the known shapes, but we return the full persisted object
                                        // to keep zustand meta data if any
                                        return parsed;
                                    } else {
                                        console.warn("Local storage validation failed, recovering partials:", result.error);
                                        // Attempt to return what we can or fall back
                                        return parsed; // For now, log but allow, to prevent total data loss during migration
                                    }
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
                            // data.value is likely already an object if column is jsonb/json
                            // If it's a string, we might need to parse it. 
                            // Assuming Supabase returns the JSON object.
                            const value = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;

                            // Save to local for next time
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

                    // 2. Mark as unsaved (NO auto-sync to Supabase)
                    const currentStatus = useCalendarStore.getState().cloudSyncStatus;
                    if (currentStatus === 'idle' || currentStatus === 'success') {
                        useCalendarStore.getState().setCloudSyncStatus('unsaved');
                    }
                },
                removeItem: async (name) => {
                    // no-op
                },
            },
        }
    )
);

export const rehydrateStore = () => {
    useCalendarStore.persist.rehydrate()
}
