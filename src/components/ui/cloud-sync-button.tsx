"use client"

import { Cloud, CloudOff, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/lib/store/calendar-store"
import { useStrategyStore } from "@/lib/store/strategy-store"
import { useTaskFlowStore } from "@/lib/store/taskflow-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useState } from "react"

export function CloudSyncButton() {
    const [isSyncing, setIsSyncing] = useState(false)

    const calendarStatus = useCalendarStore((s) => s.cloudSyncStatus)
    const strategyStatus = useStrategyStore((s) => s.cloudSyncStatus)
    const taskFlowStatus = useTaskFlowStore((s) => s.cloudSyncStatus)

    const hasUnsaved =
        calendarStatus === 'unsaved' ||
        strategyStatus === 'unsaved' ||
        taskFlowStatus === 'unsaved'

    const hasError =
        calendarStatus === 'error' ||
        strategyStatus === 'error' ||
        taskFlowStatus === 'error'

    const allSynced =
        (calendarStatus === 'success' || calendarStatus === 'idle') &&
        (strategyStatus === 'success' || strategyStatus === 'idle') &&
        (taskFlowStatus === 'success' || taskFlowStatus === 'idle')

    const handleSync = async () => {
        if (isSyncing) return
        setIsSyncing(true)

        try {
            await Promise.all([
                useCalendarStore.getState().syncToCloud(),
                useStrategyStore.getState().syncToCloud(),
                useTaskFlowStore.getState().syncToCloud(),
            ])
            toast.success("All data saved to cloud ☁️")
        } catch (e) {
            console.error("Cloud sync failed", e)
            toast.error("Some data failed to sync. Try again.")
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
                "h-8 gap-1.5 text-xs font-medium transition-all",
                hasUnsaved && "text-orange-600 dark:text-orange-400",
                hasError && "text-red-600 dark:text-red-400",
                allSynced && !hasUnsaved && "text-muted-foreground"
            )}
            title={
                isSyncing ? "Syncing..." :
                    hasUnsaved ? "You have unsaved changes. Click to save to cloud." :
                        hasError ? "Sync failed. Click to retry." :
                            "All data is saved."
            }
        >
            {isSyncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : hasError ? (
                <CloudOff className="h-3.5 w-3.5" />
            ) : allSynced && !hasUnsaved ? (
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            ) : (
                <Cloud className="h-3.5 w-3.5" />
            )}

            {isSyncing ? "Saving..." :
                hasUnsaved ? "Save" :
                    hasError ? "Retry" :
                        "Saved"}

            {hasUnsaved && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
            )}
        </Button>
    )
}
