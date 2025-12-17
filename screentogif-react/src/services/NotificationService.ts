/**
 * Notification Service
 * Centralized notification management for system and in-app notifications
 */

import { useUIStore, type Toast, type ToastType } from '../stores';

/** System notification options */
export interface SystemNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
  onClick?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

/** Notification permission state */
export type NotificationPermission = 'default' | 'granted' | 'denied';

class NotificationServiceImpl {
  private systemNotificationsEnabled = true;
  private inAppNotificationsEnabled = true;
  private soundsEnabled = true;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.checkPermission();
  }

  /**
   * Check and store current notification permission
   */
  async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      this.permission = 'denied';
      return 'denied';
    }
    this.permission = Notification.permission;
    return this.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  /**
   * Get current permission state
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Enable/disable system notifications
   */
  setSystemNotificationsEnabled(enabled: boolean): void {
    this.systemNotificationsEnabled = enabled;
  }

  /**
   * Enable/disable in-app notifications
   */
  setInAppNotificationsEnabled(enabled: boolean): void {
    this.inAppNotificationsEnabled = enabled;
  }

  /**
   * Enable/disable notification sounds
   */
  setSoundsEnabled(enabled: boolean): void {
    this.soundsEnabled = enabled;
  }

  /**
   * Show a system notification
   */
  async showSystemNotification(options: SystemNotificationOptions): Promise<Notification | null> {
    if (!this.systemNotificationsEnabled) {
      return null;
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return null;
      }
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      silent: options.silent,
    });

    if (options.onClick) {
      notification.onclick = () => {
        options.onClick!();
        notification.close();
      };
    }

    if (options.onClose) {
      notification.onclose = () => options.onClose!();
    }

    if (options.onError) {
      notification.onerror = () => options.onError!(new Error('Notification error'));
    }

    return notification;
  }

  /**
   * Show an in-app toast notification
   */
  showToast(type: ToastType, title: string, message?: string, options?: Partial<Toast>): string {
    if (!this.inAppNotificationsEnabled) {
      return '';
    }

    const toast: Omit<Toast, 'id' | 'createdAt'> = {
      type,
      title,
      message,
      dismissible: options?.dismissible ?? true,
      duration: options?.duration,
      action: options?.action,
    };

    return useUIStore.getState().showToast(toast);
  }

  /**
   * Show success notification
   */
  success(title: string, message?: string): string {
    return this.showToast('success', title, message);
  }

  /**
   * Show error notification
   */
  error(title: string, message?: string): string {
    return this.showToast('error', title, message, { duration: 0 }); // Persistent
  }

  /**
   * Show warning notification
   */
  warning(title: string, message?: string): string {
    return this.showToast('warning', title, message);
  }

  /**
   * Show info notification
   */
  info(title: string, message?: string): string {
    return this.showToast('info', title, message);
  }

  /**
   * Dismiss a specific toast
   */
  dismissToast(id: string): void {
    useUIStore.getState().dismissToast(id);
  }

  /**
   * Dismiss all toasts
   */
  dismissAllToasts(): void {
    useUIStore.getState().dismissAllToasts();
  }

  /**
   * Show notification with both system and in-app
   */
  async notify(
    type: ToastType,
    title: string,
    message?: string,
    options?: {
      systemNotification?: boolean;
      inAppNotification?: boolean;
      sound?: boolean;
    }
  ): Promise<{ toastId?: string; systemNotification?: Notification | null }> {
    const result: { toastId?: string; systemNotification?: Notification | null } = {};

    // Show in-app notification
    if (options?.inAppNotification !== false) {
      result.toastId = this.showToast(type, title, message);
    }

    // Show system notification
    if (options?.systemNotification) {
      result.systemNotification = await this.showSystemNotification({
        title,
        body: message ?? '',
      });
    }

    // Play sound
    if (options?.sound && this.soundsEnabled) {
      this.playNotificationSound(type);
    }

    return result;
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(type: ToastType): void {
    // Sound playing implementation would go here
    // Could use Web Audio API or simple Audio elements
    const soundMap: Record<ToastType, string> = {
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      warning: '/sounds/warning.mp3',
      info: '/sounds/info.mp3',
    };

    const soundUrl = soundMap[type];
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }

  /**
   * Recording started notification
   */
  notifyRecordingStarted(): void {
    this.success('Recording Started', 'Screen capture has begun');
  }

  /**
   * Recording stopped notification
   */
  notifyRecordingStopped(frameCount: number, duration: number): void {
    const durationStr = (duration / 1000).toFixed(1);
    this.success(
      'Recording Stopped',
      `Captured ${frameCount} frames over ${durationStr} seconds`
    );
  }

  /**
   * Export completed notification
   */
  async notifyExportCompleted(outputPath: string, fileSize: number): Promise<void> {
    const sizeMB = (fileSize / 1024 / 1024).toFixed(2);
    const fileName = outputPath.split(/[/\\]/).pop() ?? outputPath;

    await this.notify('success', 'Export Completed', `${fileName} (${sizeMB} MB)`, {
      systemNotification: true,
      inAppNotification: true,
    });
  }

  /**
   * Export failed notification
   */
  notifyExportFailed(error: string): void {
    this.error('Export Failed', error);
  }

  /**
   * Upload completed notification
   */
  async notifyUploadCompleted(_url: string): Promise<void> {
    await this.notify('success', 'Upload Completed', 'Link copied to clipboard', {
      systemNotification: true,
      inAppNotification: true,
    });
  }

  /**
   * Unsaved changes notification
   */
  notifyUnsavedChanges(): void {
    this.warning('Unsaved Changes', 'You have unsaved changes that will be lost');
  }

  /**
   * Auto-save notification
   */
  notifyAutoSaved(): void {
    this.info('Auto-Saved', 'Your project has been automatically saved');
  }

  /**
   * Update available notification
   */
  async notifyUpdateAvailable(version: string): Promise<void> {
    await this.notify('info', 'Update Available', `Version ${version} is available`, {
      systemNotification: true,
      inAppNotification: true,
    });
  }
}

// Singleton instance
export const NotificationService = new NotificationServiceImpl();
