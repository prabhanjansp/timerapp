import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    Calendar,
    Tag,
    Star,
    Filter,
    ChevronDown,
    ChevronUp,
    Search,
    Download,
    Trash2,
    Eye,
    Edit2,
    CheckSquare,
    Square
} from 'lucide-react';
import { formatDuration } from '../utils/timeFormatter';
import { formatDate } from '../utils/dateHelpers';

const SessionList = ({
    sessions,
    onSelectSession,
    onDeleteSession,
    onEditSession,
    selectable = false,
    selectedSessions = [],
    onSelectAll = () => { },
    onToggleSelect = () => { },
    showFilters = true,
    onExport = () => { }
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [expandedSession, setExpandedSession] = useState(null);

    // Filter and sort sessions
    const filteredSessions = useMemo(() => {
        let filtered = [...sessions];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(session =>
                session.name?.toLowerCase().includes(query) ||
                session.description?.toLowerCase().includes(query) ||
                session.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(session => session.type === typeFilter);
        }

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);

            filtered = filtered.filter(session => {
                const sessionDate = new Date(session.startTime);

                switch (dateFilter) {
                    case 'today':
                        return sessionDate >= today;
                    case 'yesterday':
                        return sessionDate >= yesterday && sessionDate < today;
                    case 'week':
                        return sessionDate >= lastWeek;
                    case 'month':
                        return sessionDate.getMonth() === now.getMonth() &&
                            sessionDate.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.startTime);
                    bValue = new Date(b.startTime);
                    break;
                case 'duration':
                    aValue = a.duration;
                    bValue = b.duration;
                    break;
                case 'name':
                    aValue = (a.name || '').toLowerCase();
                    bValue = (b.name || '').toLowerCase();
                    break;
                case 'satisfaction':
                    aValue = a.satisfaction || 0;
                    bValue = b.satisfaction || 0;
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [sessions, searchQuery, typeFilter, dateFilter, sortBy, sortOrder]);

    const sessionTypes = ['all', 'study', 'work', 'focus', 'break'];
    const dateFilters = [
        { id: 'all', label: 'All Time' },
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'week', label: 'Last 7 Days' },
        { id: 'month', label: 'This Month' }
    ];
    const sortOptions = [
        { id: 'date', label: 'Date' },
        { id: 'duration', label: 'Duration' },
        { id: 'name', label: 'Name' },
        { id: 'satisfaction', label: 'Satisfaction' }
    ];

    const getTypeColor = (type) => {
        const colors = {
            study: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            work: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            focus: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            break: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const handleExportSelected = () => {
        const selected = sessions.filter(session =>
            selectedSessions.includes(session.id)
        );
        onExport(selected);
    };

    return (
        <div className="space-y-4">
            {/* Filters and Controls */}
            {showFilters && (
                <div className="card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search sessions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="input-field text-sm py-2"
                            >
                                {sessionTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="input-field text-sm py-2"
                            >
                                {dateFilters.map(filter => (
                                    <option key={filter.id} value={filter.id}>{filter.label}</option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input-field text-sm py-2"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        Sort by {option.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => handleSort(sortBy)}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                {sortOrder === 'asc' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectable && selectedSessions.length > 0 && (
                        <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="text-blue-500" size={20} />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {selectedSessions.length} session(s) selected
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportSelected}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    <Download size={16} />
                                    Export Selected
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Delete ${selectedSessions.length} session(s)?`)) {
                                            selectedSessions.forEach(id => onDeleteSession?.(id));
                                        }
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    <Trash2 size={16} />
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sessions List */}
            <div className="space-y-3">
                {filteredSessions.length === 0 ? (
                    <div className="card text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                            No sessions found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchQuery || typeFilter !== 'all' || dateFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Start your first timer session to see data here!'
                            }
                        </p>
                    </div>
                ) : (
                    filteredSessions.map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -2 }}
                            className="card cursor-pointer"
                            onClick={() => !selectable && onSelectSession?.(session)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Selection Checkbox */}
                                {selectable && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleSelect(session.id);
                                        }}
                                        className="mt-1"
                                    >
                                        {selectedSessions.includes(session.id) ? (
                                            <CheckSquare className="text-blue-500" size={20} />
                                        ) : (
                                            <Square className="text-gray-400" size={20} />
                                        )}
                                    </button>
                                )}

                                {/* Session Info */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(session.type)}`}>
                                                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(new Date(session.startTime), 'MMM dd, HH:mm')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <Clock size={14} />
                                                {formatDuration(session.duration)}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`text-sm ${star <= (session.satisfaction || 0) ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Session Name and Description */}
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                        {session.name || `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session`}
                                    </h3>

                                    {session.description && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                            {session.description}
                                        </p>
                                    )}

                                    {/* Tags */}
                                    {session.tags && session.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {session.tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                                                >
                                                    <Tag size={10} />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span>Created {formatDate(new Date(session.startTime), 'relative')}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedSession(expandedSession === session.id ? null : session.id);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                                title={expandedSession === session.id ? 'Collapse' : 'Expand'}
                                            >
                                                {expandedSession === session.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectSession?.(session);
                                                }}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditSession?.(session);
                                                }}
                                                className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                                                title="Edit Session"
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Delete this session?')) {
                                                        onDeleteSession?.(session.id);
                                                    }
                                                }}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                title="Delete Session"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedSession === session.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Session Details
                                                    </h4>
                                                    <dl className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <dt className="text-gray-500 dark:text-gray-400">Start Time:</dt>
                                                            <dd className="text-gray-800 dark:text-white">
                                                                {formatDate(new Date(session.startTime), 'full')}
                                                            </dd>
                                                        </div>
                                                        {session.endTime && (
                                                            <div className="flex justify-between">
                                                                <dt className="text-gray-500 dark:text-gray-400">End Time:</dt>
                                                                <dd className="text-gray-800 dark:text-white">
                                                                    {formatDate(new Date(session.endTime), 'full')}
                                                                </dd>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <dt className="text-gray-500 dark:text-gray-400">Total Duration:</dt>
                                                            <dd className="text-gray-800 dark:text-white">
                                                                {formatDuration(session.duration)}
                                                            </dd>
                                                        </div>
                                                    </dl>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Additional Info
                                                    </h4>
                                                    {session.notes && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                            <strong>Notes:</strong> {session.notes}
                                                        </p>
                                                    )}
                                                    {session.goal && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            <strong>Goal:</strong> {session.goal}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Summary Stats */}
            {filteredSessions.length > 0 && (
                <div className="card">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredSessions.length} of {sessions.length} sessions
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {formatDuration(filteredSessions.reduce((sum, session) => sum + session.duration, 0))}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Total Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {filteredSessions.length > 0
                                        ? (filteredSessions.reduce((sum, session) => sum + (session.satisfaction || 0), 0) / filteredSessions.length).toFixed(1)
                                        : '0'
                                    }
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Avg Satisfaction</div>
                            </div>
                            <button
                                onClick={() => onExport?.(filteredSessions)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                <Download size={16} />
                                Export All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionList;