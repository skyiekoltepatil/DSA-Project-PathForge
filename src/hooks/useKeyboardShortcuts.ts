import { useEffect } from 'react';
import { KEYBOARD_SHORTCUTS } from '../utils/constants';

interface KeyboardShortcutsProps {
  onStartPause: () => void;
  onReset: () => void;
  onClear: () => void;
  onMaze: () => void;
  disabled: boolean;
}

export function useKeyboardShortcuts({
  onStartPause,
  onReset,
  onClear,
  onMaze,
  disabled
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'BUTTON'
      ) {
        // Only ignore Space for buttons, let R/C/M work
        if (e.key === KEYBOARD_SHORTCUTS.START_PAUSE && document.activeElement?.tagName === 'BUTTON') {
            return;
        }
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
            return;
        }
      }

      switch (e.key.toLowerCase()) {
        case KEYBOARD_SHORTCUTS.START_PAUSE:
          e.preventDefault(); // Prevent page scroll on space
          onStartPause();
          break;
        case KEYBOARD_SHORTCUTS.RESET:
          onReset();
          break;
        case KEYBOARD_SHORTCUTS.CLEAR:
          onClear();
          break;
        case KEYBOARD_SHORTCUTS.MAZE:
          onMaze();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartPause, onReset, onClear, onMaze, disabled]);
}
