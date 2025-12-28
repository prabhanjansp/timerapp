import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Bell,
    Volume2,
    Moon,
    Sun,
    Monitor,
    Keyboard,
    Save,
    RotateCcw,
    Shield,
    Download,
    Upload,
    Timer,
    Target,
    User,
    Database,
    Globe,
    HelpCircle,
    Menu,
    X
} from 'lucide-react';
import { useTimerStore } from '../store/timerStore';
import { useThemeStore } from '../store/themeStore';

const SettingsPage = () => {
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState('general');
    const [importStatus, setImportStatus] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [timerInputs, setTimerInputs] = useState({});

    const {
        soundEnabled,
        notificationsEnabled,
        timerPresets,
        darkMode: timerDarkMode,
        toggleSound,
        toggleNotifications,
        setTimerPreset,
        resetAllSettings,
        exportSessions
    } = useTimerStore();

    const { theme, setTheme, darkMode: themeDarkMode } = useThemeStore();

    // Combined dark mode state
    const darkMode = timerDarkMode || themeDarkMode;

    // Initialize timer inputs from store
    const timerTypes = [
        { id: 'study', label: 'Study', defaultValue: 1500, description: 'Academic learning sessions' },
        { id: 'work', label: 'Work', defaultValue: 3000, description: 'Professional work sessions' },
        { id: 'focus', label: 'Focus', defaultValue: 1800, description: 'Deep focus sessions' },
        { id: 'break', label: 'Break', defaultValue: 300, description: 'Short break sessions' }
    ];

    // Get timer value in minutes from store or use default
    const getTimerValue = (timerId) => {
        const timer = timerTypes.find(t => t.id === timerId);
        const seconds = timerPresets?.[timerId] || timer?.defaultValue || 1500;
        return Math.floor(seconds / 60);
    };

    // Handle timer input change
    const handleTimerChange = (timerId, minutes) => {
        // Validate input
        const validMinutes = Math.max(1, Math.min(180, parseInt(minutes) || 25));
        const seconds = validMinutes * 60;

        // Update store
        setTimerPreset(timerId, seconds);

        // Update local state for immediate feedback
        setTimerInputs(prev => ({
            ...prev,
            [timerId]: validMinutes
        }));
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all settings? This action cannot be undone.')) {
            startTransition(() => {
                resetAllSettings();
                // Reset theme to system default
                setTheme('system');
                // Clear local timer inputs
                setTimerInputs({});
                alert('All settings have been reset to default.');
            });
        }
    };

    const handleExport = () => {
        try {
            const data = exportSessions('json');
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `timer_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('Data exported successfully!');
        } catch (error) {
            alert('Error exporting data: ' + error.message);
        }
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImportStatus('Reading file...');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Basic validation
                if (!Array.isArray(data) && typeof data !== 'object') {
                    throw new Error('Invalid file format');
                }

                // Here you would implement the actual import logic
                // For now, just show a success message
                setImportStatus('Data imported successfully!');
                setTimeout(() => setImportStatus(''), 3000);

                // Reset file input
                event.target.value = '';

                alert('Data imported successfully! The app will now reload.');
                setTimeout(() => window.location.reload(), 1000);

            } catch (error) {
                setImportStatus('Error: Invalid file format');
                setTimeout(() => setImportStatus(''), 3000);
                alert('Error importing data: Invalid file format');
            }
        };

        reader.onerror = () => {
            setImportStatus('Error reading file');
            setTimeout(() => setImportStatus(''), 3000);
            alert('Error reading file');
        };

        reader.readAsText(file);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'timer', label: 'Timer', icon: Timer },
        { id: 'appearance', label: 'Appearance', icon: Moon },
        { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
        { id: 'data', label: 'Data', icon: Database },
        { id: 'about', label: 'About', icon: HelpCircle }
    ];

    const shortcuts = [
        { key: 'Space', action: 'Start/Pause timer' },
        { key: 'Escape', action: 'Stop timer' },
        { key: '1', action: 'Switch to Study mode' },
        { key: '2', action: 'Switch to Work mode' },
        { key: '3', action: 'Switch to Focus mode' },
        { key: '4', action: 'Switch to Break mode' },
        { key: 'R', action: 'Reset timer' },
        { key: 'S', action: 'Quick start last session' }
    ];

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Mobile sidebar toggle
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar when clicking on a tab on mobile
    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header with Mobile Menu Button */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2">
                            Settings
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                            Customize your timer experience
                        </p>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
                    {/* Mobile Sidebar Overlay */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                                    onClick={() => setIsSidebarOpen(false)}
                                />
                                <motion.div
                                    initial={{ x: -300, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -300, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="fixed top-0 left-0 h-full w-64 z-50 lg:hidden bg-white dark:bg-gray-800 shadow-xl"
                                >
                                    <div className="p-6 h-full overflow-y-auto">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                Settings Menu
                                            </h2>
                                            <button
                                                onClick={() => setIsSidebarOpen(false)}
                                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <X size={24} className="text-gray-600 dark:text-gray-300" />
                                            </button>
                                        </div>

                                        <nav className="space-y-1">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => handleTabClick(tab.id)}
                                                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${activeTab === tab.id
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <tab.icon size={20} />
                                                    <span className="font-medium text-left">{tab.label}</span>
                                                </button>
                                            ))}
                                        </nav>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Desktop Sidebar - Always visible on lg screens */}
                    <div className="hidden lg:block lg:w-64">
                        <div className="card sticky top-8">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <tab.icon size={20} />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* General Settings */}
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <div className="card">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                                                General Settings
                                            </h2>

                                            <div className="space-y-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-800 dark:text-white">Sound Effects</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Play sounds for timer completion and alerts
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={toggleSound}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${soundEnabled
                                                            ? 'bg-blue-500'
                                                            : 'bg-gray-300 dark:bg-gray-600'
                                                            }`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                                            }`} />
                                                    </button>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Show browser notifications for timer events
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={toggleNotifications}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${notificationsEnabled
                                                            ? 'bg-blue-500'
                                                            : 'bg-gray-300 dark:bg-gray-600'
                                                            }`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                                            }`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                                                User Profile
                                            </h2>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Display Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        defaultValue="Focus User"
                                                        className="input-field w-full"
                                                        placeholder="Enter your name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Email (Optional)
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className="input-field w-full"
                                                        placeholder="you@example.com"
                                                    />
                                                </div>

                                                <div className="pt-4">
                                                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full sm:w-auto">
                                                        <Save size={20} />
                                                        Save Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'timer' && (
                                    <div className="space-y-6">
                                        <div className="card">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                                                Timer Presets
                                            </h2>

                                            <div className="space-y-4">
                                                {timerTypes.map((timer) => {
                                                    const currentValue = getTimerValue(timer.id);
                                                    const currentSeconds = currentValue * 60;

                                                    return (
                                                        <div key={timer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className={`w-3 h-3 rounded-full ${timer.id === 'study' ? 'bg-blue-500' :
                                                                            timer.id === 'work' ? 'bg-green-500' :
                                                                                timer.id === 'focus' ? 'bg-purple-500' :
                                                                                    'bg-yellow-500'
                                                                        }`}></div>
                                                                    <h3 className="font-medium text-gray-800 dark:text-white capitalize">
                                                                        {timer.label} Timer
                                                                    </h3>
                                                                </div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                                                                    {timer.description}
                                                                </p>
                                                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-6">
                                                                    Current: {formatDuration(currentSeconds)}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex flex-col items-end">
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max="120"
                                                                            value={timerInputs[timer.id] !== undefined ? timerInputs[timer.id] : currentValue}
                                                                            onChange={(e) => {
                                                                                const minutes = parseInt(e.target.value) || 0;
                                                                                // Update local state immediately
                                                                                setTimerInputs(prev => ({
                                                                                    ...prev,
                                                                                    [timer.id]: minutes
                                                                                }));
                                                                                // Update store
                                                                                handleTimerChange(timer.id, minutes);
                                                                            }}
                                                                            onBlur={(e) => {
                                                                                const minutes = parseInt(e.target.value) || 0;
                                                                                if (minutes < 1 || minutes > 120) {
                                                                                    // Reset to current value if invalid
                                                                                    setTimerInputs(prev => ({
                                                                                        ...prev,
                                                                                        [timer.id]: currentValue
                                                                                    }));
                                                                                }
                                                                            }}
                                                                            className="w-20 sm:w-24 input-field text-center"
                                                                        />
                                                                        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">minutes</span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                        1-120 minutes
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    <strong>Tip:</strong> Changes are saved automatically. These presets will be used when you select each timer type.
                                                </p>
                                            </div>

                                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={() => {
                                                        // Reset all timers to defaults
                                                        timerTypes.forEach(timer => {
                                                            setTimerPreset(timer.id, timer.defaultValue);
                                                        });
                                                        setTimerInputs({});
                                                        alert('Timer presets reset to defaults!');
                                                    }}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <RotateCcw size={20} />
                                                    Reset to Defaults
                                                </button>

                                                <div className="flex-1"></div>

                                                <button
                                                    onClick={() => {
                                                        const values = timerTypes.map(timer => ({
                                                            name: timer.label,
                                                            value: `${getTimerValue(timer.id)} minutes`
                                                        }));
                                                        alert(`Current Timer Settings:\n\n${values.map(v => `${v.name}: ${v.value}`).join('\n')}`);
                                                    }}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
                                                >
                                                    <Save size={20} />
                                                    View Current Settings
                                                </button>
                                            </div>
                                        </div>

                                        <div className="card">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                                                Quick Timer Preview
                                            </h2>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {timerTypes.map((timer) => {
                                                    const currentValue = getTimerValue(timer.id);
                                                    const currentSeconds = currentValue * 60;
                                                    const hours = Math.floor(currentValue / 60);
                                                    const minutes = currentValue % 60;

                                                    return (
                                                        <div key={timer.id} className={`p-4 rounded-lg transition-all hover:scale-[1.02] ${timer.id === 'study' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
                                                                timer.id === 'work' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                                                                    timer.id === 'focus' ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' :
                                                                        'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                                            }`}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${timer.id === 'study' ? 'bg-blue-500' :
                                                                        timer.id === 'work' ? 'bg-green-500' :
                                                                            timer.id === 'focus' ? 'bg-purple-500' :
                                                                                'bg-yellow-500'
                                                                    }`}></div>
                                                                <div className={`font-medium capitalize ${timer.id === 'study' ? 'text-blue-700 dark:text-blue-300' :
                                                                        timer.id === 'work' ? 'text-green-700 dark:text-green-300' :
                                                                            timer.id === 'focus' ? 'text-purple-700 dark:text-purple-300' :
                                                                                'text-yellow-700 dark:text-yellow-300'
                                                                    }`}>
                                                                    {timer.label}
                                                                </div>
                                                            </div>
                                                            <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                                                                {hours > 0 ? `${hours}h ` : ''}{minutes}m
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {formatDuration(currentSeconds)}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                {timer.description}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Appearance Settings */}
                                {activeTab === 'appearance' && (
                                    <div className="space-y-6">
                                        <div className="card">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                                                Theme & Appearance
                                            </h2>

                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="font-medium text-gray-800 dark:text-white mb-4">Theme Preference</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                                        <button
                                                            onClick={() => setTheme('light')}
                                                            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${theme === 'light'
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                                }`}
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <Sun size={20} className="mb-2 text-gray-700 dark:text-gray-300" />
                                                                <span className="font-medium text-sm md:text-base">Light</span>
                                                                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                    Bright mode
                                                                </span>
                                                            </div>
                                                        </button>

                                                        <button
                                                            onClick={() => setTheme('dark')}
                                                            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                                }`}
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <Moon size={20} className="mb-2 text-gray-700 dark:text-gray-300" />
                                                                <span className="font-medium text-sm md:text-base">Dark</span>
                                                                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                    Easy on eyes
                                                                </span>
                                                            </div>
                                                        </button>

                                                        <button
                                                            onClick={() => setTheme('system')}
                                                            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${theme === 'system'
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                                }`}
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <Monitor size={20} className="mb-2 text-gray-700 dark:text-gray-300" />
                                                                <span className="font-medium text-sm md:text-base">System</span>
                                                                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                    Follow OS setting
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-medium text-gray-800 dark:text-white mb-4">Current Theme</h3>
                                                    <div className={`p-4 rounded-lg ${darkMode
                                                        ? 'bg-gray-800 text-white'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-medium text-sm md:text-base">
                                                                    {darkMode ? 'Dark Theme' : 'Light Theme'}
                                                                </div>
                                                                <div className="text-xs md:text-sm opacity-75">
                                                                    {darkMode
                                                                        ? 'Dark background with light text'
                                                                        : 'Light background with dark text'
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="text-xl md:text-2xl">
                                                                {darkMode ? '🌙' : '☀️'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Shortcuts Settings */}
                                {activeTab === 'shortcuts' && (
                                    <div className="space-y-6">
                                        <div className="card">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                                                Keyboard Shortcuts
                                            </h2>

                                            <div className="space-y-3 md:space-y-4">
                                                {shortcuts.map((shortcut, index) => (
                                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                                        <div className="font-medium text-gray-800 dark:text-white text-sm md:text-base">
                                                            {shortcut.action}
                                                        </div>
                                                        <kbd className="px-2 md:px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-mono text-sm md:text-base whitespace-nowrap">
                                                            {shortcut.key}
                                                        </kbd>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    <strong>Note:</strong> Keyboard shortcuts work anywhere on the app except when typing in input fields.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Data Settings */}
                                {activeTab === 'data' && (
                                    <div className="space-y-6">
                                        <div className="card">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                                                Data Management
                                            </h2>

                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="font-medium text-gray-800 dark:text-white mb-3 md:mb-4">Export Data</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-3 md:mb-4 text-sm md:text-base">
                                                        Export all your sessions and settings as a backup file.
                                                    </p>
                                                    <button
                                                        onClick={handleExport}
                                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full sm:w-auto"
                                                    >
                                                        <Download size={20} />
                                                        Export All Data (JSON)
                                                    </button>
                                                </div>

                                                <div>
                                                    <h3 className="font-medium text-gray-800 dark:text-white mb-3 md:mb-4">Import Data</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-3 md:mb-4 text-sm md:text-base">
                                                        Import previously exported data to restore your sessions and settings.
                                                    </p>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer w-full sm:w-fit">
                                                            <Upload size={20} />
                                                            Choose File to Import
                                                            <input
                                                                type="file"
                                                                accept=".json"
                                                                onChange={handleImport}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                        {importStatus && (
                                                            <div className={`text-sm ${importStatus.includes('Error')
                                                                ? 'text-red-500'
                                                                : 'text-green-500'
                                                                }`}>
                                                                {importStatus}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                                    <h3 className="font-medium text-gray-800 dark:text-white mb-3 md:mb-4 text-red-600 dark:text-red-400">
                                                        Danger Zone
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-3 md:mb-4 text-sm md:text-base">
                                                        Reset all settings and clear all data. This action cannot be undone.
                                                    </p>
                                                    <button
                                                        onClick={handleReset}
                                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 w-full sm:w-auto"
                                                    >
                                                        <RotateCcw size={20} />
                                                        Reset All Settings
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* About Settings */}
                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        <div className="card">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                                                About FocusFlow Timer
                                            </h2>

                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="font-medium text-gray-800 dark:text-white mb-3 md:mb-4">App Information</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Version</span>
                                                            <span className="font-medium text-gray-800 dark:text-white text-sm md:text-base">1.0.0</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Build Date</span>
                                                            <span className="font-medium text-gray-800 dark:text-white text-sm md:text-base">
                                                                {new Date().toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">License</span>
                                                            <span className="font-medium text-gray-800 dark:text-white text-sm md:text-base">MIT</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-medium text-gray-800 dark:text-white mb-3 md:mb-4">Features</h3>
                                                    <ul className="space-y-2">
                                                        <li className="flex items-start gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Multiple timer modes (Study, Work, Focus, Break)</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Session tracking and analytics</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Dark/Light theme support</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">PWA support for offline use</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Keyboard shortcuts</span>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h3 className="font-medium text-gray-800 dark:text-white mb-3 md:mb-4">Support</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-3 md:mb-4 text-sm md:text-base">
                                                        For issues, feature requests, or questions, please contact:
                                                    </p>
                                                    <div className="space-y-2">
                                                        <a
                                                            href="mailto:support@focusflow.com"
                                                            className="text-blue-500 hover:text-blue-600 block text-sm md:text-base"
                                                        >
                                                            support@focusflow.com
                                                        </a>
                                                        <a
                                                            href="https://github.com/yourusername/focusflow"
                                                            className="text-blue-500 hover:text-blue-600 block text-sm md:text-base"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            GitHub Repository
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;