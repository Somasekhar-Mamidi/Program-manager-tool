# System Skills

This document outlines the specific capabilities (skills) available within the system. These skills are utilized by the Agents to perform their tasks.

## 1. Calendar Management
**Agent:** Calendar Agent
- **View Schedule:** Display weekly/monthly views.
- **Book Slot:** Reserve a specific time block for an Intent.
- **Reschedule:** Move a block to a new time.
- **Conflict Detection:** Identify overlapping events.

## 2. Strategy & Planning
**Agent:** Strategy Agent
- **Create Charter:** Define a new high-level goal (e.g., "Q3 Brand Awareness").
- **Define Intent:** Create a specific objective linked to a Charter.
- **Prioritize:** Rank Intents based on urgency and impact.
- **Review Goals:** Track progress against defined Charters.

## 3. Task Execution (TaskFlow)
**Agent:** Content Agent
- **Create Task:** Add a new task to the backlog.
- **Update Status:** Move task (To Do -> Doing -> Done).
- **Add Micro-Step:** Break a task into smaller sub-tasks.
- **Block Task:** Flag a task as blocked and add a reason.
- **Log Output:** Record the result of a task (e.g., "Draft URL").

## 4. Meeting Intelligence
**Agent:** Meeting Agent
- **Prep Meeting:** Generate a pre-meeting agenda and context.
- **Log Minutes:** Record notes during the meeting.
- **Extract Actions:** Identify follow-up tasks from notes.
- **Link Charter:** Associate a meeting with a specific Charter.

## 5. Analytics & Insights
**Agent:** Analytics Agent
- **Track Focus:** Calculate "Focus Score" based on uninterrupted work blocks.
- **Measure Efficiency:** Compare estimated effort vs. actual time.
- **Count Ideas:** Track the number of "Ideas Captured".
- **Monitor Output:** Measure volume of "Writing Output" (words/posts).

## 6. Task Resource Management
**Agent:** Content Agent
- **Add Resource:** Attach files or links relevant to a task.
- **Manage Q&A:** Log and track questions needing answers before starting a task.
- **Notes & Ideas:** Capture random thoughts or next steps associated with a resource.
- **Convert to Task:** Turn a note into an actionable task.

## 7. Data Persistence (System Skill)
**All Agents**
- **Save State:** Persist data to Local Storage (immediate).
- **Sync Cloud:** Back up data to Supabase (async).
- **Recover:** Restore data from Local Storage if Cloud is unavailable.
