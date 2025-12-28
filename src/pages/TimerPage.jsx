import React, {
  useState,
  useTransition,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "../store/timerStore";
import { useTimer } from "../hooks/useTimer";
import TimerDisplay from "../components/TimerDisplay";
import TimerControls from "../components/TimerControls";
import TimerForm from "../components/TimerForm";
import ConfirmationModal from "../components/ConfirmationModal";
import QuickStart from "../components/QuickStart";
import DailyGoal from "../components/DailyGoal";
import RecentSessions from "../components/RecentSessions";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Timer,
  Target,
  TrendingUp,
  History,
  Zap,
  Coffee,
  Brain,
  BookOpen,
  Volume2,
  Bell,
  Settings,
} from "lucide-react";

// Sound notification
const playSound = () => {
  try {
    const audio = new Audio("/sounds/timer-complete.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  } catch (error) {
    console.log("Sound notification error:", error);
  }
};

const TimerPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeTimerType, setActiveTimerType] = useState("focus");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const {
    timerType,
    setTimerType,
    dailyGoal,
    streak,
    sessions,
    darkMode,
    toggleDarkMode,
  } = useTimerStore();

  const {
    time,
    isRunning,
    handleStart,
    handlePause,
    handleStop,
    resetTimer,
    formattedTime,
  } = useTimer();

  // Timer types with static color classes
  const timerTypes = useMemo(
    () => [
      {
        id: "study",
        label: "Study",
        icon: <BookOpen className="w-5 h-5" />,
        shortcut: "1",
        description: "Deep learning sessions",
        activeBg: "bg-blue-500",
        inactiveBg: "bg-blue-100 dark:bg-blue-900/30",
        textColor: "text-blue-600 dark:text-blue-400",
      },
      {
        id: "work",
        label: "Work",
        icon: <Zap className="w-5 h-5" />,
        shortcut: "2",
        description: "Productivity & tasks",
        activeBg: "bg-emerald-500",
        inactiveBg: "bg-emerald-100 dark:bg-emerald-900/30",
        textColor: "text-emerald-600 dark:text-emerald-400",
      },
      {
        id: "focus",
        label: "Focus",
        icon: <Brain className="w-5 h-5" />,
        shortcut: "3",
        description: "Intense concentration",
        activeBg: "bg-purple-500",
        inactiveBg: "bg-purple-100 dark:bg-purple-900/30",
        textColor: "text-purple-600 dark:text-purple-400",
      },
      {
        id: "break",
        label: "Break",
        icon: <Coffee className="w-5 h-5" />,
        shortcut: "4",
        description: "Relax & recharge",
        activeBg: "bg-amber-500",
        inactiveBg: "bg-amber-100 dark:bg-amber-900/30",
        textColor: "text-amber-600 dark:text-amber-400",
      },
    ],
    []
  );

  // Get current timer type
  const getCurrentTimerType = useCallback(
    () => timerTypes.find((type) => type.id === timerType) || timerTypes[2],
    [timerTypes, timerType]
  );

  // Handle timer completion
  useEffect(() => {
    if (time === 0 && isRunning) {
      if (soundEnabled) {
        playSound();
      }
      if (
        notificationsEnabled &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("Timer Complete!", {
          body: `Your ${getCurrentTimerType().label} timer has finished.`,
          icon: "/icon.png",
        });
      }
    }
  }, [
    time,
    isRunning,
    soundEnabled,
    notificationsEnabled,
    getCurrentTimerType,
  ]);

  // Request notification permission
  const requestNotificationPermission = useCallback(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationsEnabled(true);
        }
      });
    }
  }, []);

  // Keyboard shortcuts with useCallback
  const handleKeyDown = useCallback(
    (e) => {
      // Prevent shortcuts in form inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (isRunning) {
            handlePause();
          } else {
            handleStart();
          }
          break;
        case "Escape":
          if (isRunning) {
            e.preventDefault();
            setShowConfirm(true);
          }
          break;
        case "Digit1":
          e.preventDefault();
          setTimerType("study");
          break;
        case "Digit2":
          e.preventDefault();
          setTimerType("work");
          break;
        case "Digit3":
          e.preventDefault();
          setTimerType("focus");
          break;
        case "Digit4":
          e.preventDefault();
          setTimerType("break");
          break;
        case "KeyD":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleDarkMode();
          }
          break;
      }
    },
    [isRunning, handleStart, handlePause, setTimerType, toggleDarkMode]
  );

  // Setup keyboard shortcuts
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Handle form submit
  const handleFormSubmit = useCallback(
    (data) => {
      startTransition(() => {
        handleStop(data);
        setShowForm(false);
      });
    },
    [handleStop]
  );

  // Handle preset selection
  const handlePresetSelect = useCallback(
    (preset) => {
      resetTimer(preset.duration);
      setTimerType(preset.type);
    },
    [resetTimer, setTimerType]
  );

  // Format today's focus time
  const todaysFocusTime = useMemo(() => {
    const today = new Date().toDateString();
    const todaysSessions = sessions.filter(
      (session) => new Date(session.startTime).toDateString() === today
    );
    const totalSeconds = todaysSessions.reduce(
      (acc, session) => acc + session.duration,
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [sessions]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark" : ""
      }`}
    >
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 min-h-screen">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 md:mb-10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Focus Timer
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                  Choose a timer type and start your productive session
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                <div className="hidden lg:block">
                  <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>Press</span>
                      <kbd className="px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-medium">
                        Space
                      </kbd>
                      <span>to start/pause</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="card mb-6 overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                    Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Sound Alerts
                        </span>
                      </div>
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          soundEnabled
                            ? "bg-blue-500"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                        aria-label={
                          soundEnabled ? "Disable sound" : "Enable sound"
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            soundEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Notifications
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (notificationsEnabled) {
                            setNotificationsEnabled(false);
                          } else {
                            requestNotificationPermission();
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationsEnabled
                            ? "bg-blue-500"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                        aria-label={
                          notificationsEnabled
                            ? "Disable notifications"
                            : "Enable notifications"
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationsEnabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-gradient-to-r from-blue-500 to-purple-500">
                  <Timer className="w-4 h-4 text-white" />
                </span>
                Select Timer Mode
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                Press 1-4 to quick select
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {timerTypes.map((type) => {
                const isActive = timerType === type.id;
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTimerType(type.id)}
                    className={`relative group p-4 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? `${type.activeBg} text-white shadow-xl ring-2 ring-offset-2 ring-white/30`
                        : `${type.inactiveBg} ${type.textColor} border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600`
                    }`}
                    aria-label={`Select ${type.label} timer`}
                    aria-pressed={isActive}
                  >
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`p-3 rounded-xl mb-3 transition-all duration-300 ${
                          isActive
                            ? "bg-white/20 backdrop-blur-sm"
                            : `${type.inactiveBg} ${type.textColor}`
                        }`}
                      >
                        {type.icon}
                      </div>

                      <div className="text-center">
                        <span className="text-sm font-medium">
                          {type.label}
                        </span>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-xs opacity-75">
                            {type.description}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? "bg-white text-gray-800"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {type.shortcut}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Timer Focus Area */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2"
            >
              {/* Timer Display & Controls Card */}
              <div className="card shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-sm overflow-hidden mt-6">
                {/* Active Timer Type Header */}
                <div className="relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-r opacity-5"
                    style={{
                      background:
                        timerType === "study"
                          ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                          : timerType === "work"
                          ? "linear-gradient(135deg, #10b981, #34d399)"
                          : timerType === "focus"
                          ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
                          : "linear-gradient(135deg, #f59e0b, #f97316)",
                    }}
                  />

                  <div className="relative px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            background:
                              timerType === "study"
                                ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                                : timerType === "work"
                                ? "linear-gradient(135deg, #10b981, #34d399)"
                                : timerType === "focus"
                                ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
                                : "linear-gradient(135deg, #f59e0b, #f97316)",
                          }}
                        >
                          {getCurrentTimerType().icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {getCurrentTimerType().label} Timer
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getCurrentTimerType().description}
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Press{" "}
                          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded mx-1">
                            Esc
                          </kbd>{" "}
                          to stop
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timer Display */}
                <div className="px-6 py-8 md:py-12">
                  <div className="mb-8">
                    <TimerDisplay time={time} isRunning={isRunning} />
                  </div>

                  {/* Control Buttons */}
                  <div className="mt-8">
                    <TimerControls
                      isRunning={isRunning}
                      onStart={handleStart}
                      onPause={handlePause}
                      onStop={() => setShowConfirm(true)}
                      onReset={() => resetTimer()}
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 lg:mt-8"
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Today's Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card border-l-4 border-blue-500 hover:border-blue-600 transition-all duration-300">
                    <div className="flex items-center justify-between p-5">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          Focus Time Today
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2">
                          {todaysFocusTime}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Goal: {dailyGoal.target} hours
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="card border-l-4 border-emerald-500 hover:border-emerald-600 transition-all duration-300">
                    <div className="flex items-center justify-between p-5">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          Current Streak
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2">
                          {streak} days
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Keep going! 🔥
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  <div className="card border-l-4 border-purple-500 hover:border-purple-600 transition-all duration-300">
                    <div className="flex items-center justify-between p-5">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          Total Sessions
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2">
                          {sessions.length}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {dailyGoal.completed}/{dailyGoal.target} today
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Sidebar */}
            <div className="space-y-6 lg:space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <QuickStart />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <DailyGoal />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <RecentSessions limit={5} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Keyboard Shortcuts */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-10">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-md"
                style={{
                  background:
                    timerType === "study"
                      ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                      : timerType === "work"
                      ? "linear-gradient(135deg, #10b981, #34d399)"
                      : timerType === "focus"
                      ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
                      : "linear-gradient(135deg, #f59e0b, #f97316)",
                }}
              >
                {getCurrentTimerType().icon}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getCurrentTimerType().label} Mode
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  Space
                </kbd>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Start/Pause
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  Esc
                </kbd>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Stop
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmationModal
            onConfirm={() => {
              setShowConfirm(false);
              setShowForm(true);
            }}
            onCancel={() => setShowConfirm(false)}
            title="Stop Timer?"
            message="Are you sure you want to stop the timer? You can save this session to your history."
            confirmText="Save Session"
            cancelText="Continue Timer"
          />
        )}

        {showForm && (
          <TimerForm
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
            duration={time}
            timerType={timerType}
            isPending={isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimerPage;
