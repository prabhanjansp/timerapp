import React, { Suspense, useEffect, useState, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  History,
  BarChart3,
  Settings,
  Target,
  Menu,
  X,
  Flame
} from 'lucide-react';
import { useTimerStore } from './store/timerStore';
import { useThemeStore } from './store/themeStore';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeToggle from './components/ThemeToggle';
import StreakCounter from './components/StreakCounter';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const TimerPage = lazy(() => import('./pages/TimerPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Service Worker Registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(
          (registration) => {
            console.log('SW registered: ', registration);
          },
          (error) => {
            console.log('SW registration failed: ', error);
          }
        );
      });
    }

    // Online/Offline handling
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen transition-colors duration-300">
        {!isOnline && (
          <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm fixed top-0 left-0 right-0 z-50">
            ⚠️ You are currently offline. Some features may be limited.
          </div>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/*" 
              element={
                <MainLayout 
                  sidebarOpen={sidebarOpen} 
                  setSidebarOpen={setSidebarOpen} 
                />
              } 
            />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

const MainLayout = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { streak, dailyGoal, getTodaySessions } = useTimerStore();
  const { darkMode } = useThemeStore();

  const todaySessions = getTodaySessions();
  const todayTotal = todaySessions.reduce((total, session) => total + session.duration, 0);
  const todayProgress = dailyGoal > 0 ? Math.min((todayTotal / dailyGoal) * 100, 100) : 0;

  const navItems = [
    { path: '/timer', icon: Timer, label: 'Timer' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path;
  const currentPage = navItems.find(item => isActive(item.path))?.label || 'FocusFlow';

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                  >
                    {sidebarOpen ? (
                      <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    ) : (
                      <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    )}
                  </button>
                  
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 no-underline"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow">
                      <Timer className="text-white w-4 h-4" />
                    </div>
                    <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      FocusFlow
                    </span>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  {/* Streak Display */}
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-100 dark:border-orange-800/30">
                    <div className="relative">
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Flame className="w-3 h-3 text-white" />
                      </div>
                      {streak > 0 && (
                        <div className="absolute -top-1.5 -right-1.5 min-w-4 h-4 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded-full flex items-center justify-center shadow-xs">
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                            {streak}
                          </span>
                        </div>
                      )}
                    </div>
                    {streak > 0 && (
                      <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 hidden xs:inline">
                        {streak}d
                      </span>
                    )}
                  </div>
                  
                  <ThemeToggle compact />
                </div>
              </div>

              {/* Progress Section */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <h1 className="text-base font-semibold text-gray-800 dark:text-white truncate">
                    {currentPage}
                  </h1>
                  <span className="text-xs text-gray-600 dark:text-gray-300 ml-2 whitespace-nowrap font-medium">
                    {Math.floor(todayTotal / 60)}m today
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${todayProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-2xl"
                >
                  <div className="p-4 h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-8">
                      <Link 
                        to="/" 
                        className="flex items-center gap-3 flex-1 no-underline" 
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow">
                          <Timer className="text-white w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            FocusFlow
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Productivity Timer
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close menu"
                      >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1 flex-1" role="navigation" aria-label="Mobile navigation">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isActive(item.path)
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          aria-current={isActive(item.path) ? 'page' : undefined}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </nav>

                    {/* Full Streak Counter */}
                    <div className="mt-6">
                      <StreakCounter />
                    </div>

                    {/* Progress Section */}
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Today's Progress</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {Math.round(todayProgress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${todayProgress}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                        {Math.floor(todayTotal / 60)}m / {Math.floor(dailyGoal / 60)}m goal
                      </div>
                    </div>
                  </div>
                </motion.div>
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden="true"
                />
              </>
            )}
          </AnimatePresence>

          {/* Mobile Main Content */}
          <main className="flex-1 overflow-y-auto pb-20 pt-4">
            <div className="p-4">
              <ErrorBoundary>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Routes>
                      <Route path="/timer" element={<TimerPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/goals" element={<GoalsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/timer" replace />} />
                    </Routes>
                  </motion.div>
                </AnimatePresence>
              </ErrorBoundary>
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <nav 
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg"
            role="navigation"
            aria-label="Bottom navigation"
          >
            <div className="flex justify-around py-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 flex-1 min-w-0 relative ${
                    isActive(item.path)
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  aria-label={item.label}
                >
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {isActive(item.path) && (
                      <motion.div 
                        className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </div>
                  <span className="text-xs mt-1 truncate px-1 max-w-full font-medium">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          {/* Fixed Desktop Sidebar */}
          <div className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-40">
            <div className="p-6 h-full flex flex-col">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 mb-8 no-underline group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Timer className="text-white w-7 h-7" />
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    FocusFlow
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Productivity Timer</div>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="space-y-1 mb-8 flex-1" role="navigation" aria-label="Main navigation">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Full Streak Counter */}
              <div className="mb-6">
                <StreakCounter />
              </div>

              {/* Progress Section */}
              <div className="mt-auto">
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Today's Focus</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {Math.floor(todayTotal / 60)}m
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                      style={{ width: `${todayProgress}%` }}
                      role="progressbar"
                      aria-valuenow={todayProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                    {Math.round(todayProgress)}% of daily goal
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Main Content (offset for fixed sidebar) */}
          <div className="flex-1 flex flex-col ml-64">
            {/* Desktop Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between p-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {currentPage}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
                    {isActive('/timer') && 'Focus on your tasks with precision timing'}
                    {isActive('/history') && 'Review and analyze your focus sessions'}
                    {isActive('/analytics') && 'Gain insights into your productivity patterns'}
                    {isActive('/goals') && 'Set and track your focus goals'}
                    {isActive('/settings') && 'Customize your experience and preferences'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Streak Display */}
                  {streak > 0 && (
                    <motion.div 
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-100 dark:border-orange-800/30 shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow">
                          <Flame className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Current Streak</div>
                          <div className="text-sm font-bold text-gray-800 dark:text-white">
                            {streak} {streak === 1 ? 'day' : 'days'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Desktop Page Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
              <ErrorBoundary>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-7xl mx-auto"
                  >
                    <Routes>
                      <Route path="/timer" element={<TimerPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/goals" element={<GoalsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/timer" replace />} />
                    </Routes>
                  </motion.div>
                </AnimatePresence>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;