"use client"

import { useEffect } from "react"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { useStrategyStore } from "@/lib/store/strategy-store"
import { useTaskFlowStore } from "@/lib/store/taskflow-store"
import { format } from "date-fns"

export function CloudSyncManager() {
    const calendarSync = useCalendarStore(state => state.syncToCloud)
    const strategySync = useStrategyStore(state => state.syncToCloud)
    const taskFlowSync = useTaskFlowStore(state => state.syncToCloud)

    useEffect(() => {
        const checkAutoSync = () => {
            const now = new Date()
            const hour = now.getHours()
            const dateStr = format(now, 'yyyy-MM-dd')

            // Window 1: Midnight to Noon (Morning)
            // Window 2: Noon to 6 PM (Afternoon)
            // Window 3: 6 PM to Midnight (Night)
            const currentWindow = hour < 12 ? 1 : hour < 18 ? 2 : 3;
            
            const syncKey = `autosync_${dateStr}_w${currentWindow}`;

            // Check if we have already auto-synced for this exact window today
            if (!localStorage.getItem(syncKey)) {
                
                // Only sync if there are actually unsaved changes to prevent empty egress hits
                const calStatus = useCalendarStore.getState().cloudSyncStatus;
                const stratStatus = useStrategyStore.getState().cloudSyncStatus;
                const taskStatus = useTaskFlowStore.getState().cloudSyncStatus;

                let didSync = false;

                if (calStatus === 'unsaved') { calendarSync(); didSync = true; }
                if (stratStatus === 'unsaved') { strategySync(); didSync = true; }
                if (taskStatus === 'unsaved') { taskFlowSync(); didSync = true; }

                // Always mark the window as "handled" so we don't try again until the next window
                localStorage.setItem(syncKey, 'true')
                
                if (didSync) {
                    console.log(`[CloudSyncManager] Executed scheduled backup for Window ${currentWindow} (${dateStr})`);
                }
            }
        }

        // Check immediately on mount
        checkAutoSync()

        // Then check every 5 minutes while the app is passively open
        const interval = setInterval(checkAutoSync, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [calendarSync, strategySync, taskFlowSync])

    return null; // Invisible background manager
}
