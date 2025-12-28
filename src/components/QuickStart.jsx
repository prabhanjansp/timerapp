import React from 'react';
import { motion } from 'framer-motion';
import { Play, Timer, Clock, Zap } from 'lucide-react';
import { useTimerStore } from '../store/timerStore';

const QuickStart = () => {
    const { setTime, setTimerType, startTimer, pauseTimer, isRunning } = useTimerStore();
    const [selectedTimer, setSelectedTimer] = React.useState(null);

    const quickTimers = [
        {
            label: 'Pomodoro',
            duration: 1500, // 25 minutes = 1500 seconds (standard Pomodoro)
            type: 'focus',
            description: '25 min work, 5 min break',
            icon: Timer,
            color: 'bg-red-500',
            accentColor: 'text-red-500',
            bgColor: 'bg-red-500/10',
            badge: 'Popular'
        },
        {
            label: 'Deep Work',
            duration: 5400, // 90 minutes = 5400 seconds
            type: 'work',
            description: '90 min focused work',
            icon: Clock,
            color: 'bg-blue-500',
            accentColor: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            label: 'Study Block',
            duration: 3600, // 60 minutes = 3600 seconds
            type: 'study',
            description: '60 min study session',
            icon: Timer,
            color: 'bg-purple-500',
            accentColor: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        },
        {
            label: 'Quick Break',
            duration: 300, // 5 minutes = 300 seconds (standard short break)
            type: 'break',
            description: '5 min refresh',
            icon: Zap,
            color: 'bg-green-500',
            accentColor: 'text-green-500',
            bgColor: 'bg-green-500/10',
            badge: 'Recommended'
        },
        {
            label: 'Long Break',
            duration: 900, // 15 minutes = 900 seconds
            type: 'break',
            description: '15 min recharge',
            icon: Zap,
            color: 'bg-yellow-500',
            accentColor: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10'
        }
    ];

    const handleQuickStart = async (timer) => {
        setSelectedTimer(timer.label);

        // Animate button press with slight delay
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('QuickStart clicked:', timer.label, 'Duration:', timer.duration, 'seconds');

        // If timer is running, pause it first
        if (isRunning) {
            pauseTimer();
        }

        // Set the timer type and time
        setTimerType(timer.type);
        setTime(timer.duration);

        // Start the timer
        startTimer();

        // Reset selection after animation
        setTimeout(() => setSelectedTimer(null), 1000);
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div className="card w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Quick Start
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Zap size={14} className="text-yellow-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">One-click timers</span>
                </div>
            </div>

            <div className="space-y-2">
                {quickTimers.map((timer, index) => {
                    const Icon = timer.icon;
                    const isActive = selectedTimer === timer.label;

                    return (
                        <motion.div
                            key={timer.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className="overflow-hidden"
                        >
                            <button
                                onClick={() => handleQuickStart(timer)}
                                className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-200 ${timer.bgColor} ${isActive
                                        ? `${timer.color.replace('bg-', 'ring-')} ring-2 ring-opacity-50 ring-offset-2 dark:ring-offset-gray-800`
                                        : 'hover:shadow-md dark:hover:bg-gray-700/50'
                                    } ${isActive ? 'scale-[0.98]' : ''}`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className={`p-1.5 sm:p-2 rounded-lg ${timer.color} ${timer.bgColor} flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${timer.accentColor}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                <span className="font-medium text-gray-800 dark:text-white truncate text-sm sm:text-base">
                                                    {timer.label}
                                                </span>
                                                {timer.badge && (
                                                    <span className={`px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${timer.bgColor} ${timer.accentColor} flex-shrink-0`}>
                                                        {timer.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {timer.description}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                                        <span className="font-mono font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base whitespace-nowrap">
                                            {formatDuration(timer.duration)}
                                        </span>
                                        <motion.div
                                            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ duration: 0.3 }}
                                            className="flex-shrink-0"
                                        >
                                            <Play
                                                size={14}
                                                className={`transition-colors flex-shrink-0 ${isActive
                                                        ? timer.accentColor
                                                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                                    }`}
                                            />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Progress indicator for active timer */}
                                {isActive && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 0.5 }}
                                        className="h-0.5 sm:h-1 mt-2 sm:mt-3 rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
                                    />
                                )}
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Usage stats or tips */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Timer size={12} className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{quickTimers.length} presets available</span>
                    </div>
                    <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded self-start xs:self-auto">
                        Click to start
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickStart;