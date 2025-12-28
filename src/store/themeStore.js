import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'system',
            darkMode: false,

            setTheme: (theme) => {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);

                if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }

                set({
                    theme,
                    darkMode: shouldBeDark
                });
            },

            toggleDarkMode: () => set((state) => {
                const newDarkMode = !state.darkMode;
                if (newDarkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                return {
                    darkMode: newDarkMode,
                    theme: newDarkMode ? 'dark' : 'light'
                };
            })
        }),
        {
            name: 'theme-storage'
        }
    )
);