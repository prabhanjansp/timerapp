export const TIMER_TYPES = {
    STUDY: {
        id: 'study',
        label: 'Study',
        color: 'blue',
        icon: '📚',
        description: 'Academic learning and research',
        defaultDuration: 1500 // 25 minutes
    },
    WORK: {
        id: 'work',
        label: 'Work',
        color: 'green',
        icon: '💼',
        description: 'Professional tasks and projects',
        defaultDuration: 3000 // 50 minutes
    },
    FOCUS: {
        id: 'focus',
        label: 'Focus',
        color: 'purple',
        icon: '🎯',
        description: 'Deep concentrated work',
        defaultDuration: 1800 // 30 minutes
    },
    BREAK: {
        id: 'break',
        label: 'Break',
        color: 'yellow',
        icon: '☕',
        description: 'Rest and recharge',
        defaultDuration: 300 // 5 minutes
    }
};

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

export const SOUNDS = {
    COMPLETE: 'complete',
    TICK: 'tick',
    ALERT: 'alert'
};

export const KEYBOARD_SHORTCUTS = {
    START_PAUSE: ' ',
    STOP: 'Escape',
    STUDY_MODE: '1',
    WORK_MODE: '2',
    FOCUS_MODE: '3',
    BREAK_MODE: '4',
    RESET: 'r',
    QUICK_START: 's'
};

export const STORAGE_KEYS = {
    SESSIONS: 'timer_sessions',
    SETTINGS: 'timer_settings',
    GOALS: 'timer_goals',
    ANALYTICS: 'timer_analytics',
    THEME: 'timer_theme'
};

export const DATE_FORMATS = {
    SHORT: 'MMM dd',
    MEDIUM: 'MMM dd, yyyy',
    LONG: 'EEEE, MMMM dd, yyyy',
    TIME: 'HH:mm',
    TIME_12: 'hh:mm a',
    DATETIME: 'MMM dd, yyyy HH:mm'
};

export const ACHIEVEMENTS = [
    {
        id: 'first_session',
        title: 'Getting Started',
        description: 'Complete your first focus session',
        icon: '🚀',
        threshold: 1
    },
    {
        id: 'one_hour',
        title: 'Hour Focused',
        description: 'Accumulate 1 hour of focused time',
        icon: '⏰',
        threshold: 3600
    },
    {
        id: 'daily_streak_3',
        title: 'Consistency',
        description: 'Maintain a 3-day focus streak',
        icon: '🔥',
        threshold: 3
    },
    {
        id: 'daily_streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day focus streak',
        icon: '🏆',
        threshold: 7
    },
    {
        id: 'daily_streak_30',
        title: 'Month Master',
        description: 'Maintain a 30-day focus streak',
        icon: '👑',
        threshold: 30
    },
    {
        id: 'goal_master',
        title: 'Goal Crusher',
        description: 'Achieve daily goal 5 times',
        icon: '🎯',
        threshold: 5
    },
    {
        id: 'marathon',
        title: 'Focus Marathon',
        description: 'Complete a 2-hour focus session',
        icon: '🏃‍♂️',
        threshold: 7200
    }
];

export const GOAL_PERIODS = [
    { id: 'daily', label: 'Daily', description: 'Reset every day' },
    { id: 'weekly', label: 'Weekly', description: 'Reset every week' },
    { id: 'monthly', label: 'Monthly', description: 'Reset every month' }
];

export const SATISFACTION_LEVELS = [
    { value: 1, label: 'Poor', emoji: '😞' },
    { value: 2, label: 'Fair', emoji: '😐' },
    { value: 3, label: 'Good', emoji: '🙂' },
    { value: 4, label: 'Very Good', emoji: '😊' },
    { value: 5, label: 'Excellent', emoji: '😁' }
];