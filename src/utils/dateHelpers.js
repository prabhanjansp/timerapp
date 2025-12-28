import {
    format,
    parseISO,
    startOfDay,
    endOfDay,
    isSameDay,
    isSameWeek,
    isSameMonth,
    eachDayOfInterval,
    subDays,
    addDays,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    differenceInSeconds,
    formatDistanceToNow,
    formatRelative
} from 'date-fns';
// import { formatDuration } from '../utils/timeFormatter';s


export const getTodayRange = () => {
    const today = new Date();
    return {
        start: startOfDay(today),
        end: endOfDay(today)
    };
};

export const getWeekRange = () => {
    const today = new Date();
    const start = subDays(today, 6);
    return {
        start: startOfDay(start),
        end: endOfDay(today)
    };
};

export const getMonthRange = () => {
    const today = new Date();
    const start = subDays(today, 29);
    return {
        start: startOfDay(start),
        end: endOfDay(today)
    };
};

export const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMinutes = differenceInMinutes(now, date);
    const diffHours = differenceInHours(now, date);
    const diffDays = differenceInDays(now, date);

    if (diffMinutes < 1) {
        return 'just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
        return format(date, 'MMM dd, yyyy');
    }
};

// Fixed formatDate function with multiple format options
export const formatDate = (date, formatType = 'default') => {
    if (!date) return 'N/A';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    switch (formatType) {
        case 'short':
            return format(dateObj, 'MMM dd');
        case 'medium':
            return format(dateObj, 'MMM dd, yyyy');
        case 'long':
            return format(dateObj, 'EEEE, MMMM dd, yyyy');
        case 'time':
            return format(dateObj, 'HH:mm');
        case 'time12':
            return format(dateObj, 'hh:mm a');
        case 'datetime':
            return format(dateObj, 'MMM dd, yyyy HH:mm');
        case 'datetime12':
            return format(dateObj, 'MMM dd, yyyy hh:mm a');
        case 'full':
            return format(dateObj, 'EEEE, MMMM dd, yyyy hh:mm a');
        case 'relative':
            return formatRelativeTime(dateObj);
        case 'iso':
            return dateObj.toISOString();
        case 'input':
            return format(dateObj, 'yyyy-MM-dd');
        case 'input-time':
            return format(dateObj, 'HH:mm');
        default:
            return format(dateObj, 'MMM dd, yyyy');
    }
};

export const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
};

export const formatShortDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
};

export const groupSessionsByDay = (sessions) => {
    if (!sessions || !Array.isArray(sessions)) return [];

    const grouped = {};

    sessions.forEach(session => {
        if (!session.startTime) return;

        try {
            const date = format(startOfDay(new Date(session.startTime)), 'yyyy-MM-dd');
            if (!grouped[date]) {
                grouped[date] = {
                    date: new Date(session.startTime),
                    dateString: date,
                    sessions: [],
                    totalTime: 0,
                    sessionCount: 0,
                    totalSatisfaction: 0
                };
            }

            grouped[date].sessions.push(session);
            grouped[date].totalTime += session.duration || 0;
            grouped[date].sessionCount += 1;
            grouped[date].totalSatisfaction += session.satisfaction || 0;
        } catch (error) {
            console.error('Error grouping session:', error);
        }
    });

    // Convert to array and sort by date (newest first)
    return Object.values(grouped)
        .sort((a, b) => b.date - a.date)
        .map(group => ({
            ...group,
            avgSatisfaction: group.sessionCount > 0
                ? group.totalSatisfaction / group.sessionCount
                : 0
        }));
};

export const getDateLabels = (startDate, endDate, formatStr = 'MMM dd') => {
    try {
        const days = eachDayOfInterval({
            start: new Date(startDate),
            end: new Date(endDate)
        });
        return days.map(day => format(day, formatStr));
    } catch (error) {
        console.error('Error generating date labels:', error);
        return [];
    }
};

export const calculateStreak = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;

    // Get unique session dates sorted from newest to oldest
    const sessionDates = sessions
        .map(s => {
            try {
                return s.startTime ? startOfDay(new Date(s.startTime)) : null;
            } catch {
                return null;
            }
        })
        .filter(date => date !== null)
        .filter((date, index, self) =>
            self.findIndex(d => isSameDay(d, date)) === index
        )
        .sort((a, b) => b - a);

    if (sessionDates.length === 0) return 0;

    let streak = 0;
    let currentDate = startOfDay(new Date());

    for (const sessionDate of sessionDates) {
        if (isSameDay(sessionDate, currentDate)) {
            // Session today
            streak++;
            currentDate = subDays(currentDate, 1);
        } else if (isSameDay(sessionDate, subDays(currentDate, streak))) {
            // Session yesterday or previous day in streak
            streak++;
            currentDate = sessionDate;
        } else {
            // Streak broken
            break;
        }
    }

    return streak;
};

