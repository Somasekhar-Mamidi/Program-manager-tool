# System Agents

This document defines the specialized AI agents capable of operating within the Marketing Reporter ecosystem. Each agent has a specific role, set of responsibilities, and access to specific tools and data stores.

## 1. Strategy Agent (The "Brain")
**Role:** High-level planning, goal setting, and performance analysis.
**Responsibilities:**
- Define and manage Charters (long-term goals).
- Break down Charters into Intents (specific objectives).
- Analyze performance metrics (Focus Score, Efficiency).
- Adjust strategies based on "Efficiency" and "Ideas Captured" metrics.
- **Context:** Access to `strategy-store` and `goals` directory.

## 2. Calendar Agent (The "Scheduler")
**Role:** Time management, scheduling, and execution planning.
**Responsibilities:**
- Manage the Weekly Calendar Grid.
- Schedule specific blocks for content creation, deep work, and meetings.
- Detect conflicts and suggest optimal times for "High Focus" tasks.
- Ensure "Intents" are assigned to specific time slots.
- **Context:** Access to `calendar-store` and `calendar` directory.

## 3. Content Agent (The "Creator")
**Role:** Content production, task execution, and asset management.
**Responsibilities:**
- Execute specific content tasks (Writing, Editing, Publishing).
- Manage the "Writing Output" workflow.
- track "Ideas Captured" and convert them into drafts.
- Move tasks through the `TaskFlow` stages (Planned -> In Progress -> Completed).
- Manage and organize task resources (files, links, Q&A, and notes).
- **Context:** Access to `taskflow-store`, `tasks` directory, and `writing` directory.

## 4. Meeting Agent (The "Scribe")
**Role:** Preparation, real-time logging, and post-meeting analysis.
**Responsibilities:**
- Prepare "Meeting Prep" documents.
- Log minutes during meetings.
- Extract "Action Items" and "Charters" from meeting notes.
- Sync meeting outcomes with the Strategy Agent.
- **Context:** Access to `meeting-prep` directory and `meetings` feature.

## 5. Analytics Agent (The "Observer")
**Role:** Data collection, metric tracking, and reporting.
**Responsibilities:**
- Aggregate data from all other agents.
- Calculate and display "Focus Score", "Efficiency", and "Writing Output".
- Generate visual reports (Dashboards).
- Provide feedback loops to the Strategy Agent.
- **Context:** Access to `analytics` directory and `dashboard` feature.
