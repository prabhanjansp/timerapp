import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const ThemeToggle = () => {
    const { theme, setTheme, darkMode } = useThemeStore();
    const [mounted, setMounted] = useState(false);
    const [showThemePicker, setShowThemePicker] = useState(false);

    // After mounting, we can show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        );
    }

    const themes = [
        { id: 'light', label: 'Light', icon: Sun, color: 'text-yellow-500' },
        { id: 'dark', label: 'Dark', icon: Moon, color: 'text-blue-500' },
        { id: 'system', label: 'System', icon: Monitor, color: 'text-gray-500' }
    ];

    const currentTheme = themes.find(t => t.id === theme) || themes[2];

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setShowThemePicker(false);
    };

    return (
        <div className="relative">
            {/* Main Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Change theme"
            >
                <currentTheme.icon className={currentTheme.color} size={20} />
            </motion.button>

            {/* Theme Picker Dropdown */}
            {showThemePicker && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowThemePicker(false)}
                    />

                    {/* Dropdown */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                        <div className="p-2">
                            <h3 className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Theme
                            </h3>
                            <div className="space-y-1">
                                {themes.map((themeOption) => (
                                    <button
                                        key={themeOption.id}
                                        onClick={() => handleThemeChange(themeOption.id)}
                                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${theme === themeOption.id
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <themeOption.icon className={themeOption.color} size={18} />
                                        <span className="font-medium">{themeOption.label}</span>
                                        {theme === themeOption.id && (
                                            <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>


                    </motion.div>
                </>
            )}

            {/* System Theme Detection Indicator */}
            {theme === 'system' && (
                <div className="absolute -top-1 -right-1">
                    <div className="relative">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.7, 0, 0.7]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Theme Provider Component (for app initialization)
export const ThemeProvider = ({ children }) => {
    const { setTheme } = useThemeStore();

    useEffect(() => {
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            const storedTheme = localStorage.getItem('theme-storage');
            if (storedTheme) {
                const parsed = JSON.parse(storedTheme);
                if (parsed.state.theme === 'system') {
                    setTheme('system');
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [setTheme]);

    return <>{children}</>;
};

// Theme-aware component for conditional rendering
export const Themed = ({ light, dark, children }) => {
    const { darkMode } = useThemeStore();

    if (light && dark) {
        return darkMode ? dark : light;
    }

    return children;
};

// Theme-aware text component
export const ThemedText = ({ className = '', children }) => {
    const { darkMode } = useThemeStore();

    return (
        <span className={`${darkMode ? 'text-white' : 'text-gray-900'} ${className}`}>
            {children}
        </span>
    );
};

// Theme-aware card component
export const ThemedCard = ({ className = '', children, ...props }) => {
    const { darkMode } = useThemeStore();

    return (
        <div
            className={`${darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
                } border rounded-xl shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default ThemeToggle;