export const getDayName = (date, formatType = 'short') => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        return format(dateObj, formatType === 'short' ? 'EEE' : 'EEEE');
    } catch {
        return 'Invalid Date';
    }
};

export const isWeekend = (date) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return false;

        const day = dateObj.getDay();
        return day === 0 || day === 6;
    } catch {
        return false;
    }
};

export const getMonthName = (date, formatType = 'short') => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        return format(dateObj, formatType === 'short' ? 'MMM' : 'MMMM');
    } catch {
        return 'Invalid Date';
    }
};

export const getTimeOfDay = (date) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        const hour = dateObj.getHours();

        if (hour < 5) return 'Night';
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        if (hour < 21) return 'Evening';
        return 'Night';
    } catch {
        return 'Invalid Date';
    }
};

export const calculateAge = (date) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        const now = new Date();
        const diffMs = now - dateObj;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
        return 'Invalid Date';
    }
};

export const parseDateString = (dateString) => {
    try {
        // Try ISO format first
        let date = new Date(dateString);
        if (!isNaN(date.getTime())) return date;

        // Try common formats
        const formats = [
            'yyyy-MM-dd',
            'MM/dd/yyyy',
            'dd/MM/yyyy',
            'yyyy/MM/dd'
        ];

        for (const formatStr of formats) {
            try {
                date = parseISO(dateString);
                if (!isNaN(date.getTime())) return date;
            } catch {
                continue;
            }
        }

        return new Date(NaN); // Invalid date
    } catch {
        return new Date(NaN);
    }
};

export const isValidDate = (date) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return !isNaN(dateObj.getTime());
    } catch {
        return false;
    }
};

export const getWeekNumber = (date) => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 0;

        const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
        const pastDaysOfYear = (dateObj - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    } catch {
        return 0;
    }
};

export const formatTimeRange = (startDate, endDate) => {
    try {
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return 'Invalid Date Range';
        }

        if (isSameDay(start, end)) {
            return `${format(start, 'MMM dd, yyyy')} ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
        } else {
            return `${format(start, 'MMM dd, HH:mm')} - ${format(end, 'MMM dd, HH:mm')}`;
        }
    } catch {
        return 'Invalid Date Range';
    }
};

// Utility to get start and end of different periods
export const getPeriodRange = (period = 'today') => {
    const now = new Date();

    switch (period) {
        case 'today':
            return {
                start: startOfDay(now),
                end: endOfDay(now),
                label: 'Today'
            };
        case 'yesterday':
            const yesterday = subDays(now, 1);
            return {
                start: startOfDay(yesterday),
                end: endOfDay(yesterday),
                label: 'Yesterday'
            };
        case 'week':
            const weekStart = subDays(now, now.getDay());
            return {
                start: startOfDay(weekStart),
                end: endOfDay(now),
                label: 'This Week'
            };
        case 'lastWeek':
            const lastWeekStart = subDays(now, now.getDay() + 7);
            const lastWeekEnd = subDays(lastWeekStart, 1);
            return {
                start: startOfDay(lastWeekStart),
                end: endOfDay(lastWeekEnd),
                label: 'Last Week'
            };
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
                start: startOfDay(monthStart),
                end: endOfDay(now),
                label: 'This Month'
            };
        case 'lastMonth':
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            return {
                start: startOfDay(lastMonthStart),
                end: endOfDay(lastMonthEnd),
                label: 'Last Month'
            };
        case 'year':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return {
                start: startOfDay(yearStart),
                end: endOfDay(now),
                label: 'This Year'
            };
        default:
            return {
                start: startOfDay(now),
                end: endOfDay(now),
                label: 'Today'
            };
    }
};

// Calculate time difference in human readable format
export const timeDifference = (date1, date2) => {
    try {
        const d1 = date1 instanceof Date ? date1 : new Date(date1);
        const d2 = date2 instanceof Date ? date2 : new Date(date2);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            return 'Invalid dates';
        }

        const diffSeconds = Math.abs(differenceInSeconds(d1, d2));

        if (diffSeconds < 60) {
            return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`;
        } else if (diffSeconds < 3600) {
            const minutes = Math.floor(diffSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (diffSeconds < 86400) {
            const hours = Math.floor(diffSeconds / 3600);
            const minutes = Math.floor((diffSeconds % 3600) / 60);
            return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            const days = Math.floor(diffSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''}`;
        }
    } catch {
        return 'Invalid dates';
    }
};