/**
 * GlobalHotkeyService
 * Global keyboard shortcut registration using Tauri
 * Works even when the app is not in focus
 */

import type { HotkeyBinding } from '../stores/settingsStore';

/** Global hotkey handler */
type GlobalHotkeyHandler = (action: string) => void;

/** Registered shortcut */
interface RegisteredShortcut {
  id: string;
  action: string;
  shortcut: string;
  unregister: () => Promise<void>;
}

class GlobalHotkeyServiceImpl {
  private isInitialized = false;
  private handlers: Map<string, Set<GlobalHotkeyHandler>> = new Map();
  private globalHandler: GlobalHotkeyHandler | null = null;
  private registeredShortcuts: Map<string, RegisteredShortcut> = new Map();
  private isEnabled = true;

  /**
   * Initialize the global hotkey service
   */
  async initialize(bindings: HotkeyBinding[]): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Check if Tauri is available
      // @ts-ignore
      if (!window.__TAURI__) {
        console.log('Tauri not available, global hotkeys disabled');
        return false;
      }

      // Register global hotkeys
      await this.registerBindings(bindings);

      // Setup event listener for global hotkey events
      await this.setupEventListener();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize global hotkey service:', error);
      return false;
    }
  }

  /**
   * Register hotkey bindings
   */
  async registerBindings(bindings: HotkeyBinding[]): Promise<void> {
    // Unregister existing bindings
    await this.unregisterAll();

    // Only register enabled bindings
    const enabledBindings = bindings.filter((b) => b.enabled);

    for (const binding of enabledBindings) {
      try {
        await this.registerBinding(binding);
      } catch (error) {
        console.error(`Failed to register hotkey for ${binding.action}:`, error);
      }
    }
  }

  /**
   * Register a single hotkey binding
   */
  private async registerBinding(binding: HotkeyBinding): Promise<void> {
    // @ts-ignore
    if (!window.__TAURI__) {
      return;
    }

    try {
      const shortcut = this.bindingToShortcut(binding);

      // Only register certain actions as global hotkeys
      // (recording actions are typically registered globally)
      const globalActions = [
        'recording.start',
        'recording.pause',
        'recording.stop',
        'recording.discard',
      ];

      if (!globalActions.includes(binding.action)) {
        return;
      }

      // @ts-ignore - Using Tauri global shortcut plugin
      const { register } = await import('@tauri-apps/plugin-global-shortcut');

      await register(shortcut, (event) => {
        if (event.state === 'Pressed' && this.isEnabled) {
          this.dispatchAction(binding.action);
        }
      });

      this.registeredShortcuts.set(binding.id, {
        id: binding.id,
        action: binding.action,
        shortcut,
        unregister: async () => {
          // @ts-ignore
          const { unregister } = await import('@tauri-apps/plugin-global-shortcut');
          await unregister(shortcut);
        },
      });
    } catch (error) {
      console.error(`Failed to register shortcut ${binding.action}:`, error);
    }
  }

  /**
   * Setup event listener for Rust-side global shortcuts
   */
  private async setupEventListener(): Promise<void> {
    try {
      // @ts-ignore
      const { listen } = await import('@tauri-apps/api/event');

      await listen('global-hotkey', (event: { payload: string }) => {
        if (this.isEnabled) {
          this.dispatchAction(event.payload);
        }
      });
    } catch (error) {
      console.error('Failed to setup global hotkey listener:', error);
    }
  }

  /**
   * Convert a HotkeyBinding to Tauri shortcut string
   */
  private bindingToShortcut(binding: HotkeyBinding): string {
    const parts: string[] = [];

    if (binding.modifiers.ctrl) parts.push('Ctrl');
    if (binding.modifiers.alt) parts.push('Alt');
    if (binding.modifiers.shift) parts.push('Shift');
    if (binding.modifiers.meta) parts.push('Super');

    // Map special keys
    let key = binding.key;
    if (key === ' ') key = 'Space';
    if (key === 'ArrowUp') key = 'Up';
    if (key === 'ArrowDown') key = 'Down';
    if (key === 'ArrowLeft') key = 'Left';
    if (key === 'ArrowRight') key = 'Right';

    parts.push(key);

    return parts.join('+');
  }

  /**
   * Dispatch an action to all registered handlers
   */
  private dispatchAction(action: string): void {
    // Notify global handler
    this.globalHandler?.(action);

    // Notify action-specific handlers
    const handlers = this.handlers.get(action);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(action);
        } catch (error) {
          console.error(`Global hotkey handler error for action "${action}":`, error);
        }
      });
    }
  }

  /**
   * Register a handler for a specific action
   */
  registerHandler(action: string, handler: GlobalHotkeyHandler): () => void {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, new Set());
    }
    this.handlers.get(action)!.add(handler);

    return () => {
      this.handlers.get(action)?.delete(handler);
    };
  }

  /**
   * Register a global handler for all shortcuts
   */
  setGlobalHandler(handler: GlobalHotkeyHandler | null): void {
    this.globalHandler = handler;
  }

  /**
   * Enable or disable global hotkeys
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if global hotkeys are enabled
   */
  isGlobalHotkeysEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Unregister all shortcuts
   */
  async unregisterAll(): Promise<void> {
    for (const [id, shortcut] of this.registeredShortcuts) {
      try {
        await shortcut.unregister();
      } catch (error) {
        console.error(`Failed to unregister shortcut ${id}:`, error);
      }
    }
    this.registeredShortcuts.clear();
  }

  /**
   * Update bindings
   */
  async updateBindings(bindings: HotkeyBinding[]): Promise<void> {
    await this.registerBindings(bindings);
  }

  /**
   * Destroy the service
   */
  async destroy(): Promise<void> {
    await this.unregisterAll();
    this.handlers.clear();
    this.globalHandler = null;
    this.isInitialized = false;
  }
}

// Singleton instance
export const GlobalHotkeyService = new GlobalHotkeyServiceImpl();
