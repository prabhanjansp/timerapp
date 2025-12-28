import React, { useState, useTransition, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimerStore } from '../store/timerStore';
import { Play, Pause, Square, Target, TrendingUp, History, Sun, Moon } from 'lucide-react';
import TimerForm from './TimerForm';
import ConfirmationModal from './ConfirmationModal';

const Timer = () => {
    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const {
        time,
        isRunning,
        timerType,
        startTimer,
        pauseTimer,
        stopTimer,
        setTime,
        setTimerType,
        darkMode,
        toggleDarkMode
    } = useTimerStore();

    // Timer logic
    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(time + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, time, setTime]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                isRunning ? pauseTimer() : startTimer();
            }
            if (e.code === 'Escape' && isRunning) {
                setShowConfirm(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRunning, startTimer, pauseTimer]);

    const handleStop = useCallback(() => {
        setShowForm(true);
        setShowConfirm(false);
    }, []);

    const handleFormSubmit = useCallback((data) => {
        startTransition(() => {
            stopTimer(data);
            setShowForm(false);
        });
    }, [stopTimer]);

    const timerTypes = [
        { id: 'study', label: 'Study', color: 'bg-blue-500', icon: '📚' },
        { id: 'work', label: 'Work', color: 'bg-green-500', icon: '💼' },
        { id: 'focus', label: 'Focus', color: 'bg-purple-500', icon: '🎯' },
        { id: 'break', label: 'Break', color: 'bg-yellow-500', icon: '☕' }
    ];

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-800 dark:text-white"
                    >
                        Focus Timer
                    </motion.h1>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Timer */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        {/* Timer Display */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <div className="text-center">
                                <motion.div
                                    key={time}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    className="text-7xl md:text-9xl font-mono font-bold text-gray-800 dark:text-white mb-8"
                                >
                                    {formatTime(time)}
                                </motion.div>

                                {/* Timer Type Selector */}
                                <div className="flex justify-center gap-4 mb-8">
                                    {timerTypes.map((type) => (
                                        <motion.button
                                            key={type.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setTimerType(type.id)}
                                            className={`flex flex-col items-center p-4 rounded-xl transition-all ${timerType === type.id
                                                    ? `${type.color} text-white shadow-lg`
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                }`}
                                        >
                                            <span className="text-2xl">{type.icon}</span>
                                            <span className="text-sm mt-2">{type.label}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Control Buttons */}
                                <div className="flex justify-center gap-6">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={isRunning ? pauseTimer : startTimer}
                                        className={`flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-lg ${isRunning
                                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                                : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                    >
                                        {isRunning ? (
                                            <>
                                                <Pause size={24} />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play size={24} />
                                                Start
                                            </>
                                        )}
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowConfirm(true)}
                                        disabled={!isRunning && time === 0}
                                        className="flex items-center gap-2 px-8 py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Square size={24} />
                                        Stop
                                    </motion.button>
                                </div>

                                {/* Keyboard Shortcuts Hint */}
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
                                    Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> to start/pause •
                                    Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded ml-2">Esc</kbd> to stop
                                </p>
                            </div>
                        </div>

                        {/* Stats Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                icon={<Target />}
                                title="Today's Focus"
                                value={`${Math.floor(time / 60)} min`}
                                color="blue"
                            />
                            <StatCard
                                icon={<TrendingUp />}
                                title="Current Streak"
                                value={useTimerStore.getState().streak}
                                color="green"
                            />
                            <StatCard
                                icon={<History />}
                                title="Total Sessions"
                                value={useTimerStore.getState().sessions.length}
                                color="purple"
                            />
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <QuickStart />
                        <DailyGoal />
                        <RecentSessions />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showConfirm && (
                    <ConfirmationModal
                        onConfirm={handleStop}
                        onCancel={() => setShowConfirm(false)}
                    />
                )}

                {showForm && (
                    <TimerForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowForm(false)}
                        duration={time}
                        timerType={timerType}
                        isPending={isPending}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-${color}-500`}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{value}</p>
            </div>
            <div className={`text-${color}-500`}>
                {icon}
            </div>
        </div>
    </motion.div>
);

const QuickStart = () => {
    const quickTimers = [
        { label: '25 min Focus', duration: 1500, type: 'focus' },
        { label: '50 min Study', duration: 3600, type: 'study' },
        { label: '10 min Break', duration: 600, type: 'break' }
    ];

    const { setTime, setTimerType, startTimer } = useTimerStore();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Start</h3>
            <div className="space-y-3">
                {quickTimers.map((timer) => (
                    <motion.button
                        key={timer.label}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setTime(timer.duration);
                            setTimerType(timer.type);
                            startTimer();
                        }}
                        className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300">{timer.label}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {Math.floor(timer.duration / 60)} min
                            </span>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

const DailyGoal = () => {
    const { dailyGoal, setDailyGoal, sessions } = useTimerStore();

    const todayTotal = sessions
        .filter(s => new Date(s.startTime).toDateString() === new Date().toDateString())
        .reduce((total, s) => total + s.duration, 0) / 60;

    const progress = Math.min((todayTotal / dailyGoal) * 100, 100);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Daily Goal</h3>
            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        {Math.round(todayTotal)} / {dailyGoal} min
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-green-500"
                    />
                </div>
                <input
                    type="range"
                    min="15"
                    max="480"
                    step="15"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                    className="w-full"
                />
            </div>
        </div>
    );
};

const RecentSessions = () => {
    const { sessions } = useTimerStore();
    const recent = sessions.slice(0, 3);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Sessions</h3>
            <div className="space-y-3">
                {recent.map((session) => (
                    <div
                        key={session.id}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-700 dark:text-gray-300 font-medium">
                                    {session.name || `Session ${session.type}`}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <span className="font-mono text-gray-800 dark:text-white">
                                {Math.floor(session.duration / 60)} min
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timer;