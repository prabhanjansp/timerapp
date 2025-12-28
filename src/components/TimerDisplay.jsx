import React, { memo } from 'react';
import { motion } from 'framer-motion';

const TimerDisplay = memo(({ time, isRunning }) => {
  console.log('TimerDisplay rendering with time:', time, 'seconds'); // Debug log

  const formatTime = (seconds) => {
    console.log('Formatting seconds:', seconds); // Debug log

    if (!seconds && seconds !== 0) return '00:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    console.log('Formatted:', { hrs, mins, secs }); // Debug log

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(time);
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  return (
    <div className="relative">
      {/* Main Timer Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative text-center"
      >
        {/* Background Glow Effect when running */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 blur-3xl rounded-full"
          />
        )}

        {/* Timer Text */}
        <h1 className="text-8xl md:text-[10rem] lg:text-[12rem] font-bold mb-6 tracking-tight font-mono">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {formattedTime}
          </span>
        </h1>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            {isRunning ? 'Running' : 'Paused'}
          </span>
        </div>

        {/* Time Breakdown */}
        <div className="flex justify-center gap-8 md:gap-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              {hours.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">
              Hours
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              {minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">
              Minutes
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              {seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">
              Seconds
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

TimerDisplay.displayName = 'TimerDisplay';

export default TimerDisplay;