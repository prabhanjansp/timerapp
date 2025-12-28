import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Calendar,
    TrendingUp,
    Trophy,
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    Clock,
    X,
    Flame,
    Star,
    Zap
} from 'lucide-react';
import { useTimerStore } from '../store/timerStore';
import { formatDuration } from '../utils/timeFormatter';

// Safe formatDuration function as fallback
const safeFormatDuration = (seconds) => {
    try {
        // If formatDuration is undefined or throws error, use our version
        if (typeof formatDuration === 'function') {
            const result = formatDuration(seconds);
            // Check if the result contains 'undefined'
            if (result && result.includes && result.includes('undefined')) {
                throw new Error('Format contains undefined');
            }
            return result;
        }
    } catch (error) {
        console.warn('Error in formatDuration, using fallback:', error);
    }
    
    // Fallback implementation
    if (!seconds && seconds !== 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
};

// Goal types configuration
const GOAL_TYPES = {
    daily: { label: 'Daily', icon: <Target size={20} />, color: 'blue' },
    weekly: { label: 'Weekly', icon: <Calendar size={20} />, color: 'green' },
    streak: { label: 'Streak', icon: <TrendingUp size={20} />, color: 'purple' },
    custom: { label: 'Custom', icon: <Star size={20} />, color: 'orange' }
};

const GoalsPage = () => {
    const [editingGoal, setEditingGoal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [customGoals, setCustomGoals] = useState([]);
    const [newGoal, setNewGoal] = useState({
        title: '',
        targetTime: 1800,
        period: 'daily',
        description: '',
        type: 'custom'
    });

    const { dailyGoal, weeklyGoal, sessions, setDailyGoal, setWeeklyGoal } = useTimerStore();

    // Calculate progress with correct week calculation
    const today = new Date().toDateString();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const todaySessions = sessions.filter(s => {
        try {
            return new Date(s.startTime).toDateString() === today;
        } catch {
            return false;
        }
    });
    
    const weekSessions = sessions.filter(s => {
        try {
            return new Date(s.startTime) >= weekStart;
        } catch {
            return false;
        }
    });

    const todayProgress = todaySessions.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
    const weekProgress = weekSessions.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);

    // Calculate streak
    const calculateStreak = () => {
        if (sessions.length === 0) return 0;
        
        try {
            const uniqueDays = [...new Set(
                sessions.map(s => {
                    try {
                        return new Date(s.startTime).toDateString();
                    } catch {
                        return null;
                    }
                }).filter(Boolean)
            )].sort();
            
            if (uniqueDays.length === 0) return 0;
            
            let streak = 1;
            for (let i = uniqueDays.length - 1; i > 0; i--) {
                const current = new Date(uniqueDays[i]);
                const previous = new Date(uniqueDays[i - 1]);
                const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }
            return streak;
        } catch {
            return 0;
        }
    };

    const currentStreak = calculateStreak();
    const streakGoal = 7;

    const todayPercentage = dailyGoal > 0 ? (todayProgress / dailyGoal) * 100 : 0;
    const weekPercentage = weeklyGoal > 0 ? (weekProgress / weeklyGoal) * 100 : 0;
    const streakPercentage = (currentStreak / streakGoal) * 100;

    // Base goals with proper calculations
    const baseGoals = [
        {
            id: 'daily',
            title: 'Daily Focus Goal',
            description: 'Complete your daily focus time',
            current: todayProgress,
            target: dailyGoal,
            period: 'daily',
            color: 'blue',
            icon: <Target size={24} />,
            progress: todayPercentage,
            type: 'base'
        },
        {
            id: 'weekly',
            title: 'Weekly Focus Goal',
            description: 'Complete your weekly focus time',
            current: weekProgress,
            target: weeklyGoal,
            period: 'weekly',
            color: 'green',
            icon: <Calendar size={24} />,
            progress: weekPercentage,
            type: 'base'
        },
        {
            id: 'streak',
            title: 'Maintain Focus Streak',
            description: 'Focus for consecutive days',
            current: currentStreak,
            target: streakGoal,
            period: 'streak',
            color: 'purple',
            icon: <Flame size={24} />,
            progress: streakPercentage,
            type: 'base'
        }
    ];

    const allGoals = [...baseGoals, ...customGoals];

    const achievements = [
        { 
            id: 1, 
            title: 'First Session', 
            description: 'Complete your first focus session', 
            achieved: true, 
            icon: <Zap size={16} /> 
        },
        { 
            id: 2, 
            title: 'One Hour Focus', 
            description: 'Focus for a total of 1 hour', 
            achieved: todayProgress >= 3600 || weekProgress >= 3600, 
            icon: <Clock size={16} /> 
        },
        { 
            id: 3, 
            title: '7-Day Streak', 
            description: 'Maintain focus for 7 consecutive days', 
            achieved: currentStreak >= 7, 
            icon: <Flame size={16} /> 
        },
        { 
            id: 4, 
            title: 'Daily Goal Master', 
            description: 'Achieve daily goal 5 times', 
            achieved: false, 
            icon: <Trophy size={16} /> 
        },
        { 
            id: 5, 
            title: 'Focus Marathon', 
            description: 'Complete a 2-hour focus session', 
            achieved: sessions.some(s => (s.duration || 0) >= 7200), 
            icon: <Target size={16} /> 
        },
    ];

    // Color class mappings for Tailwind
    const colorClasses = {
        blue: {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-600 dark:text-blue-400',
            progress: 'bg-blue-500',
            border: 'border-blue-200 dark:border-blue-800'
        },
        green: {
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-600 dark:text-green-400',
            progress: 'bg-green-500',
            border: 'border-green-200 dark:border-green-800'
        },
        purple: {
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            text: 'text-purple-600 dark:text-purple-400',
            progress: 'bg-purple-500',
            border: 'border-purple-200 dark:border-purple-800'
        },
        orange: {
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            text: 'text-orange-600 dark:text-orange-400',
            progress: 'bg-orange-500',
            border: 'border-orange-200 dark:border-orange-800'
        }
    };

    const handleSaveGoal = (goal) => {
        if (goal.type === 'base') {
            if (goal.period === 'daily') {
                setDailyGoal(goal.target);
            } else if (goal.period === 'weekly') {
                setWeeklyGoal(goal.target);
            }
        } else {
            // Update custom goal
            setCustomGoals(prev => 
                prev.map(g => g.id === goal.id ? goal : g)
            );
        }
        setShowModal(false);
        setEditingGoal(null);
    };

    const handleAddGoal = () => {
        if (!newGoal.title.trim()) {
            alert('Please enter a goal title');
            return;
        }

        const goal = {
            ...newGoal,
            id: Date.now().toString(),
            current: 0,
            progress: 0,
            createdAt: new Date().toISOString()
        };

        setCustomGoals(prev => [...prev, goal]);
        setShowModal(false);
        setNewGoal({
            title: '',
            targetTime: 1800,
            period: 'daily',
            description: '',
            type: 'custom'
        });
    };

    const handleDeleteGoal = (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            setCustomGoals(prev => prev.filter(g => g.id !== id));
        }
    };

    const handleEditClick = (goal) => {
        setEditingGoal(goal);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingGoal(null);
    };

    const getGoalDisplayValue = (goal) => {
        if (goal.period === 'streak') {
            return `${goal.current || 0}/${goal.target || 0} days`;
        }
        const current = Number(goal.current) || 0;
        const target = Number(goal.target) || 0;
        return `${safeFormatDuration(current)} / ${safeFormatDuration(target)}`;
    };

    // Format duration safely for display
    const formatStatsValue = (value, type = 'time') => {
        if (type === 'time') {
            return safeFormatDuration(Number(value) || 0);
        }
        return value;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
                        Goals & Achievements
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Set ambitious goals, track your progress, and unlock achievements as you build better focus habits
                    </p>
                </motion.div>

                {/* Stats Overview - FIXED WITH SAFE FORMATTING */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { 
                            label: "Today's Focus", 
                            value: todayProgress, 
                            formattedValue: formatStatsValue(todayProgress),
                            percentage: todayPercentage, 
                            color: 'blue' 
                        },
                        { 
                            label: 'Weekly Focus', 
                            value: weekProgress, 
                            formattedValue: formatStatsValue(weekProgress),
                            percentage: weekPercentage, 
                            color: 'green' 
                        },
                        { 
                            label: 'Current Streak', 
                            value: currentStreak, 
                            formattedValue: `${currentStreak} days`,
                            percentage: streakPercentage, 
                            color: 'purple' 
                        }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <div className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                                    {stat.formattedValue}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 mb-3">{stat.label}</div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(stat.percentage, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-2 rounded-full ${stat.color === 'blue' ? 'bg-blue-500' : stat.color === 'green' ? 'bg-green-500' : 'bg-purple-500'}`}
                                    />
                                </div>
                                <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {Math.round(stat.percentage)}% complete
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Active Goals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                Your Goals
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Track and manage your focus goals
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingGoal(null);
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <Plus size={20} />
                            Add New Goal
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {allGoals.map((goal, index) => {
                            const colors = colorClasses[goal.color] || colorClasses.blue;
                            
                            return (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    className={`relative p-6 rounded-2xl border ${colors.border} bg-white dark:bg-gray-800/50 backdrop-blur-sm group`}
                                >
                                    {/* Ribbon for completed goals */}
                                    {goal.progress >= 100 && (
                                        <div className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg shadow-lg">
                                            <CheckCircle size={12} className="inline mr-1" />
                                            Achieved
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${colors.bg}`}>
                                                <div className={colors.text}>
                                                    {goal.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                                                    {goal.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {GOAL_TYPES[goal.period]?.label || goal.period} goal
                                                    {goal.description && ` • ${goal.description}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {goal.type === 'custom' && (
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Delete goal"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEditClick(goal)}
                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="Edit goal"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                Progress
                                            </span>
                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                {getGoalDisplayValue(goal)}
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(goal.progress, 100)}%` }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                                className={`h-full ${colors.progress} rounded-full`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm font-medium ${goal.progress >= 100 ? 'text-green-500' : 'text-gray-500'}`}>
                                            {Math.round(goal.progress)}% complete
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {goal.progress >= 100 ? (
                                                <span className="flex items-center gap-2 text-green-500 text-sm font-semibold">
                                                    <CheckCircle size={16} />
                                                    Goal achieved!
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-500">
                                                    {goal.progress < 50 ? 'Keep going!' : 'Almost there!'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Achievements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        Your Achievements
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {achievements.map((achievement) => (
                            <motion.div
                                key={achievement.id}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 ${
                                    achievement.achieved
                                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg'
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30'
                                }`}
                            >
                                {achievement.achieved && (
                                    <div className="absolute top-2 right-2">
                                        <div className="p-1 bg-green-500 rounded-full">
                                            <CheckCircle size={12} className="text-white" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col items-center text-center">
                                    <div className={`p-3 rounded-full mb-3 ${
                                        achievement.achieved
                                            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                            : 'bg-gray-300 dark:bg-gray-700'
                                    }`}>
                                        <div className={achievement.achieved ? 'text-white' : 'text-gray-500'}>
                                            {achievement.icon}
                                        </div>
                                    </div>
                                    <h3 className={`font-bold mb-1 ${
                                        achievement.achieved
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                        {achievement.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {achievement.description}
                                    </p>
                                    {/* Achievement progress indicator */}
                                    {!achievement.achieved && achievement.title === 'One Hour Focus' && (
                                        <div className="mt-2 w-full">
                                            <div className="text-xs text-gray-500 mb-1">
                                                Progress: {safeFormatDuration(Math.max(todayProgress, weekProgress))} / 1h
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                                <div 
                                                    className="bg-blue-500 h-1 rounded-full" 
                                                    style={{ 
                                                        width: `${Math.min((Math.max(todayProgress, weekProgress) / 3600) * 100, 100)}%` 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Add/Edit Goal Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={handleModalClose}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                                        </h2>
                                        <button
                                            onClick={handleModalClose}
                                            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Goal Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={editingGoal ? editingGoal.title : newGoal.title}
                                                onChange={(e) => editingGoal
                                                    ? setEditingGoal({ ...editingGoal, title: e.target.value })
                                                    : setNewGoal({ ...newGoal, title: e.target.value })
                                                }
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                placeholder="What do you want to achieve?"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Target Focus Time *
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="1440"
                                                    value={editingGoal 
                                                        ? Math.floor(editingGoal.target / 60)
                                                        : Math.floor(newGoal.targetTime / 60)
                                                    }
                                                    onChange={(e) => {
                                                        const minutes = parseInt(e.target.value) || 0;
                                                        if (editingGoal) {
                                                            setEditingGoal({ 
                                                                ...editingGoal, 
                                                                target: minutes * 60 
                                                            });
                                                        } else {
                                                            setNewGoal({ 
                                                                ...newGoal, 
                                                                targetTime: minutes * 60 
                                                            });
                                                        }
                                                    }}
                                                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                />
                                                <span className="text-gray-500">minutes</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Equivalent to: {safeFormatDuration((editingGoal ? editingGoal.target : newGoal.targetTime) || 0)}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Period *
                                            </label>
                                            <select
                                                value={editingGoal ? editingGoal.period : newGoal.period}
                                                onChange={(e) => editingGoal
                                                    ? setEditingGoal({ ...editingGoal, period: e.target.value })
                                                    : setNewGoal({ ...newGoal, period: e.target.value })
                                                }
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="streak">Streak (days)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={editingGoal ? editingGoal.description || '' : newGoal.description}
                                                onChange={(e) => editingGoal
                                                    ? setEditingGoal({ ...editingGoal, description: e.target.value })
                                                    : setNewGoal({ ...newGoal, description: e.target.value })
                                                }
                                                rows={3}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                                placeholder="Why is this goal important to you?"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={handleModalClose}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => editingGoal ? handleSaveGoal(editingGoal) : handleAddGoal()}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-lg"
                                        >
                                            {editingGoal ? 'Update Goal' : 'Create Goal'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GoalsPage;