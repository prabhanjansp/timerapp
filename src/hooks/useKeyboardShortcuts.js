import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignore if user is typing in input/textarea
            if (
                event.target.tagName === 'INPUT' ||
                event.target.tagName === 'TEXTAREA' ||
                event.target.isContentEditable
            ) {
                return;
            }

            // Check each shortcut
            for (const shortcut of shortcuts) {
                if (
                    (!shortcut.ctrlKey || event.ctrlKey) &&
                    (!shortcut.altKey || event.altKey) &&
                    (!shortcut.shiftKey || event.shiftKey) &&
                    (!shortcut.metaKey || event.metaKey) &&
                    event.key === shortcut.key
                ) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};

// Common shortcuts preset
export const commonShortcuts = {
    startPause: {
        key: ' ',
        action: () => { },
        description: 'Start/Pause timer'
    },
    stop: {
        key: 'Escape',
        action: () => { },
        description: 'Stop timer'
    },
    studyMode: {
        key: '1',
        action: () => { },
        description: 'Switch to Study mode'
    },
    workMode: {
        key: '2',
        action: () => { },
        description: 'Switch to Work mode'
    },
    focusMode: {
        key: '3',
        action: () => { },
        description: 'Switch to Focus mode'
    },
    breakMode: {
        key: '4',
        action: () => { },
        description: 'Switch to Break mode'
    }
};