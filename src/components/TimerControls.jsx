import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, AlertCircle, Check, X } from 'lucide-react';

const TimerControls = ({ 
    isRunning, 
    onStart, 
    onPause, 
    onStop, 
    onReset, 
    disabled,
    showStopConfirmation = true
}) => {
    const [showStopConfirm, setShowStopConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleStartPause = async () => {
        if (disabled) return;
        setIsProcessing(true);
        try {
            if (isRunning) {
                await onPause?.();
            } else {
                await onStart?.();
            }
        } catch (error) {
            console.error('Timer control error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStop = async () => {
        if (disabled) return;
        
        if (showStopConfirmation && !showStopConfirm) {
            setShowStopConfirm(true);
            return;
        }

        setIsProcessing(true);
        try {
            await onStop?.();
            setShowStopConfirm(false);
        } catch (error) {
            console.error('Stop error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = async () => {
        if (disabled) return;
        setIsProcessing(true);
        try {
            await onReset?.();
        } catch (error) {
            console.error('Reset error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                {/* Start/Pause Button */}
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartPause}
                    disabled={disabled || isProcessing}
                    className={`relative flex flex-col sm:flex-row items-center justify-center gap-2 px-4 sm:px-8 py-4 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-lg w-full transition-all duration-300 ${
                        isRunning
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/25'
                            : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/25'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                    aria-busy={isProcessing}
                >
                    {isProcessing ? (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm sm:text-base">Processing...</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                {isRunning ? (
                                    <Pause className="w-6 h-6 sm:w-6 sm:h-6" />
                                ) : (
                                    <Play className="w-6 h-6 sm:w-6 sm:h-6" />
                                )}
                                <span className="text-sm sm:text-base font-medium">
                                    {isRunning ? 'Pause' : 'Start'}
                                </span>
                            </div>
                            {/* Mobile only hint */}
                            <span className="sm:hidden text-xs opacity-75 mt-1">
                                {isRunning ? 'Tap to pause' : 'Tap to start'}
                            </span>
                        </>
                    )}
                </motion.button>

                {/* Stop Button */}
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => showStopConfirmation ? setShowStopConfirm(true) : handleStop()}
                    disabled={disabled || isProcessing}
                    className="relative flex flex-col sm:flex-row items-center justify-center gap-2 px-4 sm:px-8 py-4 sm:py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-base sm:text-lg w-full shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    aria-label="Stop timer"
                    aria-busy={isProcessing}
                >
                    {isProcessing ? (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm sm:text-base">Stopping...</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                <Square className="w-6 h-6 sm:w-6 sm:h-6" />
                                <span className="text-sm sm:text-base font-medium">Stop</span>
                            </div>
                            {/* Mobile only hint */}
                            <span className="sm:hidden text-xs opacity-75 mt-1">
                                Tap to stop
                            </span>
                        </>
                    )}
                </motion.button>

                {/* Reset Button (Conditional) */}
                {onReset && (
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        disabled={disabled || isProcessing || isRunning}
                        className="relative flex flex-col sm:flex-row items-center justify-center gap-2 px-4 sm:px-8 py-4 sm:py-4 rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-semibold text-base sm:text-lg w-full shadow-lg shadow-gray-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        aria-label="Reset timer"
                        aria-busy={isProcessing}
                    >
                        {isProcessing ? (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm sm:text-base">Resetting...</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                    <RotateCcw className="w-6 h-6 sm:w-6 sm:h-6" />
                                    <span className="text-sm sm:text-base font-medium">Reset</span>
                                </div>
                                {/* Mobile only hint */}
                                <span className="sm:hidden text-xs opacity-75 mt-1">
                                    Reset to start
                                </span>
                            </>
                        )}
                    </motion.button>
                )}
            </div>

            {/* Stop Confirmation Modal */}
            <AnimatePresence>
                {showStopConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowStopConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30">
                                        <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                        Stop Timer?
                                    </h3>
                                </div>
                                
                                {/* Message */}
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Are you sure you want to stop the current timer? You can save this session to your history or continue timing.
                                </p>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowStopConfirm(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 font-medium"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleStop}
                                        disabled={isProcessing}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Stopping...
                                            </>
                                        ) : (
                                            <>
                                                <Square className="w-4 h-4" />
                                                Stop Timer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Default props for better TypeScript support
TimerControls.defaultProps = {
    isRunning: false,
    disabled: false,
    showStopConfirmation: true,
    onStart: () => {},
    onPause: () => {},
    onStop: () => {},
    onReset: null,
};

export default TimerControls;