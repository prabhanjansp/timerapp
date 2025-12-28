import { describe, it, expect, beforeEach } from 'vitest';
import { useTimerStore } from '../store/timerStore';

describe('Timer Store', () => {
    let store;

    beforeEach(() => {
        store = useTimerStore.getState();
        store.resetTimer();
        store.clearAllSessions();
    });

    it('should initialize with default values', () => {
        expect(store.time).toBe(0);
        expect(store.isRunning).toBe(false);
        expect(store.timerType).toBe('focus');
        expect(store.sessions).toEqual([]);
    });

    it('should start and pause timer', () => {
        store.startTimer();
        expect(store.isRunning).toBe(true);
        expect(store.startTime).not.toBeNull();

        store.pauseTimer();
        expect(store.isRunning).toBe(false);
    });

    it('should set timer type and time', () => {
        store.setTimerType('study');
        expect(store.timerType).toBe('study');
        expect(store.time).toBe(1500); // 25 minutes in seconds

        store.setTime(300);
        expect(store.time).toBe(300);
    });

    it('should stop timer and save session', () => {
        store.setTimerType('work');
        store.setTime(1800);
        store.startTimer();

        const sessionData = {
            name: 'Test Session',
            description: 'Testing timer',
            satisfaction: 4
        };

        store.stopTimer(sessionData);

        expect(store.isRunning).toBe(false);
        expect(store.time).toBe(0);
        expect(store.sessions.length).toBe(1);

        const session = store.sessions[0];
        expect(session.name).toBe('Test Session');
        expect(session.type).toBe('work');
        expect(session.duration).toBe(1800);
        expect(session.satisfaction).toBe(4);
    });

    it('should update streak correctly', () => {
        // Simulate today's session
        const today = new Date().toISOString();
        store.addSession({
            id: 1,
            startTime: today,
            duration: 1800,
            type: 'focus'
        });

        expect(store.streak).toBe(1);
        expect(store.lastSessionDate).toBe(today.split('T')[0]);
    });

    it('should export sessions', () => {
        // Add test sessions
        store.addSession({
            id: 1,
            startTime: new Date().toISOString(),
            duration: 1800,
            type: 'focus',
            name: 'Test Session 1'
        });

        store.addSession({
            id: 2,
            startTime: new Date().toISOString(),
            duration: 1200,
            type: 'study',
            name: 'Test Session 2'
        });

        const jsonExport = store.exportSessions('json');
        expect(typeof jsonExport).toBe('string');

        const parsed = JSON.parse(jsonExport);
        expect(parsed.length).toBe(2);

        const csvExport = store.exportSessions('csv');
        expect(typeof csvExport).toBe('string');
        expect(csvExport.includes('Test Session 1')).toBe(true);
    });

    it('should filter today sessions', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        store.addSession({
            id: 1,
            startTime: today.toISOString(),
            duration: 1800,
            type: 'focus'
        });

        store.addSession({
            id: 2,
            startTime: yesterday.toISOString(),
            duration: 1200,
            type: 'study'
        });

        const todaySessions = store.getTodaySessions();
        expect(todaySessions.length).toBe(1);
        expect(todaySessions[0].id).toBe(1);
    });

    it('should toggle settings', () => {
        expect(store.soundEnabled).toBe(true);
        store.toggleSound();
        expect(store.soundEnabled).toBe(false);

        expect(store.notificationsEnabled).toBe(true);
        store.toggleNotifications();
        expect(store.notificationsEnabled).toBe(false);
    });
});