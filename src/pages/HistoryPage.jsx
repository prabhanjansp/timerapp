import React, { useState, useTransition, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import {
  Search,
  Filter,
  Calendar,
  Download,
  Trash2,
  Edit2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
  BarChart3,
  TrendingUp,
  Award,
  Brain,
  BookOpen,
  Zap,
  Coffee,
  CalendarDays,
  X,
  ChevronDown,
  Sparkles,
  History as HistoryIcon,
  Star,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTimerStore } from '../store/timerStore';
import { useForm } from 'react-hook-form';

// Custom Hooks
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Sub-Components
const EmptyStateAnimation = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    <div className="relative mb-8">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity }
        }}
        className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
      />
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: [20, -20, 20] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Brain className="w-32 h-32 text-blue-400/50" />
      </motion.div>
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-4 -right-4"
      >
        <Sparkles className="w-12 h-12 text-yellow-400" />
      </motion.div>
    </div>

    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
      No Sessions Found
    </h3>
    <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
      Start your first focus session to begin tracking your productivity journey. Every great achievement starts with a single session!
    </p>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium"
      onClick={()=>{}}
    >
      <Zap className="w-5 h-5" />
      Start Your First Session
    </motion.button>
  </motion.div>
);

const EnhancedDropdown = ({ options, value, onChange, icon: Icon, label, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        aria-label={`Select ${label.toLowerCase()}`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
          {selectedOption && (
            <div className="flex items-center gap-2">
              {selectedOption.icon && (
                <span className="text-lg">
                  {selectedOption.icon}
                </span>
              )}
              <span className="font-medium text-gray-800 dark:text-white truncate">
                {selectedOption.label}
              </span>
            </div>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '300px' }}
          >
            <div className="overflow-y-auto max-h-60">
              {options.map((option) => (
                <motion.button
                  key={option.id}
                  type="button"
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label={`Select ${option.label}`}
                >
                  {option.icon && (
                    <span className="text-lg">
                      {option.icon}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-white truncate">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.id === value && (
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message, confirmText = "Delete", cancelText = "Cancel" }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {title}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 font-medium"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SessionGridItem = ({ session, onView, onDelete }) => {
  const typeColors = {
    study: 'bg-blue-500',
    work: 'bg-emerald-500',
    focus: 'bg-purple-500',
    break: 'bg-amber-500'
  };

  const typeIcons = {
    study: <BookOpen className="w-4 h-4" />,
    work: <Zap className="w-4 h-4" />,
    focus: <Brain className="w-4 h-4" />,
    break: <Coffee className="w-4 h-4" />
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="card hover:shadow-xl transition-all duration-300"
    >
      <div className={`relative overflow-hidden rounded-t-xl ${typeColors[session.type]} h-2`} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${typeColors[session.type]} text-white`}>
              {typeIcons[session.type]}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {format(parseISO(session.startTime), 'MMM dd')}
          </span>
        </div>

        <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
          {session.name || `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session`}
        </h3>

        {session.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {session.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
            {formatDuration(session.duration)}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${star <= (session.satisfaction || 0) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onView(session)}
            className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1 text-sm"
            aria-label={`View ${session.name} details`}
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
            aria-label={`Delete ${session.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SessionTableRow = ({ session, onView, onDelete }) => {
  const typeColors = {
    study: 'bg-blue-500',
    work: 'bg-emerald-500',
    focus: 'bg-purple-500',
    break: 'bg-amber-500'
  };

  const typeIcons = {
    study: <BookOpen className="w-4 h-4" />,
    work: <Zap className="w-4 h-4" />,
    focus: <Brain className="w-4 h-4" />,
    break: <Coffee className="w-4 h-4" />
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <td className="py-3 px-4">
        <div className="text-sm font-medium text-gray-800 dark:text-white">
          {format(parseISO(session.startTime), 'MMM dd, yyyy')}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {format(parseISO(session.startTime), 'hh:mm a')}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="font-medium text-gray-800 dark:text-white">
          {session.name || `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session`}
        </div>
        {session.description && (
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
            {session.description}
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${typeColors[session.type]} text-white`}>
            {typeIcons[session.type]}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{formatDuration(session.duration)}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-lg ${star <= (session.satisfaction || 0) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
            >
              ★
            </span>
          ))}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <button
            onClick={() => onView(session)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
            title="View Details"
            aria-label={`View ${session.name} details`}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
            title="Delete Session"
            aria-label={`Delete ${session.name}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// Main Component
const HistoryPage = () => {
  // State
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useLocalStorage('historyViewMode', 'grid');
  const [sortBy, setSortBy] = useState({ field: 'startTime', direction: 'desc' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [selectedSessions, setSelectedSessions] = useState(new Set());

  // Filters with local storage
  const [dateRange, setDateRange] = useLocalStorage('historyDateRange', {
    start: null,
    end: null
  });
  const [typeFilter, setTypeFilter] = useLocalStorage('historyTypeFilter', 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [satisfactionFilter, setSatisfactionFilter] = useState(0);

  // Hooks
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { sessions, deleteSession, updateSession, exportSessions } = useTimerStore();
  const { register, handleSubmit, reset } = useForm();

  // Constants
  const itemsPerPage = viewMode === 'grid' ? 8 : 10;

  // Timer types
  const timerTypes = [
    { id: 'all', label: 'All Types', icon: '📊', colorClass: 'text-gray-600' },
    { id: 'study', label: 'Study', icon: '📚', colorClass: 'text-blue-500', description: 'Learning sessions' },
    { id: 'work', label: 'Work', icon: '💼', colorClass: 'text-emerald-500', description: 'Productivity time' },
    { id: 'focus', label: 'Focus', icon: '🎯', colorClass: 'text-purple-500', description: 'Deep work' },
    { id: 'break', label: 'Break', icon: '☕', colorClass: 'text-amber-500', description: 'Rest periods' }
  ];

  // Filter and sort sessions with useMemo for performance
  const filteredSessions = useMemo(() => {
    setIsLoading(true);

    let filtered = [...sessions];

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(session => {
        const sessionDate = parseISO(session.startTime);
        return sessionDate >= startOfDay(dateRange.start) &&
          sessionDate <= endOfDay(dateRange.end);
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(session => session.type === typeFilter);
    }

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(session =>
        session.name?.toLowerCase().includes(query) ||
        session.description?.toLowerCase().includes(query) ||
        session.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Satisfaction filter
    if (satisfactionFilter > 0) {
      filtered = filtered.filter(session => (session.satisfaction || 0) >= satisfactionFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy.field) {
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'satisfaction':
          aValue = a.satisfaction || 0;
          bValue = b.satisfaction || 0;
          break;
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        default: // startTime
          aValue = new Date(a.startTime);
          bValue = new Date(b.startTime);
      }

      if (sortBy.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setIsLoading(false);
    return filtered;
  }, [sessions, dateRange, typeFilter, debouncedSearch, satisfactionFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

  // Handlers with useCallback
  const handleDelete = useCallback((id) => {
    setSessionToDelete(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (sessionToDelete) {
      startTransition(() => {
        deleteSession(sessionToDelete);
        if (selectedSession?.id === sessionToDelete) {
          setSelectedSession(null);
          setShowDetails(false);
        }
        setSelectedSessions(prev => {
          const newSet = new Set(prev);
          newSet.delete(sessionToDelete);
          return newSet;
        });
      });
    }
    setShowDeleteConfirm(false);
    setSessionToDelete(null);
  }, [sessionToDelete, selectedSession, deleteSession]);

  const handleUpdate = useCallback((data) => {
    if (selectedSession) {
      startTransition(() => {
        updateSession(selectedSession.id, data);
        setSelectedSession(prev => ({ ...prev, ...data }));
      });
    }
  }, [selectedSession, updateSession]);

  const handleExport = useCallback((format) => {
    const data = exportSessions(format);
    const blob = new Blob([data], {
      type: format === 'csv' ? 'text/csv' : 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessions_${format(new Date(), 'yyyy-MM-dd')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportSessions]);

  const handleBulkDelete = useCallback(() => {
    if (selectedSessions.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedSessions.size} sessions?`)) {
      startTransition(() => {
        selectedSessions.forEach(id => deleteSession(id));
        setSelectedSessions(new Set());
      });
    }
  }, [selectedSessions, deleteSession]);

  const toggleSelectAll = useCallback(() => {
    if (selectedSessions.size === paginatedSessions.length) {
      setSelectedSessions(new Set());
    } else {
      const allIds = new Set(paginatedSessions.map(s => s.id));
      setSelectedSessions(allIds);
    }
  }, [paginatedSessions, selectedSessions.size]);

  const toggleSessionSelection = useCallback((id) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const formatDuration = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  }, []);

  const handleSort = useCallback((field) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, typeFilter, debouncedSearch, satisfactionFilter, sortBy]);

  // Reset form when selected session changes
  useEffect(() => {
    if (selectedSession) {
      reset(selectedSession);
    }
  }, [selectedSession, reset]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <HistoryIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Session History
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
                    Track your progress and analyze your productivity patterns
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                aria-label="Toggle view mode"
              >
                {viewMode === 'grid' ? '📋 List' : '📱 Grid'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="card border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Sessions</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {filteredSessions.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="card border-l-4 border-emerald-500"
          >
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Time</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {formatDuration(filteredSessions.reduce((acc, session) => acc + session.duration, 0))}
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="card border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg Duration</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {filteredSessions.length > 0
                    ? formatDuration(Math.floor(filteredSessions.reduce((acc, session) => acc + session.duration, 0) / filteredSessions.length))
                    : '0m'
                  }
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="card border-l-4 border-amber-500"
          >
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg Satisfaction</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    {filteredSessions.length > 0
                      ? (filteredSessions.reduce((acc, session) => acc + (session.satisfaction || 0), 0) / filteredSessions.length).toFixed(1)
                      : '0'
                    }
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-amber-500 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters Card */}
        <div className="card mb-8">
          <div className="space-y-6">
            {/* Search Row */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search sessions by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 outline-none transition-all"
                  aria-label="Search sessions"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range - Start */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setDateRange(prev => ({
                      ...prev,
                      start: e.target.value ? new Date(e.target.value) : null
                    }))}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 outline-none"
                    aria-label="Filter from date"
                  />
                </div>
              </div>

              {/* Date Range - End */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  To Date
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setDateRange(prev => ({
                      ...prev,
                      end: e.target.value ? new Date(e.target.value) : null
                    }))}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 outline-none"
                    aria-label="Filter to date"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <EnhancedDropdown
                  options={timerTypes}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  icon={Filter}
                  label="Session Type"
                />
              </div>

              {/* Satisfaction Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min Satisfaction
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSatisfactionFilter(level === satisfactionFilter ? 0 : level)}
                      className={`flex-1 p-2 rounded-lg ${satisfactionFilter >= level
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      aria-label={`Filter by ${level} stars or more`}
                    >
                      <div className="flex justify-center gap-0.5">
                        <Star className="w-3 h-3" />
                        <span className="text-xs font-medium">{level}+</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setDateRange({ start: null, end: null });
                  setTypeFilter('all');
                  setSearchQuery('');
                  setSatisfactionFilter(0);
                  setSortBy({ field: 'startTime', direction: 'desc' });
                }}
                className="px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 font-medium"
                aria-label="Clear all filters"
              >
                <X className="w-5 h-5" />
                Clear All
              </button>

              {selectedSessions.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleBulkDelete}
                  className="px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 flex items-center gap-2 font-medium"
                  aria-label={`Delete ${selectedSessions.size} selected sessions`}
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Selected ({selectedSessions.size})
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport('csv')}
                className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 flex items-center gap-2 font-medium"
                aria-label="Export to CSV"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport('json')}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 flex items-center gap-2 font-medium"
                aria-label="Export to JSON"
              >
                <Download className="w-5 h-5" />
                Export JSON
              </motion.button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading sessions...</span>
          </div>
        )}

        {/* Sessions Display */}
        {!isLoading && paginatedSessions.length === 0 ? (
          <div className="card">
            <EmptyStateAnimation />
          </div>
        ) : !isLoading && viewMode === 'grid' ? (
          // Grid View
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {paginatedSessions.map((session) => (
                <SessionGridItem
                  key={session.id}
                  session={session}
                  onView={(session) => {
                    setSelectedSession(session);
                    setShowDetails(true);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        ) : !isLoading ? (
          // Table View
          <div className="card overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSessions.size === paginatedSessions.length && paginatedSessions.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 dark:border-gray-600"
                          aria-label="Select all sessions"
                        />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      <button
                        onClick={() => handleSort('startTime')}
                        className="flex items-center gap-1 hover:text-blue-500"
                      >
                        Date & Time
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:text-blue-500"
                      >
                        Session
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      <button
                        onClick={() => handleSort('duration')}
                        className="flex items-center gap-1 hover:text-blue-500"
                      >
                        Duration
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      <button
                        onClick={() => handleSort('satisfaction')}
                        className="flex items-center gap-1 hover:text-blue-500"
                      >
                        Satisfaction
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSessions.map((session) => (
                    <motion.tr
                      key={session.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedSessions.has(session.id)}
                          onChange={() => toggleSessionSelection(session.id)}
                          className="rounded border-gray-300 dark:border-gray-600"
                          aria-label={`Select ${session.name}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {format(parseISO(session.startTime), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {format(parseISO(session.startTime), 'hh:mm a')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800 dark:text-white">
                          {session.name || `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session`}
                        </div>
                        {session.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {session.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg ${session.type === 'study' ? 'bg-blue-500' :
                              session.type === 'work' ? 'bg-emerald-500' :
                                session.type === 'focus' ? 'bg-purple-500' :
                                  'bg-amber-500'
                            } text-white`}>
                            {session.type === 'study' ? <BookOpen className="w-4 h-4" /> :
                              session.type === 'work' ? <Zap className="w-4 h-4" /> :
                                session.type === 'focus' ? <Brain className="w-4 h-4" /> :
                                  <Coffee className="w-4 h-4" />}
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-mono">{formatDuration(session.duration)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${star <= (session.satisfaction || 0) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowDetails(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            title="View Details"
                            aria-label={`View ${session.name} details`}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                            title="Delete Session"
                            aria-label={`Delete ${session.name}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSessions.length)} of {filteredSessions.length} sessions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          aria-label={`Page ${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Session Details Modal */}
      <AnimatePresence>
        {showDetails && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Session Details
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {format(parseISO(selectedSession.startTime), 'EEEE, MMMM dd, yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(handleUpdate)}>
                  <div className="space-y-6">
                    {/* Session Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Session Name
                        </label>
                        <input
                          {...register('name')}
                          defaultValue={selectedSession.name || ''}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 outline-none transition-all"
                          aria-label="Session name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Session Type
                        </label>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${selectedSession.type === 'study' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                            selectedSession.type === 'work' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200' :
                              selectedSession.type === 'focus' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' :
                                'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                          }`}>
                          {selectedSession.type === 'study' ? <BookOpen className="w-5 h-5" /> :
                            selectedSession.type === 'work' ? <Zap className="w-5 h-5" /> :
                              selectedSession.type === 'focus' ? <Brain className="w-5 h-5" /> :
                                <Coffee className="w-5 h-5" />}
                          <span className="font-medium">
                            {selectedSession.type.charAt(0).toUpperCase() + selectedSession.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Duration & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Duration
                        </label>
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-gray-200">
                          {formatDuration(selectedSession.duration)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Time
                        </label>
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-gray-200">
                          {format(parseISO(selectedSession.startTime), 'hh:mm a')}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          End Time
                        </label>
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-gray-200">
                          {selectedSession.endTime
                            ? format(parseISO(selectedSession.endTime), 'hh:mm a')
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        defaultValue={selectedSession.description || ''}
                        rows={3}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 outline-none transition-all"
                        aria-label="Session description"
                      />
                    </div>

                    {/* Satisfaction */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Satisfaction Level
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <label key={level} className="flex-1">
                            <input
                              type="radio"
                              value={level}
                              {...register('satisfaction')}
                              defaultChecked={selectedSession.satisfaction === level}
                              className="sr-only peer"
                            />
                            <div className="text-center p-4 rounded-xl border border-gray-300 dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500 peer-checked:text-white peer-checked:border-transparent cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                              <div className="text-xl">{level} ⭐</div>
                              <div className="text-xs mt-1">{level === 1 ? 'Poor' : level === 5 ? 'Excellent' : 'Good'}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedSession.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={() => setShowDetails(false)}
                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Edit2 className="w-5 h-5" />
                            Update Session
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSessionToDelete(null);
        }}
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default HistoryPage;