import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', message = 'Loading...', fullScreen = false }) => {
    const sizeClasses = {
        small: 'w-8 h-8',
        default: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    const containerClasses = fullScreen
        ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50'
        : 'flex flex-col items-center justify-center p-8';

    return (
        <div className={containerClasses}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className={`${sizeClasses[size]} relative`}
                >
                    <Loader2 className="w-full h-full text-blue-500" />

                    {/* Optional: Add pulsing ring */}
                    <motion.div
                        className="absolute inset-0 border-4 border-blue-500/30 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 0.3, 0.7]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-gray-600 dark:text-gray-400 text-center"
                    >
                        {message}
                    </motion.p>
                )}

                {/* Optional: Loading dots */}
                <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{
                                y: [0, -6, 0],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {fullScreen && (
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-900/50 dark:to-gray-800/50" />
            )}
        </div>
    );
};

// Skeleton loader component
export const SkeletonLoader = ({ count = 3, height = 'h-4', className = '' }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0.8 }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: i * 0.1
                    }}
                    className={`bg-gray-200 dark:bg-gray-700 rounded ${height} w-full`}
                />
            ))}
        </div>
    );
};

// Card skeleton loader
export const CardSkeleton = () => {
    return (
        <div className="card">
            <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
            </div>
        </div>
    );
};

// Page skeleton loader
export const PageSkeleton = () => {
    return (
        <div className="space-y-6 p-6">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    );
};

export default LoadingSpinner;