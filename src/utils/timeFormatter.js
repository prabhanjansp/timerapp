import { format, intervalToDuration } from 'date-fns';

export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '0s';

  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

  if (duration.hours > 0) {
    return `${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
  } else if (duration.minutes > 0) {
    return `${duration.minutes}m ${duration.seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatShortDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '0:00';

  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

  if (duration.hours > 0) {
    return `${duration.hours}:${duration.minutes.toString().padStart(2, '0')}:${duration.seconds.toString().padStart(2, '0')}`;
  } else if (duration.minutes > 0) {
    return `${duration.minutes}:${duration.seconds.toString().padStart(2, '0')}`;
  } else {
    return `0:${seconds.toString().padStart(2, '0')}`;
  }
};

// NEW: Add formatHours function
export const formatHours = (seconds, decimalPlaces = 1) => {
  if (!seconds && seconds !== 0) return '0h';

  const hours = seconds / 3600;

  if (hours < 1) {
    // Show minutes for less than 1 hour
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  }

  // Format hours with specified decimal places
  return `${hours.toFixed(decimalPlaces)}h`;
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return format(dateObj, 'HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

export const formatDate = (date, formatType = 'default') => {
  if (!date) return 'N/A';

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    switch (formatType) {
      case 'short':
        return format(dateObj, 'MMM dd');
      case 'medium':
        return format(dateObj, 'MMM dd, yyyy');
      case 'long':
        return format(dateObj, 'EEEE, MMMM dd, yyyy');
      case 'time':
        return format(dateObj, 'HH:mm');
      case 'time12':
        return format(dateObj, 'hh:mm a');
      case 'datetime':
        return format(dateObj, 'MMM dd, yyyy HH:mm');
      case 'datetime12':
        return format(dateObj, 'MMM dd, yyyy hh:mm a');
      case 'full':
        return format(dateObj, 'EEEE, MMMM dd, yyyy hh:mm a');
      case 'iso':
        return dateObj.toISOString();
      case 'input':
        return format(dateObj, 'yyyy-MM-dd');
      case 'input-time':
        return format(dateObj, 'HH:mm');
      default:
        return format(dateObj, 'MMM dd, yyyy');
    }
  } catch {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

export const calculateTimeRemaining = (endTime) => {
  if (!endTime) return { hours: 0, minutes: 0, seconds: 0, isOver: true };

  try {
    const now = new Date();
    const end = endTime instanceof Date ? endTime : new Date(endTime);

    if (isNaN(end.getTime())) return { hours: 0, minutes: 0, seconds: 0, isOver: true };

    const diffMs = end - now;

    if (diffMs <= 0) return { hours: 0, minutes: 0, seconds: 0, isOver: true };

    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    return { hours, minutes, seconds, isOver: false };
  } catch {
    return { hours: 0, minutes: 0, seconds: 0, isOver: true };
  }
};

export const parseTimeString = (timeString) => {
  if (!timeString) return 0;

  const parts = timeString.split(':').map(Number);

  if (parts.length === 3 && !parts.some(isNaN)) {
    // hh:mm:ss
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2 && !parts.some(isNaN)) {
    // mm:ss
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1 && !isNaN(parts[0])) {
    // ss
    return parts[0];
  }

  return 0;
};

export const formatTimerDisplay = (seconds, showHours = false) => {
  if (!seconds && seconds !== 0) return '00:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (showHours || hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const secondsToTimeObject = (seconds) => {
  if (!seconds && seconds !== 0) return { hours: 0, minutes: 0, seconds: 0 };

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return { hours, minutes, seconds: secs };
};

export const timeObjectToSeconds = (timeObj) => {
  if (!timeObj) return 0;

  const { hours = 0, minutes = 0, seconds = 0 } = timeObj;
  return hours * 3600 + minutes * 60 + seconds;
};

export const formatDurationForGoal = (seconds) => {
  if (!seconds && seconds !== 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDurationForDisplay = (seconds) => {
  if (!seconds && seconds !== 0) return '0 seconds';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];

  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);

  return parts.join(' ');
};

// NEW: Format hours only for charts and analytics
export const formatHoursOnly = (seconds, decimalPlaces = 1) => {
  if (!seconds && seconds !== 0) return '0';

  const hours = seconds / 3600;
  return hours.toFixed(decimalPlaces);
};

// NEW: Format for tooltips and labels
export const formatHoursAndMinutes = (seconds) => {
  if (!seconds && seconds !== 0) return '0h 0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

// For backward compatibility
export default {
  formatDuration,
  formatShortDuration,
  formatHours, // Added this
  formatTime,
  formatDate,
  formatDateTime,
  calculateTimeRemaining,
  parseTimeString,
  formatTimerDisplay
};