import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from '../atoms/Icon';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastData {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

const variantStyles: Record<ToastVariant, { bg: string; icon: IconName; iconColor: string }> = {
  info: { bg: 'bg-surface-800', icon: 'information-circle', iconColor: 'text-accent-info' },
  success: { bg: 'bg-surface-800', icon: 'check-circle', iconColor: 'text-accent-success' },
  warning: { bg: 'bg-surface-800', icon: 'exclamation-circle', iconColor: 'text-accent-warning' },
  error: { bg: 'bg-surface-800', icon: 'x-circle', iconColor: 'text-accent-error' },
};

function ToastItem({ id, message, variant = 'info', duration = 5000, action, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isExiting, id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
  };

  const { bg, icon, iconColor } = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 min-w-[300px] max-w-md
        ${bg} rounded-lg border border-surface-700
        shadow-lg p-4
        ${isExiting ? 'animate-fade-out' : 'animate-slide-in'}
      `}
    >
      <Icon name={icon} size="md" className={`flex-shrink-0 ${iconColor}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-100">{message}</p>
        {action && (
          <button
            onClick={() => {
              action.onClick();
              handleDismiss();
            }}
            className="mt-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="
          flex-shrink-0 p-1 -m-1
          text-surface-500 hover:text-surface-300
          rounded transition-colors
        "
        aria-label="Dismiss"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  );
}

// Toast Container for positioning
interface ToastContainerProps {
  toasts: ToastData[];
  position?: ToastPosition;
  onDismiss: (id: string) => void;
}

const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

function ToastContainer({ toasts, position = 'top-right', onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const container = (
    <div
      className={`
        fixed z-50 flex flex-col gap-2
        ${positionStyles[position]}
      `}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );

  return createPortal(container, document.body);
}

// Toast Context and Provider
interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({ children, position = 'top-right', maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: ToastData = { ...toast, id };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      // Limit number of toasts
      if (updated.length > maxToasts) {
        return updated.slice(-maxToasts);
      }
      return updated;
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toasts
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, clearToasts } = context;

  return {
    toast: (message: string, options?: Partial<Omit<ToastData, 'id' | 'message'>>) =>
      addToast({ message, ...options }),
    success: (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) =>
      addToast({ message, variant: 'success', ...options }),
    error: (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) =>
      addToast({ message, variant: 'error', ...options }),
    warning: (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) =>
      addToast({ message, variant: 'warning', ...options }),
    info: (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) =>
      addToast({ message, variant: 'info', ...options }),
    dismiss: removeToast,
    dismissAll: clearToasts,
  };
}

// Simple standalone Toast component for direct usage
export interface StandaloneToastProps {
  type: ToastVariant;
  title: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function ToastComponent({ type, title, message, dismissible = true, onDismiss }: StandaloneToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.();
    }, 200);
  };

  const { bg, icon, iconColor } = variantStyles[type];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 min-w-[300px] max-w-md
        ${bg} rounded-lg border border-surface-700
        shadow-lg p-4
        ${isExiting ? 'animate-fade-out' : 'animate-slide-in'}
      `}
    >
      <Icon name={icon} size="md" className={`flex-shrink-0 ${iconColor}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-100">{title}</p>
        {message && <p className="text-sm text-surface-400 mt-1">{message}</p>}
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="
            flex-shrink-0 p-1 -m-1
            text-surface-500 hover:text-surface-300
            rounded transition-colors
          "
          aria-label="Dismiss"
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
}

// Re-export as Toast for backward compatibility with AppShell
export { ToastComponent as Toast };
