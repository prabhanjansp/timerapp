import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Save, X } from 'lucide-react';

const TimerForm = ({ onSubmit, onCancel, duration, timerType, isPending }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
    };

    const onSubmitForm = (data) => {
        onSubmit({
            ...data,
            duration,
            type: timerType
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Session Complete! 🎉
                        </h2>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300">
                            You focused for <span className="font-bold text-green-600 dark:text-green-400">
                                {formatDuration(duration)}
                            </span> on <span className="font-bold capitalize">{timerType}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Session Name
                            </label>
                            <input
                                {...register('name', { required: 'Session name is required' })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                placeholder="What were you working on?"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                placeholder="Any notes about this session?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Satisfaction Level
                            </label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <label key={level} className="flex-1">
                                        <input
                                            type="radio"
                                            value={level}
                                            {...register('satisfaction')}
                                            className="sr-only peer"
                                        />
                                        <div className="text-center p-2 rounded-lg border border-gray-300 dark:border-gray-600 peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 cursor-pointer">
                                            {level} ⭐
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                {isPending ? 'Saving...' : 'Save Session'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TimerForm;