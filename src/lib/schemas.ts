import { z } from "zod";

// Base Types
export const MicroStepSchema = z.object({
    id: z.string(),
    title: z.string(),
    isCompleted: z.boolean(),
    type: z.enum(['start', 'core', 'finish', 'manual']),
    estimatedMinutes: z.number().optional(),
});

export const ResourceTypeSchema = z.enum(['link', 'file', 'image', 'text']);

export const MeetingResourceSchema = z.object({
    id: z.string(),
    type: ResourceTypeSchema,
    title: z.string(),
    url: z.string().optional(),
    description: z.string().optional(),
    createdAt: z.number(),
});

// Main Entities
export const CharterSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    resources: z.array(MeetingResourceSchema).optional().default([]), // Robustness: default to check
    createdAt: z.number(),
});

export const IntentBlockSchema = z.object({
    id: z.string(),
    date: z.string(),
    objective: z.string(),
    outputDefinition: z.string().optional().default(""),
    estimatedEffort: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    type: z.enum(['work', 'social']).optional().default('work'),
    status: z.enum(['planned', 'in-progress', 'completed', 'deferred', 'blocked']).optional().default('planned'),
    microSteps: z.array(MicroStepSchema).optional().default([]),
    createdAt: z.number(),
    // Optional / Expansion fields
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    calendarCategory: z.string().optional(),
    priority: z.string().optional(),

    // Meeting specific
    isMeeting: z.boolean().optional(),
    prepNotes: z.string().optional(),
    resources: z.array(MeetingResourceSchema).optional(),
    charterId: z.string().optional(),
});

export const GoalSchema = z.object({
    id: z.string(),
    title: z.string(),
    targetDays: z.number(),
    completedDates: z.array(z.string()),
    createdAt: z.number(),
});

export const DaySummarySchema = z.object({
    date: z.string(),
    topOutcomes: z.array(z.string()),
    mustFinishTaskId: z.string().optional(),
});

// Store State Schema (Partial)
export const CalendarStateSchema = z.object({
    intents: z.array(IntentBlockSchema).optional().default([]),
    charters: z.array(CharterSchema).optional().default([]),
    goals: z.array(GoalSchema).optional().default([]),
    daySummaries: z.record(z.string(), DaySummarySchema).optional().default({}),
});
