import { useMemo } from 'react';
import { useTimerStore } from '../store/timerStore';
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays } from 'date-fns';

export const useAnalytics = () => {
    const { sessions, dailyGoal, weeklyGoal } = useTimerStore();

    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 6);

    // Today's stats
    const todayStats = useMemo(() => {
        const todaySessions = sessions.filter(session => {
            const sessionDate = startOfDay(new Date(session.startTime));
            return sessionDate.getTime() === today.getTime();
        });

        const totalTime = todaySessions.reduce((sum, session) => sum + session.duration, 0);
        const goalProgress = dailyGoal > 0 ? (totalTime / dailyGoal) * 100 : 0;
        const sessionCount = todaySessions.length;
        const avgSatisfaction = todaySessions.length > 0
            ? todaySessions.reduce((sum, session) => sum + (session.satisfaction || 3), 0) / todaySessions.length
            : 0;

        return {
            totalTime,
            goalProgress,
            sessionCount,
            avgSatisfaction,
            sessions: todaySessions
        };
    }, [sessions, today, dailyGoal]);

    // Weekly stats
    const weeklyStats = useMemo(() => {
        const weekSessions = sessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate >= weekAgo && sessionDate <= endOfDay(today);
        });

        // Group by day
        const days = eachDayOfInterval({ start: weekAgo, end: today });
        const dailyData = days.map(day => {
            const daySessions = weekSessions.filter(session => {
                const sessionDate = startOfDay(new Date(session.startTime));
                return sessionDate.getTime() === day.getTime();
            });

            const totalTime = daySessions.reduce((sum, session) => sum + session.duration, 0);

            return {
                date: format(day, 'EEE'),
                fullDate: day,
                totalTime,
                sessionCount: daySessions.length,
                goalProgress: dailyGoal > 0 ? (totalTime / dailyGoal) * 100 : 0
            };
        });

        const totalWeekTime = weekSessions.reduce((sum, session) => sum + session.duration, 0);
        const weeklyGoalProgress = weeklyGoal > 0 ? (totalWeekTime / weeklyGoal) * 100 : 0;

        // Most productive day
        const mostProductiveDay = dailyData.reduce((max, day) =>
            day.totalTime > max.totalTime ? day : max,
            { totalTime: 0 }
        );

        // Session type distribution
        const typeDistribution = weekSessions.reduce((acc, session) => {
            acc[session.type] = (acc[session.type] || 0) + 1;
            return acc;
        }, {});

        return {
            dailyData,
            totalWeekTime,
            weeklyGoalProgress,
            mostProductiveDay,
            typeDistribution,
            totalSessions: weekSessions.length
        };
    }, [sessions, weekAgo, today, dailyGoal, weeklyGoal]);

    // Productivity trends
    const productivityTrends = useMemo(() => {
        const last30Days = subDays(today, 29);
        const recentSessions = sessions.filter(session =>
            new Date(session.startTime) >= last30Days
        );

        // Group by day
        const days = eachDayOfInterval({ start: last30Days, end: today });
        const trendData = days.map(day => {
            const daySessions = recentSessions.filter(session => {
                const sessionDate = startOfDay(new Date(session.startTime));
                return sessionDate.getTime() === day.getTime();
            });

            const totalTime = daySessions.reduce((sum, session) => sum + session.duration, 0);
            const avgSatisfaction = daySessions.length > 0
                ? daySessions.reduce((sum, session) => sum + (session.satisfaction || 3), 0) / daySessions.length
                : null;

            return {
                date: format(day, 'MMM dd'),
                fullDate: day,
                totalTime,
                sessionCount: daySessions.length,
                avgSatisfaction
            };
        });

        return trendData;
    }, [sessions, today]);

    return {
        todayStats,
        weeklyStats,
        productivityTrends,
        totalSessions: sessions.length
    };
};