import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Calendar, Tag } from 'lucide-react';
import { useTimerStore } from '../store/timerStore';
import { formatDate, formatDuration } from '../utils/dateHelpers';

const RecentSessions = ({ limit = 5 }) => {
    const { sessions } = useTimerStore();
    const recentSessions = sessions.slice(0, limit);

    const getTypeColor = (type) => {
        const colors = {
            study: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            work: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            focus: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            break: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    };

    if (recentSessions.length === 0) {
        return (
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Recent Sessions
                </h3>
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                        No sessions yet. Start your first timer!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Recent Sessions
            </h3>
            <div className="space-y-3">
                {recentSessions.map((session, index) => (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(session.type)}`}>
                                    {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(session.startTime, 'time12')}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {session.satisfaction || 0}
                                </span>
                            </div>
                        </div>

                        <div className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                            {session.name || `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session`}
                        </div>

                        {session.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                                {session.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <Clock size={14} />
                                {formatDuration(session.duration)}
                            </div>
                            {session.tags && session.tags.length > 0 && (
                                <div className="flex gap-1">
                                    {session.tags.slice(0, 2).map((tag, idx) => (
                                        <span key={idx} className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                    {session.tags.length > 2 && (
                                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">
                                            +{session.tags.length - 2}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {sessions.length > limit && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a
                        href="/history"
                        className="text-sm text-blue-500 hover:text-blue-600 text-center block"
                    >
                        View all {sessions.length} sessions →
                    </a>
                </div>
            )}
        </div>
    );
};

export default RecentSessions;