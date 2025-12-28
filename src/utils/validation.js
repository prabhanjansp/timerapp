export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
};

export const validateSessionName = (name) => {
    if (!name || name.trim().length === 0) {
        return 'Session name is required';
    }
    if (name.length > 100) {
        return 'Session name must be less than 100 characters';
    }
    return '';
};

export const validateDuration = (duration) => {
    if (!duration && duration !== 0) {
        return 'Duration is required';
    }
    if (isNaN(duration)) {
        return 'Duration must be a number';
    }
    if (duration < 60) {
        return 'Duration must be at least 1 minute';
    }
    if (duration > 86400) {
        return 'Duration cannot exceed 24 hours';
    }
    return '';
};

export const validateSatisfaction = (rating) => {
    if (rating === null || rating === undefined) {
        return 'Satisfaction rating is required';
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
        return 'Rating must be between 1 and 5';
    }
    return '';
};

export const validateGoal = (goal) => {
    const errors = {};

    if (!goal.title || goal.title.trim().length === 0) {
        errors.title = 'Goal title is required';
    } else if (goal.title.length > 50) {
        errors.title = 'Title must be less than 50 characters';
    }

    if (!goal.target || isNaN(goal.target)) {
        errors.target = 'Target is required';
    } else if (goal.target < 1) {
        errors.target = 'Target must be at least 1';
    } else if (goal.target > 1000) {
        errors.target = 'Target is too high';
    }

    if (!goal.period || !['daily', 'weekly', 'monthly'].includes(goal.period)) {
        errors.period = 'Invalid period';
    }

    return errors;
};

export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .trim();
};

export const validateTimeInput = (timeString) => {
    // Validate time in format hh:mm or hh:mm:ss
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(timeString);
};