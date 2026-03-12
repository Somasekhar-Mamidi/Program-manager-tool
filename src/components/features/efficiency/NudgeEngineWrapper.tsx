"use client"

import { useNudgeEngine } from "@/lib/hooks/useNudgeEngine"

export function NudgeEngineWrapper() {
    // Initializes the global minutely nudge check
    useNudgeEngine();
    return null;
}
