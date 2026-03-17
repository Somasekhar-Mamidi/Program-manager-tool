export const playNudgeChime = () => {
    try {
        // EDGE CASE: Multi-tab debounce lock. Prevent echoing if DeepWork is open in multiple tabs
        if (typeof window !== 'undefined') {
            const lastPlayed = localStorage.getItem('last_nudge_chime_time');
            const now = Date.now();
            if (lastPlayed && (now - parseInt(lastPlayed, 10)) < 2000) {
                // Another tab played the chime within the last 2 seconds. Abort playback.
                return;
            }
            localStorage.setItem('last_nudge_chime_time', now.toString());
        }

        // We actually use a browser synthesized beep for maximum reliability without files
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);

    } catch (e) {
        console.error("Audio playback failed (usually due to lack of user interaction before first chime):", e);
    }
};

let titleBlinkInterval: NodeJS.Timeout | null = null;
const originalTitle = typeof document !== 'undefined' ? document.title : 'DeepWork';

export const startTabBlink = (message: string = "(1) ⚠️ Focus Time!") => {
    if (typeof document === 'undefined') return;

    stopTabBlink(); // Ensure no overlapping intervals

    let showMessage = true;
    titleBlinkInterval = setInterval(() => {
        document.title = showMessage ? message : originalTitle;
        showMessage = !showMessage;
    }, 1000);
};

export const stopTabBlink = () => {
    if (typeof document === 'undefined') return;

    if (titleBlinkInterval) {
        clearInterval(titleBlinkInterval);
        titleBlinkInterval = null;
    }
    document.title = originalTitle;
};

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const sendPushNotification = (title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    new Notification(title, {
        body,
        icon: '/favicon.ico', // Update this if you have a specific icon
        silent: true // We play our own custom chime
    });
};
