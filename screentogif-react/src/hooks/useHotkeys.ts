import { useEffect, useRef } from 'react';

export type KeyModifiers = {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
};

export interface HotkeyConfig {
  key: string;
  modifiers?: KeyModifiers;
  callback: (event: KeyboardEvent) => void;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  description?: string;
}

export interface UseHotkeysOptions {
  enableOnInput?: boolean;
  enableOnContentEditable?: boolean;
}

function matchesModifiers(event: KeyboardEvent, modifiers?: KeyModifiers): boolean {
  const { ctrl = false, alt = false, shift = false, meta = false } = modifiers || {};
  return (
    event.ctrlKey === ctrl &&
    event.altKey === alt &&
    event.shiftKey === shift &&
    event.metaKey === meta
  );
}

function isInputElement(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.isContentEditable
  );
}

export function useHotkeys(
  hotkeys: HotkeyConfig[],
  options: UseHotkeysOptions = {}
): void {
  const { enableOnInput = false, enableOnContentEditable = false } = options;
  const hotkeysRef = useRef(hotkeys);
  hotkeysRef.current = hotkeys;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if focus is on an input element
      if (!enableOnInput && isInputElement(event.target)) {
        if (!enableOnContentEditable && (event.target as HTMLElement).isContentEditable) {
          return;
        }
        return;
      }

      for (const hotkey of hotkeysRef.current) {
        // Skip disabled hotkeys
        if (hotkey.enabled === false) continue;

        // Check key match (case-insensitive)
        const keyMatch = event.key.toLowerCase() === hotkey.key.toLowerCase();
        if (!keyMatch) continue;

        // Check modifiers match
        if (!matchesModifiers(event, hotkey.modifiers)) continue;

        // Execute callback
        if (hotkey.preventDefault !== false) {
          event.preventDefault();
        }
        if (hotkey.stopPropagation) {
          event.stopPropagation();
        }
        hotkey.callback(event);
        break; // Only execute first matching hotkey
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableOnInput, enableOnContentEditable]);
}

// Simpler hook for single hotkey
export function useHotkey(
  key: string,
  callback: (event: KeyboardEvent) => void,
  modifiers?: KeyModifiers,
  options?: UseHotkeysOptions & { enabled?: boolean }
): void {
  useHotkeys(
    [
      {
        key,
        modifiers,
        callback,
        enabled: options?.enabled,
      },
    ],
    options
  );
}

// Hook to get hotkey string representation
export function formatHotkey(key: string, modifiers?: KeyModifiers): string {
  const parts: string[] = [];

  if (modifiers?.ctrl) parts.push('Ctrl');
  if (modifiers?.alt) parts.push('Alt');
  if (modifiers?.shift) parts.push('Shift');
  if (modifiers?.meta) parts.push('⌘');

  // Capitalize key for display
  const displayKey = key.length === 1 ? key.toUpperCase() : key;
  parts.push(displayKey);

  return parts.join('+');
}

// Common hotkey presets
export const COMMON_HOTKEYS = {
  save: { key: 's', modifiers: { ctrl: true } },
  undo: { key: 'z', modifiers: { ctrl: true } },
  redo: { key: 'y', modifiers: { ctrl: true } },
  redoAlt: { key: 'z', modifiers: { ctrl: true, shift: true } },
  copy: { key: 'c', modifiers: { ctrl: true } },
  paste: { key: 'v', modifiers: { ctrl: true } },
  cut: { key: 'x', modifiers: { ctrl: true } },
  selectAll: { key: 'a', modifiers: { ctrl: true } },
  delete: { key: 'Delete' },
  escape: { key: 'Escape' },
  enter: { key: 'Enter' },
  space: { key: ' ' },
  // Recording specific
  record: { key: 'F7' },
  stop: { key: 'F8' },
  pause: { key: 'F9' },
  // Navigation
  nextFrame: { key: 'ArrowRight' },
  prevFrame: { key: 'ArrowLeft' },
  firstFrame: { key: 'Home' },
  lastFrame: { key: 'End' },
  // Playback
  play: { key: ' ' },
} as const;
