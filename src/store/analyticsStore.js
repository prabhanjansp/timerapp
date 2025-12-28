import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

export const useAnalyticsStore = create(
    persist(
        (set, get) => ({
            // Analytics data
            dailyStats: {},
            weeklyStats: {},
            monthlyStats: {},
            productivityTrends: [],

            // Filters
            dateRange: {
                start: subDays(new Date(), 30),
                end: new Date()
            },

            // Actions
            updateAnalytics: (sessions) => {
                const dailyStats = calculateDailyStats(sessions);
                const weeklyStats = calculateWeeklyStats(sessions);
                const monthlyStats = calculateMonthlyStats(sessions);
                const productivityTrends = calculateProductivityTrends(sessions);

                set({
                    dailyStats,
                    weeklyStats,
                    monthlyStats,
                    productivityTrends
                });
            },

            setDateRange: (start, end) => set({
                dateRange: { start, end }
            }),

            // Getters
            getFocusTimeByType: (type, period = 'daily') => {
                const stats = get()[`${period}Stats`];
                if (!stats || !stats.byType) return 0;
                return stats.byType[type] || 0;
            },

            getAverageSessionLength: (period = 'daily') => {
                const stats = get()[`${period}Stats`];
                if (!stats || stats.sessionCount === 0) return 0;
                return stats.totalTime / stats.sessionCount;
            },

            getProductivityScore: (period = 'daily') => {
                const stats = get()[`${period}Stats`];
                if (!stats) return 0;

                // Calculate score based on total time, consistency, and satisfaction
                const timeScore = Math.min(stats.totalTime / 7200, 1) * 40; // Max 2 hours = 40 points
                const consistencyScore = (stats.sessionCount / 10) * 30; // Max 10 sessions = 30 points
                const satisfactionScore = (stats.avgSatisfaction / 5) * 30; // Max 5 satisfaction = 30 points

                return Math.round(timeScore + consistencyScore + satisfactionScore);
            },

            getTrendData: () => {
                return get().productivityTrends;
            }
        }),
        {
            name: 'analytics-storage'
        }
    )
);

// Helper functions
function calculateDailyStats(sessions) {
    const today = startOfDay(new Date());
    const todaySessions = sessions.filter(session =>
        isSameDay(new Date(session.startTime), today)
    );

    const totalTime = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    const sessionCount = todaySessions.length;
    const avgSatisfaction = sessionCount > 0
        ? todaySessions.reduce((sum, session) => sum + (session.satisfaction || 3), 0) / sessionCount
        : 0;

    const byType = todaySessions.reduce((acc, session) => {
        acc[session.type] = (acc[session.type] || 0) + session.duration;
        return acc;
    }, {});

    const peakHours = calculatePeakHours(todaySessions);

    return {
        totalTime,
        sessionCount,
        avgSatisfaction,
        byType,
        peakHours,
        date: today
    };
}

function calculateWeeklyStats(sessions) {
    const weekAgo = subDays(new Date(), 7);
    const weekSessions = sessions.filter(session =>
        new Date(session.startTime) >= weekAgo
    );

    const totalTime = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    const sessionCount = weekSessions.length;
    const avgSatisfaction = sessionCount > 0
        ? weekSessions.reduce((sum, session) => sum + (session.satisfaction || 3), 0) / sessionCount
        : 0;

    // Group by day
    const days = eachDayOfInterval({ start: weekAgo, end: new Date() });
    const byDay = days.map(day => {
        const daySessions = weekSessions.filter(session =>
            isSameDay(new Date(session.startTime), day)
        );

        return {
            date: day,
            totalTime: daySessions.reduce((sum, session) => sum + session.duration, 0),
            sessionCount: daySessions.length
        };
    });

    const byType = weekSessions.reduce((acc, session) => {
        acc[session.type] = (acc[session.type] || 0) + 1;
        return acc;
    }, {});

    return {
        totalTime,
        sessionCount,
        avgSatisfaction,
        byDay,
        byType,
        startDate: weekAgo,
        endDate: new Date()
    };
}

function calculateMonthlyStats(sessions) {
    const monthAgo = subDays(new Date(), 30);
    const monthSessions = sessions.filter(session =>
        new Date(session.startTime) >= monthAgo
    );

    const totalTime = monthSessions.reduce((sum, session) => sum + session.duration, 0);
    const sessionCount = monthSessions.length;
    const avgSatisfaction = sessionCount > 0
        ? monthSessions.reduce((sum, session) => sum + (session.satisfaction || 3), 0) / sessionCount
        : 0;

    // Group by week
    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
        const weekStart = subDays(monthAgo, i * 7);
        const weekEnd = subDays(weekStart, 7);
        const weekSessions = monthSessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate >= weekEnd && sessionDate < weekStart;
        });

        weeklyData.push({
            week: i + 1,
            totalTime: weekSessions.reduce((sum, session) => sum + session.duration, 0),
            sessionCount: weekSessions.length
        });
    }

    const byType = monthSessions.reduce((acc, session) => {
        acc[session.type] = (acc[session.type] || 0) + session.duration;
        return acc;
    }, {});

    return {
        totalTime,
        sessionCount,
        avgSatisfaction,
        weeklyData,
        byType,
        startDate: monthAgo,
        endDate: new Date()
    };
}

function calculateProductivityTrends(sessions) {
    const last30Days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date()
    });

    return last30Days.map(day => {
        const daySessions = sessions.filter(session =>
            isSameDay(new Date(session.startTime), day)
        );

        const totalTime = daySessions.reduce((sum, session) => sum + session.duration, 0);
        const sessionCount = daySessions.length;
        const avgSatisfaction = sessionCount > 0
            ? daySessions.reduce((sum, session) => sum + (session.satisfaction || 3), 0) / sessionCount
            : null;

        // Calculate focus score (0-100)
        let focusScore = 0;
        if (sessionCount > 0) {
            const timeScore = Math.min(totalTime / 14400, 1) * 60; // 4 hours max = 60 points
            const consistencyScore = Math.min(sessionCount / 8, 1) * 40; // 8 sessions max = 40 points
            focusScore = Math.round(timeScore + consistencyScore);
        }

        return {
            date: day,
            dateFormatted: format(day, 'MMM dd'),
            totalTime,
            sessionCount,
            avgSatisfaction,
            focusScore
        };
    });
}

function calculatePeakHours(sessions) {
    const hours = Array(24).fill(0);

    sessions.forEach(session => {
        const hour = new Date(session.startTime).getHours();
        hours[hour] += session.duration;
    });

    return hours;
}