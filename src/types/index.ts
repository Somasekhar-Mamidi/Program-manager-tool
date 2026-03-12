export type IntentType = 'work' | 'social';
export type IntentStatus = 'planned' | 'in-progress' | 'completed' | 'deferred' | 'blocked';

export interface MicroStep {
    id: string;
    title: string;
    isCompleted: boolean;
    type: 'start' | 'core' | 'finish' | 'manual';
    estimatedMinutes?: number;

}

export interface MeetingQuestion {

    id: string;
    text: string;
    isMustAsk: boolean;
    isAnswered: boolean;
    tags?: string[];
    attachments?: MeetingResource[];
}

export interface MeetingNoteItem {
    id: string;
    text: string;
    isImportant: boolean;
    isCompleted: boolean;
    tags?: string[];
    attachments?: MeetingResource[];
}

export type ResourceType = 'link' | 'file' | 'image' | 'text';

export interface MeetingResource {
    id: string;
    type: ResourceType;
    title: string;
    url?: string;
    description?: string;
    createdAt: number;
}

export interface Charter {
    id: string;
    title: string;
    description: string;
    resources: MeetingResource[];
    createdAt: number;
}


export interface IntentBlock {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    objective: string;
    outputDefinition: string;
    estimatedEffort: 'low' | 'medium' | 'high';
    type: IntentType;
    status: IntentStatus;
    nudgeInterval?: number; // Interval in minutes for nudges (0 or undefined = no nudges)
    lastNudgedAt?: number; // Timestamp of the last nudge
    focusStartedAt?: number; // Timestamp when focus started
    microSteps: MicroStep[];
    createdAt: number;
    assignee?: {
        name: string;
        avatar: string; // URL
    };
    priority?: 'Low' | 'Medium' | 'High';
    dueDate?: string; // ISO or formatted date
    project?: string;
    calendarCategory?: string;

    // Meeting Prep Fields
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
    scheduledTime?: string; // HH:mm format (24h)
    isMeeting?: boolean;
    isTaskResource?: boolean;
    order?: number; // Sorting order
    prepNotes?: string; // Markdown content for meeting prep
    blockers?: string; // Notes on what is blocking progress
    questions?: MeetingQuestion[]; // Structured questions for meeting prep
    resources?: MeetingResource[]; // Resources for meeting prep


    // Task Lifecycle System (Phase 3)
    context?: ContextBlock;
    meetingLogs?: MeetingLog[];
    notes?: string; // Free-form notes (Markdown) - Keeping for backward compatibility or simple use
    meetingNotes?: MeetingNoteItem[]; // Structured notes with attachments
    nextSteps?: NextStep[];
    executionLogs?: ExecutionLog[];
    decisions?: DecisionRecord[];
    retro?: RetroBlock;
    charterId?: string; // Link to a specific Charter
    activityLog?: ActivityLog[];
}

export interface ActivityLog {
    id: string;
    actorName: string;
    actorAvatar: string;
    action: string;
    details?: string;
    timestamp: number;
}

export interface ContextBlock {
    problemStatement: string;
    expectedOutcome: string;
    links: { title: string; url: string }[];
}

export interface MeetingLog {
    id: string;
    date: string;
    participants: string[];
    agenda: string;
    discussionPoints: string;
    decisions: string;
    openQuestions: string;
    createdAt: number;
}

export type NextStepStatus = 'todo' | 'doing' | 'done';

export interface NextStep {
    id: string;
    action: string;
    owner: string;
    dueDate?: string;
    dependency?: string;
    status: NextStepStatus;
}

export interface ExecutionLog {
    id: string;
    date: string;
    workDone: string;
    pending: string;
    blockers?: string;
}

export interface DecisionRecord {
    id: string;
    decision: string;
    date: string;
    reason: string;
    approvedBy: string;
}

export interface RetroBlock {
    finalOutcome: string;
    whatWentWell: string;
    whatDidNotGoWell: string;
    learnings: string;
}

export interface Goal {
    id: string;
    title: string;
    targetDays: number; // e.g., 30 days
    completedDates: string[]; // ISO YYYY-MM-DD
    createdAt: number;
}

export interface DaySummary {
    date: string;
    topOutcomes: string[];
    mustFinishTaskId?: string;
    reflection?: {
        wins: string;
        blockers: string;
        improvements: string;
    };
}
