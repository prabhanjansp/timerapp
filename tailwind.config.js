/** @type {import('tailwindcss').Config} */

export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const darkMode = 'class';
export const theme = {
  extend: {
    colors: {
      primary: {
        study: '#3B82F6',
        work: '#10B981',
        focus: '#8B5CF6',
        break: '#F59E0B',
        blue: '#3B82F6',
        green: '#10B981',
        purple: '#8B5CF6',
        yellow: '#F59E0B',
        red: '#EF4444'
      }
    },
    animation: {
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'float': 'float 3s ease-in-out infinite',
      'gradient': 'gradient 8s linear infinite',
    },
    keyframes: {
      float: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      gradient: {
        '0%, 100%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
      }
    },
    fontFamily: {
      'mono': ['"JetBrains Mono"', 'monospace'],
      'display': ['"Rajdhani"', 'sans-serif'],
      'digital': ['"Orbitron"', 'sans-serif'],
      'silkscreen': ['Silkscreen', 'monospace'], // Add custom font
    }
  },
};
export const plugins = [];