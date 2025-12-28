import { useEffect, useCallback, useTransition } from 'react';
import { useTimerStore } from '../store/timerStore';

export const useTimer = () => {
    const [isPending, startTransition] = useTransition();
    const {
        time,
        isRunning,
        startTimer,
        pauseTimer,
        stopTimer,
        setTime,
        timerPresets,
        soundEnabled
    } = useTimerStore();

    // Timer logic
    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(time - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, time, setTime]);

    // Play sound when timer ends
    useEffect(() => {
        if (soundEnabled && time === 0 && !isRunning) {
            // Play completion sound
            const audio = new Audio('/sounds/complete.mp3');
            audio.play().catch(console.error);
        }
    }, [time, isRunning, soundEnabled]);

    const handleStart = useCallback(() => {
        startTransition(() => {
            startTimer();
        });
    }, [startTimer]);

    const handlePause = useCallback(() => {
        startTransition(() => {
            pauseTimer();
        });
    }, [pauseTimer]);

    const handleStop = useCallback((sessionData) => {
        startTransition(() => {
            stopTimer(sessionData);
        });
    }, [stopTimer]);

    const handlePreset = useCallback((type) => {
        startTransition(() => {
            setTime(timerPresets[type] || 0);
        });
    }, [setTime, timerPresets]);

    return {
        time,
        isRunning,
        isPending,
        handleStart,
        handlePause,
        handleStop,
        handlePreset
    };
};