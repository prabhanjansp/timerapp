import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, startOfDay, isSameDay, differenceInDays } from 'date-fns';

export const useTimerStore = create(
  persist(
    (set, get) => ({
      // Timer state
      time: 0,
      isRunning: false,
      timerType: 'focus',
      startTime: null,
      timerPresets: {
        study: 1500,  // 25 minutes
        work: 1500,   // 25 minutes
        focus: 1500,  // 25 minutes
        break: 300    // 5 minutes
      },

      // Sessions
      sessions: [],
      currentSession: null,

      // Goals & Analytics
      dailyGoal: 7200, // 2 hours in seconds
      weeklyGoal: 18000, // 5 hours in seconds
      streak: 0,
      lastSessionDate: null,
      totalFocusTime: 0,

      // Settings
      soundEnabled: true,
      notificationsEnabled: true,
      autoStartBreaks: false,
      selectedTheme: 'blue',
      darkMode: false,

      // Actions
      startTimer: () => {
        const startTime = new Date().toISOString();
        const { timerType, timerPresets } = get();
        
        // Ensure time is never negative
        const currentTime = Math.max(0, get().time || timerPresets[timerType] || 1500);
        
        set({
          isRunning: true,
          time: currentTime,
          startTime,
          currentSession: {
            id: Date.now(),
            startTime,
            type: timerType,
            duration: 0
          }
        });
      },

      pauseTimer: () => set({ isRunning: false }),

      resumeTimer: () => set({ isRunning: true }),

      stopTimer: (sessionData = {}) => {
        const state = get();
        if (!state.currentSession) return;

        // Ensure duration is never negative
        const duration = Math.max(0, state.time);
        
        const session = {
          ...state.currentSession,
          endTime: new Date().toISOString(),
          duration,
          name: sessionData.name || `${state.timerType.charAt(0).toUpperCase() + state.timerType.slice(1)} Session`,
          description: sessionData.description || '',
          satisfaction: sessionData.satisfaction || 3,
          tags: sessionData.tags || []
        };

        // Update streak
        const today = startOfDay(new Date());
        const lastDate = state.lastSessionDate ? startOfDay(new Date(state.lastSessionDate)) : null;

        let newStreak = state.streak;
        if (lastDate) {
          const daysDiff = differenceInDays(today, lastDate);
          if (daysDiff === 1) {
            newStreak += 1;
          } else if (daysDiff > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        // Calculate total focus time (ensure it's never negative)
        const newTotalFocusTime = Math.max(0, state.totalFocusTime + duration);

        set({
          isRunning: false,
          time: 0,
          startTime: null,
          currentSession: null,
          sessions: [session, ...state.sessions],
          streak: newStreak,
          lastSessionDate: today.toISOString(),
          totalFocusTime: newTotalFocusTime
        });

        return session;
      },

      resetTimer: () => set({
        time: 0,
        isRunning: false,
        startTime: null,
        currentSession: null
      }),

      setTime: (time) => set({ time: Math.max(0, time) }), // Prevent negative time

      setTimerType: (type) => {
        const presets = get().timerPresets;
        // Ensure time is never negative
        const newTime = Math.max(0, type in presets ? presets[type] : 1500);
        set({
          timerType: type,
          time: newTime
        });
      },

      // NEW: Set timer preset
      setTimerPreset: (timerType, seconds) => {
        // Ensure seconds are never negative and within reasonable bounds
        const validSeconds = Math.max(60, Math.min(7200, seconds)); // 1 minute to 2 hours
        
        set((state) => ({
          timerPresets: {
            ...state.timerPresets,
            [timerType]: validSeconds
          }
        }));
        
        // If current timer type matches, update current time
        if (get().timerType === timerType) {
          set({ time: validSeconds });
        }
      },

      // NEW: Reset all timer presets to defaults
      resetTimerPresets: () => set({
        timerPresets: {
          study: 1500,
          work: 1500,
          focus: 1500,
          break: 300
        }
      }),

      addSession: (session) => set((state) => ({
        sessions: [session, ...state.sessions]
      })),

      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id)
      })),

      updateSession: (id, updates) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === id ? { ...s, ...updates } : s
        )
      })),

      setDailyGoal: (seconds) => set({ dailyGoal: Math.max(0, seconds) }),

      setWeeklyGoal: (seconds) => set({ weeklyGoal: Math.max(0, seconds) }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      toggleNotifications: () => set((state) => ({
        notificationsEnabled: !state.notificationsEnabled
      })),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      setTheme: (theme) => set({ selectedTheme: theme }),

      // NEW: Reset all settings
      resetAllSettings: () => set({
        soundEnabled: true,
        notificationsEnabled: true,
        autoStartBreaks: false,
        selectedTheme: 'blue',
        darkMode: false,
        timerPresets: {
          study: 1500,
          work: 1500,
          focus: 1500,
          break: 300
        },
        dailyGoal: 7200,
        weeklyGoal: 18000
      }),

      // Analytics
      getTodaySessions: () => {
        const { sessions } = get();
        const today = startOfDay(new Date());
        return sessions.filter(session =>
          isSameDay(new Date(session.startTime), today)
        );
      },

      getWeekSessions: () => {
        const { sessions } = get();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessions.filter(session =>
          new Date(session.startTime) >= weekAgo
        );
      },

      getTotalFocusToday: () => {
        const todaySessions = get().getTodaySessions();
        return todaySessions.reduce((total, session) => total + Math.max(0, session.duration), 0);
      },

      clearAllSessions: () => set({ sessions: [] }),

      // Export functionality
      exportSessions: (format = 'json') => {
        const sessions = get().sessions;
        if (format === 'csv') {
          return convertToCSV(sessions);
        }
        return JSON.stringify(sessions, null, 2);
      }
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        dailyGoal: state.dailyGoal,
        weeklyGoal: state.weeklyGoal,
        streak: state.streak,
        lastSessionDate: state.lastSessionDate,
        totalFocusTime: state.totalFocusTime,
        timerPresets: state.timerPresets,
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled,
        selectedTheme: state.selectedTheme,
        darkMode: state.darkMode
      })
    }
  )
);

// Helper functions
function convertToCSV(sessions) {
  const headers = ['ID', 'Start Time', 'End Time', 'Duration (s)', 'Type', 'Name', 'Description', 'Satisfaction', 'Tags'];
  const rows = sessions.map(s => [
    s.id,
    format(new Date(s.startTime), 'yyyy-MM-dd HH:mm:ss'),
    s.endTime ? format(new Date(s.endTime), 'yyyy-MM-dd HH:mm:ss') : '',
    Math.max(0, s.duration), // Ensure duration is never negative
    s.type,
    s.name || '',
    s.description || '',
    s.satisfaction || '',
    s.tags?.join(';') || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}