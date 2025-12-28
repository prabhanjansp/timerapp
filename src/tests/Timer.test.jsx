import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Timer from '../components/Timer';
import { useTimerStore } from '../store/timerStore';

// Mock the store
vi.mock('../store/timerStore', () => ({
    useTimerStore: vi.fn()
}));

describe('Timer Component', () => {
    beforeEach(() => {
        useTimerStore.mockReturnValue({
            time: 1500,
            isRunning: false,
            timerType: 'focus',
            startTimer: vi.fn(),
            pauseTimer: vi.fn(),
            stopTimer: vi.fn(),
            setTime: vi.fn(),
            setTimerType: vi.fn(),
            darkMode: false,
            toggleDarkMode: vi.fn()
        });
    });

    it('renders timer display correctly', () => {
        render(<Timer />);
        expect(screen.getByText('25:00')).toBeInTheDocument();
    });

    it('shows start button when timer is not running', () => {
        render(<Timer />);
        expect(screen.getByText('Start')).toBeInTheDocument();
    });

    it('shows pause button when timer is running', () => {
        useTimerStore.mockReturnValue({
            ...useTimerStore(),
            isRunning: true
        });
        render(<Timer />);
        expect(screen.getByText('Pause')).toBeInTheDocument();
    });
});