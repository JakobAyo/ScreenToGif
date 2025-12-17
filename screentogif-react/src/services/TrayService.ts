/**
 * TrayService
 * System tray management for the application
 */

import type { AppView } from '../stores/uiStore';

/** Tray menu item */
interface TrayMenuItem {
  id: string;
  label: string;
  enabled?: boolean;
  checked?: boolean;
  accelerator?: string;
}

/** Tray service callbacks */
interface TrayServiceCallbacks {
  onShow: () => void;
  onHide: () => void;
  onNavigate: (view: AppView) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onQuit: () => void;
}

class TrayServiceImpl {
  private isInitialized = false;
  private callbacks: TrayServiceCallbacks | null = null;
  private isMinimizedToTray = false;

  /**
   * Initialize the tray service
   */
  async initialize(callbacks: TrayServiceCallbacks): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    this.callbacks = callbacks;

    try {
      // Check if Tauri is available
      // @ts-ignore
      if (!window.__TAURI__) {
        console.log('Tauri not available, tray service disabled');
        return false;
      }

      // In Tauri 2.0, tray setup is done in Rust
      // This service handles the frontend callbacks
      await this.setupTrayListeners();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize tray service:', error);
      return false;
    }
  }

  /**
   * Setup event listeners for tray actions
   */
  private async setupTrayListeners(): Promise<void> {
    try {
      // @ts-ignore
      const { listen } = await import('@tauri-apps/api/event');

      // Listen for tray menu item clicks
      await listen('tray-menu-action', (event: { payload: string }) => {
        this.handleTrayAction(event.payload);
      });

      // Listen for tray icon click
      await listen('tray-icon-click', () => {
        this.handleTrayClick();
      });

      // Listen for tray double click
      await listen('tray-icon-double-click', () => {
        this.show();
      });
    } catch (error) {
      console.error('Failed to setup tray listeners:', error);
    }
  }

  /**
   * Handle tray menu actions
   */
  private handleTrayAction(action: string): void {
    if (!this.callbacks) return;

    switch (action) {
      case 'show':
        this.show();
        break;
      case 'hide':
        this.hide();
        break;
      case 'recorder':
        this.callbacks.onNavigate('recorder');
        this.show();
        break;
      case 'editor':
        this.callbacks.onNavigate('editor');
        this.show();
        break;
      case 'settings':
        this.callbacks.onNavigate('settings');
        this.show();
        break;
      case 'start-recording':
        this.callbacks.onStartRecording();
        break;
      case 'stop-recording':
        this.callbacks.onStopRecording();
        break;
      case 'quit':
        this.callbacks.onQuit();
        break;
      default:
        console.warn('Unknown tray action:', action);
    }
  }

  /**
   * Handle tray icon single click
   */
  private handleTrayClick(): void {
    // Single click shows the window
    this.show();
  }

  /**
   * Show the application window
   */
  async show(): Promise<void> {
    try {
      // @ts-ignore
      if (window.__TAURI__) {
        // @ts-ignore
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const window = getCurrentWindow();
        await window.show();
        await window.setFocus();
        this.isMinimizedToTray = false;
        this.callbacks?.onShow();
      }
    } catch (error) {
      console.error('Failed to show window:', error);
    }
  }

  /**
   * Hide the application window to tray
   */
  async hide(): Promise<void> {
    try {
      // @ts-ignore
      if (window.__TAURI__) {
        // @ts-ignore
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const window = getCurrentWindow();
        await window.hide();
        this.isMinimizedToTray = true;
        this.callbacks?.onHide();
      }
    } catch (error) {
      console.error('Failed to hide window:', error);
    }
  }

  /**
   * Minimize the application to tray
   */
  async minimizeToTray(): Promise<void> {
    await this.hide();
  }

  /**
   * Check if window is minimized to tray
   */
  isMinimized(): boolean {
    return this.isMinimizedToTray;
  }

  /**
   * Update tray icon tooltip
   */
  async setTooltip(tooltip: string): Promise<void> {
    try {
      // @ts-ignore
      if (window.__TAURI__) {
        // @ts-ignore
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('set_tray_tooltip', { tooltip });
      }
    } catch (error) {
      console.error('Failed to set tray tooltip:', error);
    }
  }

  /**
   * Update tray icon to recording state
   */
  async setRecordingState(isRecording: boolean): Promise<void> {
    try {
      // @ts-ignore
      if (window.__TAURI__) {
        // @ts-ignore
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('set_tray_recording_state', { isRecording });
      }
    } catch (error) {
      console.error('Failed to set tray recording state:', error);
    }
  }

  /**
   * Destroy the tray service
   */
  destroy(): void {
    this.isInitialized = false;
    this.callbacks = null;
  }
}

// Singleton instance
export const TrayService = new TrayServiceImpl();
