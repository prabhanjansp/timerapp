import { describe, it, expect } from 'vitest';
import {
    formatDuration,
    formatShortDuration,
    parseTimeString,
    validateEmail,
    validatePassword,
    validateSessionName
} from '../utils';

describe('Time Formatter', () => {
    it('should format duration correctly', () => {
        expect(formatDuration(0)).toBe('0s');
        expect(formatDuration(45)).toBe('45s');
        expect(formatDuration(60)).toBe('1m 0s');
        expect(formatDuration(125)).toBe('2m 5s');
        expect(formatDuration(3600)).toBe('1h 0m 0s');
        expect(formatDuration(3665)).toBe('1h 1m 5s');
    });

    it('should format short duration correctly', () => {
        expect(formatShortDuration(0)).toBe('0:00');
        expect(formatShortDuration(45)).toBe('0:45');
        expect(formatShortDuration(60)).toBe('1:00');
        expect(formatShortDuration(125)).toBe('2:05');
        expect(formatShortDuration(3600)).toBe('1:00:00');
        expect(formatShortDuration(3665)).toBe('1:01:05');
    });

    it('should parse time string correctly', () => {
        expect(parseTimeString('45')).toBe(45);
        expect(parseTimeString('1:30')).toBe(90);
        expect(parseTimeString('1:05:30')).toBe(3930);
        expect(parseTimeString('')).toBe(0);
        expect(parseTimeString('invalid')).toBe(0);
    });
});

describe('Validation', () => {
    it('should validate email correctly', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('@example.com')).toBe(false);
        expect(validateEmail('test@.com')).toBe(false);
    });

    it('should validate password correctly', () => {
        expect(validatePassword('Password123')).toBe(true);
        expect(validatePassword('weak')).toBe(false);
        expect(validatePassword('nouppercase123')).toBe(false);
        expect(validatePassword('NOLOWERCASE123')).toBe(false);
        expect(validatePassword('NoNumbersHere')).toBe(false);
    });

    it('should validate session name correctly', () => {
        expect(validateSessionName('')).toBe('Session name is required');
        expect(validateSessionName('Valid Name')).toBe('');
        expect(validateSessionName('a'.repeat(101))).toBe('Session name must be less than 100 characters');
    });
});