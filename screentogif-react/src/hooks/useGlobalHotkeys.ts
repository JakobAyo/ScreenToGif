/**
 * useGlobalHotkeys Hook
 * React hook for registering global hotkey handlers
 */

import { useEffect, useCallback } from 'react';
import { GlobalHotkeyService } from '../services/GlobalHotkeyService';

/**
 * Hook for registering a global hotkey handler
 * @param action - The action to handle (e.g., 'recording.start')
 * @param handler - Callback function when the hotkey is pressed
 * @param deps - Dependencies for the handler
 */
export function useGlobalHotkey(
  action: string,
  handler: () => void,
  deps: React.DependencyList = []
): void {
  const memoizedHandler = useCallback(handler, deps);

  useEffect(() => {
    const unregister = GlobalHotkeyService.registerHandler(action, memoizedHandler);
    return unregister;
  }, [action, memoizedHandler]);
}

/**
 * Hook for registering a global handler for all hotkeys
 * @param handler - Callback function when any hotkey is pressed
 * @param deps - Dependencies for the handler
 */
export function useGlobalHotkeyHandler(
  handler: (action: string) => void,
  deps: React.DependencyList = []
): void {
  const memoizedHandler = useCallback(handler, deps);

  useEffect(() => {
    GlobalHotkeyService.setGlobalHandler(memoizedHandler);
    return () => {
      GlobalHotkeyService.setGlobalHandler(null);
    };
  }, [memoizedHandler]);
}

/**
 * Hook for temporarily disabling global hotkeys
 * Useful when capturing new hotkey bindings in settings
 */
export function useDisableGlobalHotkeys(disabled: boolean): void {
  useEffect(() => {
    if (disabled) {
      const wasEnabled = GlobalHotkeyService.isGlobalHotkeysEnabled();
      GlobalHotkeyService.setEnabled(false);
      return () => {
        if (wasEnabled) {
          GlobalHotkeyService.setEnabled(true);
        }
      };
    }
  }, [disabled]);
}
