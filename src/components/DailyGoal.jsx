import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, TrendingUp, Edit2, CheckCircle, X, Zap } from 'lucide-react';
import { useTimerStore } from '../store/timerStore';
import { formatDuration } from '../utils/timeFormatter';

const DailyGoal = () => {
    const { dailyGoal, getTodaySessions, updateDailyGoal } = useTimerStore();
    const [isEditing, setIsEditing] = useState(false);
    const [newGoal, setNewGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const todaySessions = getTodaySessions();
    const todayTotal = todaySessions.reduce((total, session) => total + session.duration, 0);
    
    // Convert dailyGoal from minutes to seconds for comparison
    const dailyGoalSeconds = dailyGoal * 60;
    const progress = dailyGoalSeconds > 0 ? Math.min((todayTotal / dailyGoalSeconds) * 100, 100) : 0;
    const remainingSeconds = Math.max(dailyGoalSeconds - todayTotal, 0);
    
    const getProgressColor = () => {
        if (progress >= 100) return 'from-emerald-500 to-green-400';
        if (progress >= 75) return 'from-amber-500 to-yellow-400';
        if (progress >= 50) return 'from-blue-500 to-cyan-400';
        return 'from-gray-400 to-gray-300';
    };
    
    const getProgressEmoji = () => {
        if (progress >= 100) return '🎉';
        if (progress >= 75) return '🔥';
        if (progress >= 50) return '🚀';
        if (progress >= 25) return '👍';
        return '💪';
    };
    
    const getMotivationMessage = () => {
        if (progress >= 100) return "Daily goal smashed! You're unstoppable!";
        if (progress >= 90) return "So close! One more push!";
        if (progress >= 75) return "Great progress! You're on fire!";
        if (progress >= 50) return "Halfway there! Keep going!";
        if (progress >= 25) return "Good start! Momentum is building!";
        if (todayTotal > 0) return "Every minute counts!";
        return "Start your first session and begin your journey!";
    };
    
    const handleSaveGoal = async () => {
        const goalMinutes = parseInt(newGoal);
        
        if (!goalMinutes || goalMinutes < 1 || goalMinutes > 1440) {
            alert('Please enter a valid goal between 1 and 1440 minutes (24 hours)');
            return;
        }
        
        setIsLoading(true);
        try {
            await updateDailyGoal(goalMinutes);
            setIsEditing(false);
            setNewGoal('');
        } catch (error) {
            console.error('Failed to update goal:', error);
            alert('Failed to update goal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQuickGoal = (minutes) => {
        setNewGoal(minutes.toString());
    };
    
    const quickGoals = [
        { minutes: 30, label: '30m', description: 'Quick focus' },
        { minutes: 60, label: '1h', description: 'Standard' },
        { minutes: 120, label: '2h', description: 'Deep work' },
        { minutes: 240, label: '4h', description: 'Power session' },
    ];

    return (
        <div className="card hover:shadow-lg transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Daily Goal
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track your daily progress
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {progress >= 100 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30"
                        >
                            <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </motion.div>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        aria-label="Adjust daily goal"
                    >
                        <Edit2 className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
            
            {/* Progress Section */}
            <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-800 dark:text-white">
                                {Math.round(progress)}%
                            </span>
                            <span className="text-lg">{getProgressEmoji()}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                                {formatDuration(todayTotal)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                of {dailyGoal} min goal
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ 
                                    duration: 1.5, 
                                    ease: "easeOut",
                                    delay: 0.2 
                                }}
                                className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
                            />
                        </div>
                        
                        {/* Milestone markers */}
                        <div className="flex justify-between mt-1 px-1">
                            {[25, 50, 75, 100].map((milestone) => (
                                <div
                                    key={milestone}
                                    className={`text-xs ${progress >= milestone ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-400 dark:text-gray-600'}`}
                                >
                                    {milestone}%
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Motivation Message */}
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {getMotivationMessage()}
                    </p>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">
                            {todaySessions.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Sessions today
                        </div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">
                            {remainingSeconds > 0 ? formatDuration(remainingSeconds) : '🎯'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {remainingSeconds > 0 ? 'Remaining' : 'Goal reached!'}
                        </div>
                    </div>
                </div>
                
                {/* Session Breakdown */}
                {todaySessions.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Today's Sessions
                        </h4>
                        <div className="space-y-2">
                            {todaySessions.slice(0, 3).map((session, index) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            session.type === 'study' ? 'bg-blue-500' :
                                            session.type === 'work' ? 'bg-emerald-500' :
                                            session.type === 'focus' ? 'bg-purple-500' :
                                            'bg-amber-500'
                                        }`} />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                            {session.type}
                                        </span>
                                    </div>
                                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                        {formatDuration(session.duration)}
                                    </span>
                                </motion.div>
                            ))}
                            {todaySessions.length > 3 && (
                                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    + {todaySessions.length - 3} more sessions
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Edit Goal Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setIsEditing(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                            Set Daily Goal
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            How many minutes do you want to focus today?
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                {/* Current Goal */}
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                                        Current Goal
                                    </div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {dailyGoal} minutes
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        ≈ {Math.round(dailyGoal / 60)} hours
                                    </div>
                                </div>
                                
                                {/* Quick Goals */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Quick Select
                                    </h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {quickGoals.map((goal) => (
                                            <motion.button
                                                key={goal.minutes}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleQuickGoal(goal.minutes)}
                                                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                            >
                                                <div className="text-lg font-bold text-gray-800 dark:text-white">
                                                    {goal.label}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {goal.description}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Custom Input */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Custom Goal (minutes)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="1440"
                                            value={newGoal}
                                            onChange={(e) => setNewGoal(e.target.value)}
                                            placeholder="Enter minutes"
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 outline-none transition-all"
                                            aria-label="Daily goal in minutes"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            minutes
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Enter a value between 1 and 1440 (24 hours)
                                    </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveGoal}
                                        disabled={isLoading || !newGoal}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Update Goal
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyGoal;