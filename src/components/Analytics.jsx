import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTimerStore } from '../store/timerStore';
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
    ResponsiveContainer
} from 'recharts';
import { Download, Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const Analytics = () => {
    const [dateRange, setDateRange] = useState('week');
    const { sessions, exportSessions } = useTimerStore();

    const processData = () => {
        const now = new Date();
        let startDate = new Date();

        switch (dateRange) {
            case 'week': startDate.setDate(now.getDate() - 7); break;
            case 'month': startDate.setMonth(now.getMonth() - 1); break;
            case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
        }

        const filtered = sessions.filter(s => new Date(s.startTime) >= startDate);

        // Daily focus time
        const dailyData = filtered.reduce((acc, session) => {
            const date = new Date(session.startTime).toLocaleDateString();
            if (!acc[date]) acc[date] = { date, total: 0 };
            acc[date].total += session.duration / 3600; // Convert to hours
            return acc;
        }, {});

        // Session type distribution
        const typeData = filtered.reduce((acc, session) => {
            acc[session.type] = (acc[session.type] || 0) + 1;
            return acc;
        }, {});

        // Productivity trends
        const productivityData = filtered.map(session => ({
            date: new Date(session.startTime).toLocaleDateString(),
            duration: session.duration / 60,
            satisfaction: session.satisfaction || 3
        }));

        return {
            daily: Object.values(dailyData),
            types: Object.entries(typeData).map(([type, count]) => ({ type, count })),
            productivity: productivityData
        };
    };

    const data = processData();
    const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

    const handleExport = (format) => {
        const exportData = exportSessions();
        const blob = new Blob([exportData[format]], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sessions_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Analytics Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Track your focus and productivity trends</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="text-gray-500" />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300"
                            >
                                <option value="week">Last 7 days</option>
                                <option value="month">Last 30 days</option>
                                <option value="year">Last year</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('json')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                <Download size={20} />
                                JSON
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                <Download size={20} />
                                CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Sessions"
                        value={sessions.length}
                        change="+12%"
                        icon={<TrendingUp />}
                        color="blue"
                    />
                    <StatCard
                        title="Avg Focus Time"
                        value={`${Math.round(sessions.reduce((a, b) => a + b.duration, 0) / sessions.length / 60) || 0}m`}
                        change="+8%"
                        icon={<BarChart3 />}
                        color="green"
                    />
                    <StatCard
                        title="Best Session"
                        value={`${Math.round(Math.max(...sessions.map(s => s.duration)) / 60) || 0}m`}
                        icon={<PieChartIcon />}
                        color="purple"
                    />
                    <StatCard
                        title="Avg Satisfaction"
                        value={`${(sessions.reduce((a, b) => a + (b.satisfaction || 3), 0) / sessions.length || 3).toFixed(1)}/5`}
                        icon={<BarChart3 />}
                        color="yellow"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Daily Focus Time */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                    >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                            Daily Focus Time (Hours)
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.daily}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }}
                                        labelStyle={{ color: '#F3F4F6' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Session Type Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                    >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                            Session Type Distribution
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.types}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {data.types.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Productivity vs Satisfaction */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                    >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                            Productivity vs Satisfaction
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.productivity.slice(-10)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" />
                                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563' }}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="duration" fill="#10B981" name="Duration (min)" />
                                    <Bar yAxisId="right" dataKey="satisfaction" fill="#8B5CF6" name="Satisfaction" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-${color}-500`}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
                <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
                    {change && (
                        <span className={`text-sm ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                            {change}
                        </span>
                    )}
                </div>
            </div>
            <div className={`text-${color}-500`}>
                {icon}
            </div>
        </div>
    </motion.div>
);

export default Analytics;