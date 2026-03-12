"use client"

import { useEffect, useRef } from 'react';
import { useCalendarStore } from '@/lib/store/calendar-store';
import { differenceInMinutes, isToday, parseISO } from 'date-fns';
import {
    playNudgeChime,
    startTabBlink,
    stopTabBlink,
    requestNotificationPermission,
    sendPushNotification
} from '@/lib/utils/notifications';

export function useNudgeEngine() {
    const intents = useCalendarStore((state) => state.intents);
    const updateIntent = useCalendarStore((state) => state.updateIntent);

    // Store reference to avoid closure staleness in setInterval
    const intentsRef = useRef(intents);

    useEffect(() => {
        intentsRef.current = intents;
    }, [intents]);

    useEffect(() => {
        // Request permissions quietly when the engine mounts
        requestNotificationPermission();

        // Clear tab blink when user brings tab to foreground
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                stopTabBlink();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        const intervalId = setInterval(() => {
            const now = new Date();

            // Look for tasks that are today, planned/in-progress, and have a nudgeInterval
            const activeIntents = intentsRef.current.filter(intent => {
                const isTaskToday = isToday(parseISO(intent.date));
                const isValidStatus = intent.status === 'planned' || intent.status === 'in-progress';
                const hasInterval = (intent.nudgeInterval || 0) > 0;

                return isTaskToday && isValidStatus && hasInterval;
            });

            activeIntents.forEach(intent => {
                const interval = intent.nudgeInterval!; // We filtered for > 0

                // Determine the baseline time to calculate "elapsed" from
                // We pick the most recent of: lastNudgedAt, focusStartedAt, or createdAt.
                const baselineTimestamp = intent.lastNudgedAt
                    || intent.focusStartedAt
                    || intent.createdAt
                    || Date.parse(intent.date); // Absolute fallback

                const minsElapsed = differenceInMinutes(now, new Date(baselineTimestamp));

                if (minsElapsed >= interval) {
                    // Time to nudge!

                    // 1. Audio
                    playNudgeChime();

                    // 2. Push Notification
                    sendPushNotification(
                        "DeepWork Focus Check",
                        `Time for a check-in: How is "${intent.objective}" going?`
                    );

                    // 3. Tab Blink (only useful if they aren't looking at the tab)
                    if (document.visibilityState === 'hidden') {
                        startTabBlink(`(1) ⚠️ Focus: ${intent.objective.substring(0, 10)}...`);
                    }

                    // 4. Update the DB so we don't spam them every minute thereafter
                    updateIntent(intent.id, {
                        lastNudgedAt: now.getTime()
                    });
                }
            });

        }, 60 * 1000); // Check every 1 minute

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopTabBlink();
        };
    }, [updateIntent]);

}
