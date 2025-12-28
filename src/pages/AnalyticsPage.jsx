import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Download,
    Target,
    Clock,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Activity,
    Award,
    Zap,
    AlertCircle,
    Users,
    TrendingDown,
    Battery,
    CalendarDays,
    TrendingUp as TrendingUpIcon,
    Clock as ClockIcon,
    Target as TargetIcon
} from 'lucide-react';
import { useTimerStore } from '../store/timerStore';
import { formatDuration } from '../utils/timeFormatter';

// Direct imports for reliability
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const AnalyticsPage = () => {
    const [dateRange, setDateRange] = useState('week');
    const [chartType, setChartType] = useState('line');
    const [activeMetric, setActiveMetric] = useState('hours'); // 'hours' or 'sessions'

    const { sessions, getTodaySessions, getWeekSessions } = useTimerStore();

    // Generate chart data with improved performance
    const chartData = useMemo(() => {
        const days = dateRange === 'week' ? 7 : 30;
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayStart = new Date(date);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const daySessions = sessions.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate >= dayStart && sessionDate <= dayEnd;
            });

            const totalTime = daySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
            const sessionCount = daySessions.length;
            const avgSatisfaction = sessionCount > 0
                ? daySessions.reduce((sum, session) => sum + (session.satisfaction || 3), 0) / sessionCount
                : 0;

            data.push({
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.getDate(),
                fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                hours: parseFloat((totalTime / 3600).toFixed(2)), // More precise
                sessions: sessionCount,
                minutes: Math.floor(totalTime / 60),
                satisfaction: parseFloat(avgSatisfaction.toFixed(1)),
                timestamp: date.getTime()
            });
        }

        return data;
    }, [sessions, dateRange]);

    // Session type distribution with fallback colors
    const typeDistribution = useMemo(() => {
        const typeConfig = {
            study: { name: 'Study', color: '#3B82F6', icon: '📚' },
            work: { name: 'Work', color: '#10B981', icon: '💼' },
            focus: { name: 'Focus', color: '#8B5CF6', icon: '🎯' },
            break: { name: 'Break', color: '#F59E0B', icon: '☕' },
            exercise: { name: 'Exercise', color: '#EF4444', icon: '💪' },
            creative: { name: 'Creative', color: '#EC4899', icon: '🎨' }
        };

        const distribution = {};
        let totalHours = 0;

        sessions.forEach(session => {
            const type = session.type || 'focus';
            const config = typeConfig[type] || {
                name: type.charAt(0).toUpperCase() + type.slice(1),
                color: '#6B7280',
                icon: '📊'
            };

            if (!distribution[type]) {
                distribution[type] = {
                    ...config,
                    value: 0,
                    percentage: 0
                };
            }

            const hours = (session.duration || 0) / 3600;
            distribution[type].value += hours;
            totalHours += hours;
        });

        // Calculate percentages
        Object.values(distribution).forEach(type => {
            type.percentage = totalHours > 0 ? (type.value / totalHours) * 100 : 0;
        });

        return Object.values(distribution).sort((a, b) => b.value - a.value);
    }, [sessions]);

    // Calculate metrics with improved accuracy
    const metrics = useMemo(() => {
        const validSessions = sessions.filter(s => s.duration > 0);
        const totalTime = validSessions.reduce((sum, session) => sum + session.duration, 0);
        const totalSessions = validSessions.length;
        const avgSessionDuration = totalSessions > 0 ? totalTime / totalSessions : 0;

        const satisfactionScores = validSessions
            .filter(s => s.satisfaction && s.satisfaction > 0)
            .map(s => s.satisfaction);

        const avgSatisfaction = satisfactionScores.length > 0
            ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
            : 0;

        // Improved productivity score calculation
        const baseScore = Math.min((totalTime / 36000) * 100, 100);
        const consistencyBonus = totalSessions > 10 ? 10 : totalSessions > 5 ? 5 : 0;
        const satisfactionBonus = avgSatisfaction > 3.5 ? 5 : avgSatisfaction > 2.5 ? 2 : 0;

        const productivityScore = Math.min(
            Math.round(baseScore + consistencyBonus + satisfactionBonus),
            100
        );

        // Calculate completion rate
        const completedSessions = validSessions.filter(s => s.completed).length;
        const completionRate = totalSessions > 0 ?
            Math.round((completedSessions / totalSessions) * 100) : 0;

        return {
            totalTime,
            totalSessions,
            avgSessionDuration,
            avgSatisfaction: avgSatisfaction.toFixed(1),
            productivityScore,
            completionRate
        };
    }, [sessions]);

    // Today's stats with memoization
    const todayStats = useMemo(() => {
        const todaySessions = getTodaySessions();
        const totalTime = todaySessions.reduce((sum, session) => sum + session.duration, 0);
        const completedSessions = todaySessions.filter(s => s.completed).length;

        return {
            totalTime,
            sessionCount: todaySessions.length,
            completedSessions,
            goalProgress: Math.min((totalTime / 7200) * 100, 100), // 2 hour goal
            completionRate: todaySessions.length > 0 ?
                Math.round((completedSessions / todaySessions.length) * 100) : 0
        };
    }, [getTodaySessions]);

    // Weekly stats
    const weeklyStats = useMemo(() => {
        const weekSessions = getWeekSessions();
        const totalTime = weekSessions.reduce((sum, session) => sum + session.duration, 0);
        const completedSessions = weekSessions.filter(s => s.completed).length;

        return {
            totalWeekTime: totalTime,
            totalSessions: weekSessions.length,
            completedSessions,
            weeklyGoalProgress: Math.min((totalTime / 18000) * 100, 100), // 5 hour goal
            dailyAverage: totalTime / 7,
            completionRate: weekSessions.length > 0 ?
                Math.round((completedSessions / weekSessions.length) * 100) : 0
        };
    }, [getWeekSessions]);

    // Trend analysis
    const trendAnalysis = useMemo(() => {
        if (chartData.length < 2) return { trend: 'neutral', change: 0 };

        const recentData = chartData.slice(-7);
        if (recentData.length < 2) return { trend: 'neutral', change: 0 };

        const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
        const secondHalf = recentData.slice(Math.floor(recentData.length / 2));

        if (firstHalf.length === 0 || secondHalf.length === 0) {
            return { trend: 'neutral', change: 0 };
        }

        const avgFirst = firstHalf.reduce((sum, day) => sum + day.hours, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((sum, day) => sum + day.hours, 0) / secondHalf.length;

        const change = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;

        return {
            trend: change > 10 ? 'up' : change < -10 ? 'down' : 'neutral',
            change: Math.abs(change).toFixed(1)
        };
    }, [chartData]);

    // Handle export data
    const handleExportData = useCallback(() => {
        try {
            const data = {
                summary: metrics,
                sessions: sessions.map(s => ({
                    ...s,
                    startTime: new Date(s.startTime).toISOString(),
                    endTime: s.endTime ? new Date(s.endTime).toISOString() : null
                })),
                chartData,
                typeDistribution,
                generatedAt: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json;charset=utf-8'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `focus_analytics_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data. Please try again.');
        }
    }, [metrics, sessions, chartData, typeDistribution]);

    // Custom tooltip with improved styling
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                >
                    <p className="font-semibold text-gray-800 dark:text-white mb-2">{label}</p>
                    {payload.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {item.name}:
                            </span>
                            <span className="text-sm font-bold ml-auto">
                                {typeof item.value === 'number'
                                    ? item.name === 'hours'
                                        ? `${item.value.toFixed(1)}h`
                                        : item.name === 'satisfaction'
                                            ? `${item.value.toFixed(1)}/5`
                                            : item.value.toString()
                                    : item.value
                                }
                            </span>
                        </div>
                    ))}
                </motion.div>
            );
        }
        return null;
    };

    // Handle empty state
    const hasData = sessions.length > 0;
    const showPlaceholderData = !hasData || chartData.every(item => item.hours === 0);

    // Generate placeholder data for empty states
    const placeholderData = useMemo(() => {
        const days = dateRange === 'week' ? 7 : 30;
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            // Generate realistic placeholder data
            const hours = 2 + Math.sin(i) * 1.5 + Math.random();
            const sessions = Math.floor(1 + Math.random() * 4);

            data.push({
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.getDate(),
                fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                hours: parseFloat(hours.toFixed(1)),
                sessions: sessions,
                minutes: Math.floor(hours * 60),
                satisfaction: parseFloat((3 + Math.random()).toFixed(1))
            });
        }

        return data;
    }, [dateRange]);

    const displayData = showPlaceholderData ? placeholderData : chartData;

    // Find best day
    const bestDay = useMemo(() => {
        return displayData.reduce((max, day) => day.hours > max.hours ? day : max, displayData[0]);
    }, [displayData]);

    // Calculate consistency
    const consistency = useMemo(() => {
        const uniqueDays = new Set(sessions.map(s => new Date(s.startTime).toDateString())).size;
        const totalDays = dateRange === 'week' ? 7 : 30;
        const consistencyRate = Math.round((uniqueDays / totalDays) * 100);
        return { rate: consistencyRate, days: uniqueDays };
    }, [sessions, dateRange]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    // Metrics configuration with fixed icon colors
    const keyMetrics = [
        {
            title: "Total Focus Time",
            value: formatDuration(metrics.totalTime),
            icon: ClockIcon,
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-500',
            trend: todayStats.sessionCount > 0 ? `↑ ${formatDuration(todayStats.totalTime)} today` : 'No sessions today',
            subtitle: `${metrics.totalSessions} sessions`,
            trendIcon: todayStats.sessionCount > 0 ? TrendingUp : Battery
        },
        {
            title: "Total Sessions",
            value: metrics.totalSessions,
            icon: Activity,
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-500',
            trend: `${todayStats.sessionCount} today`,
            subtitle: `${metrics.completionRate}% completed`,
            trendIcon: CalendarDays
        },
        {
            title: "Avg Satisfaction",
            value: `${metrics.avgSatisfaction}/5`,
            icon: Award,
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            iconColor: 'text-purple-500',
            trend: "Last 7 days",
            subtitle: "Session feedback",
            trendIcon: Calendar
        },
        {
            title: "Productivity Score",
            value: `${metrics.productivityScore}/100`,
            icon: TrendingUpIcon,
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            iconColor: 'text-yellow-500',
            trend: trendAnalysis.trend === 'up' ? "Improving" : "Steady",
            subtitle: "Overall performance",
            trendIcon: trendAnalysis.trend === 'up' ? TrendingUp : TargetIcon
        }
    ];

    // Stats configuration
    const detailedStats = [
        {
            title: "Today's Performance",
            icon: Target,
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-500',
            progressColor: 'bg-gradient-to-r from-blue-400 to-blue-600',
            value: formatDuration(todayStats.totalTime),
            subtitle: `${todayStats.sessionCount} sessions`,
            progress: todayStats.goalProgress,
            extra: `${todayStats.completionRate}% completed`
        },
        {
            title: "Weekly Summary",
            icon: Calendar,
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-500',
            progressColor: 'bg-gradient-to-r from-green-400 to-green-600',
            value: formatDuration(weeklyStats.totalWeekTime),
            subtitle: `${weeklyStats.totalSessions} sessions`,
            progress: weeklyStats.weeklyGoalProgress,
            extra: `${formatDuration(weeklyStats.dailyAverage)} daily avg`
        },
        {
            title: "Consistency",
            icon: Users,
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            iconColor: 'text-purple-500',
            progressColor: 'bg-gradient-to-r from-purple-400 to-purple-600',
            value: `${consistency.rate}%`,
            subtitle: "Active days",
            progress: consistency.rate,
            extra: `${consistency.days} days with sessions`
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-8"
                >
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Analytics Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Track your productivity and focus patterns
                                {showPlaceholderData && (
                                    <span className="ml-2 text-amber-600 dark:text-amber-400 flex items-center gap-1 text-sm">
                                        <AlertCircle size={14} />
                                        Using demo data
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm">
                                <Calendar className="text-gray-500" size={20} />
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    <option value="week">Last 7 Days</option>
                                    <option value="month">Last 30 Days</option>
                                </select>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExportData}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                            >
                                <Download size={20} />
                                Export Data
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Trend Indicator */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <div className={`p-2 rounded-lg ${trendAnalysis.trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' :
                                    trendAnalysis.trend === 'down' ? 'bg-red-100 dark:bg-red-900/30' :
                                        'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                {trendAnalysis.trend === 'up' ?
                                    <TrendingUp className="text-green-600 dark:text-green-400" size={20} /> :
                                    trendAnalysis.trend === 'down' ?
                                        <TrendingDown className="text-red-600 dark:text-red-400" size={20} /> :
                                        <Activity className="text-gray-600 dark:text-gray-400" size={20} />
                                }
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Trend</p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {trendAnalysis.trend === 'up' ? `↑ ${trendAnalysis.change}% increase` :
                                        trendAnalysis.trend === 'down' ? `↓ ${trendAnalysis.change}% decrease` :
                                            '↔ Stable performance'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Key Metrics */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {keyMetrics.map((metric, index) => (
                        <motion.div
                            key={metric.title}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                                        {metric.value}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {metric.subtitle}
                                    </p>
                                </div>
                                <div className={`relative p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform`}>
                                    <metric.icon className={metric.iconColor} size={24} />
                                    <div className="absolute -top-1 -right-1 text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full shadow flex items-center gap-1">
                                        {metric.trendIcon && (
                                            <metric.trendIcon size={10} className={
                                                metric.iconColor.includes('blue') ? 'text-blue-500' :
                                                    metric.iconColor.includes('green') ? 'text-green-500' :
                                                        metric.iconColor.includes('purple') ? 'text-purple-500' :
                                                            'text-yellow-500'
                                            } />
                                        )}
                                        <span className="text-xs">{metric.trend}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Charts Section */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    {/* Main Chart */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 col-span-1 lg:col-span-2"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    Focus Time Trend
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Track your progress over time
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    {['hours', 'sessions'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setActiveMetric(type)}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeMetric === type
                                                    ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                                                }`}
                                        >
                                            {type === 'hours' ? 'Hours' : 'Sessions'}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    {['line', 'bar', 'area'].map((type) => (
                                        <motion.button
                                            key={type}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setChartType(type)}
                                            className={`p-2 rounded-md ${chartType === type
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                                                }`}
                                        >
                                            {type === 'line' && <LineChartIcon size={20} />}
                                            {type === 'bar' && <BarChart3 size={20} />}
                                            {type === 'area' && <Activity size={20} />}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'line' ? (
                                    <LineChart
                                        data={displayData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                            strokeOpacity={0.5}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#6b7280"
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey={activeMetric}
                                            name={activeMetric === 'hours' ? 'Focus Hours' : 'Sessions'}
                                            stroke={activeMetric === 'hours' ? "#3B82F6" : "#10B981"}
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2 }}
                                            activeDot={{ r: 6 }}
                                            strokeLinecap="round"
                                        />
                                        {activeMetric === 'hours' && (
                                            <Line
                                                type="monotone"
                                                dataKey="satisfaction"
                                                name="Satisfaction"
                                                stroke="#F59E0B"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={{ r: 3 }}
                                            />
                                        )}
                                    </LineChart>
                                ) : chartType === 'bar' ? (
                                    <BarChart
                                        data={displayData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                            strokeOpacity={0.5}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#6b7280"
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey={activeMetric}
                                            name={activeMetric === 'hours' ? 'Focus Hours' : 'Sessions'}
                                            fill={activeMetric === 'hours' ? "#3B82F6" : "#10B981"}
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                ) : (
                                    <AreaChart
                                        data={displayData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                            strokeOpacity={0.5}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#6b7280"
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey={activeMetric}
                                            name={activeMetric === 'hours' ? 'Focus Hours' : 'Sessions'}
                                            stroke={activeMetric === 'hours' ? "#3B82F6" : "#10B981"}
                                            fill={activeMetric === 'hours' ? "#3B82F6" : "#10B981"}
                                            fillOpacity={0.3}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Session Type Distribution */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                            Session Type Distribution
                        </h2>

                        {typeDistribution.length > 0 ? (
                            <>
                                <div className="h-64 mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={typeDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={({ name, percentage }) =>
                                                    percentage > 5 ? `${name}: ${percentage.toFixed(1)}%` : ''
                                                }
                                                outerRadius={80}
                                                innerRadius={40}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {typeDistribution.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                        stroke="#fff"
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [`${parseFloat(value).toFixed(1)} hours`, 'Duration']}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    borderColor: '#e5e7eb',
                                                    borderRadius: '0.5rem',
                                                    padding: '10px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2">
                                    {typeDistribution.map((type, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: type.color }}
                                                />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    {type.icon} {type.name}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-800 dark:text-white">
                                                    {type.value.toFixed(1)}h
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {type.percentage.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                <PieChartIcon size={48} className="mb-4 opacity-50" />
                                <p>No session type data available</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Productivity Insights */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                            Productivity Insights
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-gray-600 dark:text-gray-400">Productivity Score</span>
                                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {metrics.productivityScore}/100
                                    </span>
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metrics.productivityScore}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Avg Session
                                    </div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {formatDuration(metrics.avgSessionDuration)}
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Daily Average
                                    </div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {formatDuration(metrics.totalTime / (dateRange === 'week' ? 7 : 30))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Completion Rate
                                    </div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {metrics.completionRate}%
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Best Day
                                    </div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {bestDay?.hours?.toFixed(1) || 0}h
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {bestDay?.name || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Detailed Stats */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                        Detailed Statistics
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {detailedStats.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                whileHover={{ y: -5 }}
                                className="p-5 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <stat.icon className={stat.iconColor} size={20} />
                                    </div>
                                    <h3 className="font-medium text-gray-800 dark:text-white">{stat.title}</h3>
                                </div>
                                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {stat.subtitle} • {stat.extra}
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stat.progress}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                        className={`h-full ${stat.progressColor}`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Data Status */}
                {showPlaceholderData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
                            <div>
                                <p className="font-medium text-amber-800 dark:text-amber-300">
                                    {hasData ? 'Limited Data Available' : 'Demo Data Active'}
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    {hasData
                                        ? 'You have some sessions recorded. Add more sessions to see detailed analytics.'
                                        : 'Start tracking sessions to see your real analytics data. Currently showing demo data.'
                                    }
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default AnalyticsPage;