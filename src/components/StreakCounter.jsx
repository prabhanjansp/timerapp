import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Target } from 'lucide-react';
import { useTimerStore } from '../store/timerStore';

const StreakCounter = () => {
    const { streak } = useTimerStore();

    // Get streak message
    const getStreakMessage = () => {
        if (streak === 0) return "Start your focus streak today";
        if (streak < 3) return "Great start!";
        if (streak < 7) return "Keep it going!";
        if (streak < 14) return "You're on fire!";
        if (streak < 30) return "Amazing dedication!";
        return "Legendary streak!";
    };

    // Get gradient based on streak
    const getGradient = () => {
        if (streak === 0) return "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700";
        if (streak < 3) return "bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20";
        if (streak < 7) return "bg-gradient-to-r from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20";
        if (streak < 14) return "bg-gradient-to-r from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20";
        return "bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20";
    };

    // Get flame color
    const getFlameColor = () => {
        if (streak === 0) return "text-gray-400";
        if (streak < 3) return "text-yellow-500";
        if (streak < 7) return "text-orange-500";
        if (streak < 14) return "text-red-500";
        return "text-purple-500";
    };

    // Get flame gradient for animation
    const getFlameGradient = () => {
        if (streak < 3) return "text-yellow-400";
        if (streak < 7) return "text-orange-400";
        if (streak < 14) return "text-red-400";
        return "text-purple-400";
    };

    // Get next milestone
    const getNextMilestone = () => {
        const milestones = [3, 7, 14, 30, 60, 90];
        return milestones.find(m => streak < m) || 100;
    };

    const nextMilestone = getNextMilestone();
    const progress = streak === 0 ? 0 : Math.min(100, (streak / nextMilestone) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className={`rounded-xl ${getGradient()} p-5 shadow-sm border border-gray-100 dark:border-gray-700`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={streak > 0 ? {
                            scale: [1, 1.1, 1]
                        } : {}}
                        transition={streak > 0 ? {
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                        } : {}}
                        className="relative"
                    >
                        {/* Animated glow behind flame */}
                        {streak > 0 && (
                            <motion.div
                                animate={{
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity
                                }}
                                className={`absolute -inset-2 bg-gradient-to-r ${getFlameGradient()} rounded-full blur-sm`}
                            />
                        )}
                        <Flame 
                            className={`w-7 h-7 relative z-10 ${getFlameColor()}`} 
                            fill={streak > 0 ? "currentColor" : "none"}
                        />
                    </motion.div>
                    
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">
                                {streak}
                            </span>
                            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                                days
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getStreakMessage()}
                        </p>
                    </div>
                </div>

                {/* Next milestone */}
                <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            Next: {nextMilestone} days
                        </span>
                    </div>
                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {Math.max(0, nextMilestone - streak)} to go
                    </div>
                </div>
            </div>

            {/* Progress bar with gradient */}
            <div>
                <div className="h-2 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${getFlameColor().replace('text-', 'bg-')} to-${getFlameColor().replace('text-', 'bg-')}/70`}
                    />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{streak} days</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(progress)}% to {nextMilestone} days
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default StreakCounter;