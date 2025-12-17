/**
 * Services Index
 * Re-exports all frontend services
 */

// Backend service (existing)
export {
  startBackend,
  stopBackend,
  getBackendStatus,
  healthCheck,
  getBackendInfo,
  pingBackend,
} from './backend';
export type {
  BackendStatus,
  BackendInfo,
  HealthCheckResponse,
  PingResponse,
} from './backend';

// Hotkey Service
export {
  HotkeyService,
  getHotkeyDisplayForAction,
} from './HotkeyService';
export type { HotkeyHandler } from './HotkeyService';

// Notification Service
export { NotificationService } from './NotificationService';
export type { SystemNotificationOptions, NotificationPermission } from './NotificationService';

// Localization Service
export {
  LocalizationService,
  SUPPORTED_LOCALES,
  t,
  tp,
} from './LocalizationService';
