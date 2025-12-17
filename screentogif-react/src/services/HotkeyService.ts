/**
 * Hotkey Service
 * Global keyboard shortcut management and dispatching
 */

import type { HotkeyBinding } from '../stores/settingsStore';

/** Hotkey event handler */
export type HotkeyHandler = (action: string, event: KeyboardEvent) => void;

/** Modifier keys state */
interface ModifierState {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
}

class HotkeyServiceImpl {
  private bindings: HotkeyBinding[] = [];
  private handlers: Map<string, Set<HotkeyHandler>> = new Map();
  private globalHandlers: Set<HotkeyHandler> = new Set();
  private isEnabled = true;
  private isListening = false;
  private ignoredElements = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  /**
   * Initialize the hotkey service and start listening
   */
  initialize(bindings: HotkeyBinding[]): void {
    this.bindings = bindings;
    this.startListening();
  }

  /**
   * Update hotkey bindings
   */
  updateBindings(bindings: HotkeyBinding[]): void {
    this.bindings = bindings;
  }

  /**
   * Start listening for keyboard events
   */
  startListening(): void {
    if (this.isListening) {
      return;
    }

    this.keydownHandler = this.handleKeydown.bind(this);
    window.addEventListener('keydown', this.keydownHandler);
    this.isListening = true;
  }

  /**
   * Stop listening for keyboard events
   */
  stopListening(): void {
    if (!this.isListening || !this.keydownHandler) {
      return;
    }

    window.removeEventListener('keydown', this.keydownHandler);
    this.keydownHandler = null;
    this.isListening = false;
  }

  /**
   * Enable/disable hotkey handling
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if hotkeys are enabled
   */
  isHotkeysEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Register a handler for a specific action
   */
  registerHandler(action: string, handler: HotkeyHandler): () => void {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, new Set());
    }
    this.handlers.get(action)!.add(handler);

    return () => {
      this.handlers.get(action)?.delete(handler);
    };
  }

  /**
   * Register a global handler for all hotkeys
   */
  registerGlobalHandler(handler: HotkeyHandler): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  /**
   * Manually trigger a hotkey action
   */
  trigger(action: string): void {
    const event = new KeyboardEvent('keydown', {});
    this.dispatchAction(action, event);
  }

  /**
   * Get binding for an action
   */
  getBindingForAction(action: string): HotkeyBinding | undefined {
    return this.bindings.find((b) => b.action === action && b.enabled);
  }

  /**
   * Get display string for a hotkey
   */
  getHotkeyDisplayString(binding: HotkeyBinding): string {
    const parts: string[] = [];

    if (binding.modifiers.ctrl) parts.push('Ctrl');
    if (binding.modifiers.alt) parts.push('Alt');
    if (binding.modifiers.shift) parts.push('Shift');
    if (binding.modifiers.meta) parts.push('⌘');

    // Format special keys
    let key = binding.key;
    if (key === ' ') key = 'Space';
    if (key === 'ArrowUp') key = '↑';
    if (key === 'ArrowDown') key = '↓';
    if (key === 'ArrowLeft') key = '←';
    if (key === 'ArrowRight') key = '→';

    parts.push(key.length === 1 ? key.toUpperCase() : key);

    return parts.join('+');
  }

  /**
   * Check if a key combination matches a binding
   */
  matchesBinding(event: KeyboardEvent, binding: HotkeyBinding): boolean {
    if (!binding.enabled) return false;

    const modifiers = this.getModifiers(event);

    // Check modifiers
    if (!!binding.modifiers.ctrl !== modifiers.ctrl) return false;
    if (!!binding.modifiers.alt !== modifiers.alt) return false;
    if (!!binding.modifiers.shift !== modifiers.shift) return false;
    if (!!binding.modifiers.meta !== modifiers.meta) return false;

    // Check key
    return event.key.toLowerCase() === binding.key.toLowerCase();
  }

  /**
   * Set elements to ignore (inputs, textareas, etc.)
   */
  setIgnoredElements(tagNames: string[]): void {
    this.ignoredElements = new Set(tagNames.map((t) => t.toUpperCase()));
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    // Don't handle when focused on input elements
    const target = event.target as HTMLElement;
    if (this.ignoredElements.has(target.tagName)) {
      // Allow some hotkeys even in inputs (like Escape, F-keys)
      if (!this.isGlobalKey(event.key)) {
        return;
      }
    }

    // Find matching binding
    const binding = this.bindings.find((b) => this.matchesBinding(event, b));

    if (binding) {
      event.preventDefault();
      event.stopPropagation();
      this.dispatchAction(binding.action, event);
    }
  }

  private dispatchAction(action: string, event: KeyboardEvent): void {
    // Notify specific handlers
    const handlers = this.handlers.get(action);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(action, event);
        } catch (error) {
          console.error(`Hotkey handler error for action "${action}":`, error);
        }
      });
    }

    // Notify global handlers
    this.globalHandlers.forEach((handler) => {
      try {
        handler(action, event);
      } catch (error) {
        console.error('Global hotkey handler error:', error);
      }
    });
  }

  private getModifiers(event: KeyboardEvent): ModifierState {
    return {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey,
    };
  }

  private isGlobalKey(key: string): boolean {
    // Keys that work even in input fields
    return key === 'Escape' || key.startsWith('F');
  }

  /**
   * Clean up and stop service
   */
  destroy(): void {
    this.stopListening();
    this.handlers.clear();
    this.globalHandlers.clear();
    this.bindings = [];
  }
}

// Singleton instance
export const HotkeyService = new HotkeyServiceImpl();

// Hook for React components - placeholder that should be used with useEffect
export function useHotkey(_action: string, _handler: () => void): void {
  // This should be called within useEffect in React components
  // The actual implementation would use useEffect
}

// Convenience function to get display string for an action
export function getHotkeyDisplayForAction(action: string): string | null {
  const binding = HotkeyService.getBindingForAction(action);
  return binding ? HotkeyService.getHotkeyDisplayString(binding) : null;
}
