import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Info, Clock, Target } from 'lucide-react';

const StatsCard = ({ 
    title, 
    value, 
    icon, 
    color = 'blue', 
    change, 
    description,
    loading = false,
    onClick,
    className = '',
    compact = false,
    showTrend = true,
    showInfo = false,
    onInfoClick,
    max // For progress bar
}) => {
    const [displayValue, setDisplayValue] = useState(value);
    const prevValueRef = useRef(value);
    const animationRef = useRef(null);

    // Color configuration with all classes spelled out for Tailwind
    const colorConfig = {
        blue: {
            bg: 'bg-blue-500/20 dark:bg-blue-500/10',
            bgLight: 'bg-blue-100 dark:bg-blue-900/30',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-600 dark:text-blue-400',
            gradient: 'from-blue-500 to-blue-600',
            shadow: 'shadow-blue-500/20',
            progress: 'bg-blue-500'
        },
        green: {
            bg: 'bg-green-500/20 dark:bg-green-500/10',
            bgLight: 'bg-green-100 dark:bg-green-900/30',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-600 dark:text-green-400',
            gradient: 'from-green-500 to-green-600',
            shadow: 'shadow-green-500/20',
            progress: 'bg-green-500'
        },
        purple: {
            bg: 'bg-purple-500/20 dark:bg-purple-500/10',
            bgLight: 'bg-purple-100 dark:bg-purple-900/30',
            border: 'border-purple-200 dark:border-purple-800',
            text: 'text-purple-600 dark:text-purple-400',
            gradient: 'from-purple-500 to-purple-600',
            shadow: 'shadow-purple-500/20',
            progress: 'bg-purple-500'
        },
        yellow: {
            bg: 'bg-yellow-500/20 dark:bg-yellow-500/10',
            bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
            border: 'border-yellow-200 dark:border-yellow-800',
            text: 'text-yellow-600 dark:text-yellow-400',
            gradient: 'from-yellow-500 to-yellow-600',
            shadow: 'shadow-yellow-500/20',
            progress: 'bg-yellow-500'
        },
        red: {
            bg: 'bg-red-500/20 dark:bg-red-500/10',
            bgLight: 'bg-red-100 dark:bg-red-900/30',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-600 dark:text-red-400',
            gradient: 'from-red-500 to-red-600',
            shadow: 'shadow-red-500/20',
            progress: 'bg-red-500'
        },
        indigo: {
            bg: 'bg-indigo-500/20 dark:bg-indigo-500/10',
            bgLight: 'bg-indigo-100 dark:bg-indigo-900/30',
            border: 'border-indigo-200 dark:border-indigo-800',
            text: 'text-indigo-600 dark:text-indigo-400',
            gradient: 'from-indigo-500 to-indigo-600',
            shadow: 'shadow-indigo-500/20',
            progress: 'bg-indigo-500'
        }
    };

    const config = colorConfig[color] || colorConfig.blue;

    // Animate value change with cleanup
    useEffect(() => {
        const shouldAnimate = typeof value === 'number' && 
                             typeof prevValueRef.current === 'number' && 
                             value !== prevValueRef.current;
        
        if (!shouldAnimate) {
            setDisplayValue(value);
            prevValueRef.current = value;
            return;
        }

        const startValue = prevValueRef.current;
        const endValue = value;
        const duration = 1000; // 1 second
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (endValue - startValue) * easeOutQuart;
            
            setDisplayValue(Math.round(currentValue * 100) / 100);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                prevValueRef.current = endValue;
            }
        };

        // Cancel any existing animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [value]);

    const renderChangeIndicator = () => {
        if (!change || !showTrend) return null;

        const isPositive = typeof change === 'string' 
            ? change.startsWith('+')
            : change > 0;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isPositive 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
            >
                {isPositive ? (
                    <TrendingUp size={12} />
                ) : (
                    <TrendingDown size={12} />
                )}
                <span>{typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}</span>
            </motion.div>
        );
    };

    const renderIcon = () => {
        if (!icon) return null;
        
        try {
            // Check if icon is a React element
            if (React.isValidElement(icon)) {
                return React.cloneElement(icon, { 
                    size: compact ? 18 : 22,
                    className: config.text
                });
            }
            return icon;
        } catch (error) {
            console.warn('Error rendering icon:', error);
            return null;
        }
    };

    const renderSkeleton = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="animate-pulse p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
        </div>
    );

    if (loading) {
        return renderSkeleton();
    }

    const paddingClass = compact ? 'p-4' : 'p-6';
    const textSizeClass = compact ? 'text-xl' : 'text-3xl';
    const shadowClass = `hover:shadow-xl ${config.shadow.replace('/20', '/10')}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
                y: compact ? -3 : -5, 
                scale: compact ? 1.02 : 1.03,
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`relative group ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
        >
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${config.gradient} opacity-0 
                           group-hover:opacity-5 blur-xl transition-opacity duration-300`} />
            
            <div className={`relative bg-white/95 dark:bg-gray-800/95 rounded-xl ${paddingClass}
                          border ${config.border} shadow-lg ${shadowClass} transition-all duration-300
                          backdrop-blur-sm`}>
                
                {/* Top section with title and info icon */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium truncate">
                            {title}
                        </p>
                        {showInfo && onInfoClick && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInfoClick();
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                                         transition-colors p-1"
                                title="More information"
                            >
                                <Info size={14} />
                            </button>
                        )}
                    </div>
                    
                    {!compact && icon && (
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                            {renderIcon()}
                        </div>
                    )}
                </div>

                {/* Value and change indicator */}
                <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                        <motion.p 
                            key={displayValue}
                            className={`${textSizeClass} font-bold text-gray-800 dark:text-white`}
                        >
                            {typeof value === 'number' ? displayValue : value}
                        </motion.p>
                        {renderChangeIndicator()}
                    </div>
                    
                    {compact && icon && (
                        <div className="mt-2 flex items-center justify-between">
                            <div className={`p-1.5 rounded-md ${config.bg}`}>
                                {renderIcon()}
                            </div>
                            {change && showTrend && (
                                <span className={`text-xs ${change?.startsWith?.('+') || (typeof change === 'number' && change > 0) ? 'text-green-500' : 'text-red-500'}`}>
                                    {typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Description */}
                {description && !compact && (
                    <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-gray-600 dark:text-gray-400 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700"
                    >
                        {description}
                    </motion.p>
                )}

                {/* Progress bar for numerical values with targets */}
                {typeof value === 'number' && max && !compact && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{Math.round((value / max) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`h-full ${config.progress}`}
                            />
                        </div>
                    </div>
                )}

                {/* Bottom trend line for compact mode */}
                {compact && description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-2">
                        {description}
                    </p>
                )}

                {/* Hover indicator */}
                {onClick && (
                    <motion.div 
                        initial={{ opacity: 0, width: 0 }}
                        whileHover={{ opacity: 1, width: '100%' }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent"
                    />
                )}
            </div>
        </motion.div>
    );
};


export default StatsCard;