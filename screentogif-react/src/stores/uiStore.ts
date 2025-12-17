/**
 * UI Store
 * Manages global UI state: modals, toasts, sidebar, loading states
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/** Toast notification types */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/** Toast notification */
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible: boolean;
  createdAt: number;
}

/** Modal types in the application */
export type ModalType =
  | 'settings'
  | 'about'
  | 'newProject'
  | 'openProject'
  | 'saveProject'
  | 'exportOptions'
  | 'hotkeys'
  | 'updateAvailable'
  | 'unsavedChanges'
  | 'deleteConfirm'
  | 'feedback'
  | 'license'
  | 'changelog'
  | 'regionSelector'
  | 'webcamPreview'
  | 'customFrameDelay'
  | 'batchEdit'
  | 'imageEffects'
  | 'textOverlay'
  | 'watermark'
  | 'border'
  | 'resize'
  | 'crop';

/** Modal state */
export interface ModalState {
  type: ModalType;
  isOpen: boolean;
  data?: unknown;
  onClose?: () => void;
  onConfirm?: () => void;
}

/** Active view/page in the application */
export type AppView = 'startup' | 'recorder' | 'editor' | 'webcam' | 'board' | 'settings';

/** Panel types */
export type PanelId = 'sidebar' | 'timeline' | 'properties' | 'preview';

interface UIState {
  // Current view
  currentView: AppView;
  previousView: AppView | null;

  // Modals
  openModals: ModalState[];

  // Toasts
  toasts: Toast[];
  maxToasts: number;

  // Panels
  panelStates: Record<PanelId, { isOpen: boolean; width?: number; height?: number }>;

  // Loading states
  isAppLoading: boolean;
  loadingMessage: string | null;
  isBackendConnecting: boolean;
  isBackendConnected: boolean;

  // Drag and drop
  isDragging: boolean;
  dragSource: string | null;
  dragData: unknown;

  // Context menu
  contextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null;

  // Selection overlay (for region capture)
  selectionOverlay: {
    isActive: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;

  // Help/Tutorial
  showTutorial: boolean;
  tutorialStep: number;
  showHelpPanel: boolean;

  // Focus state
  focusedElement: string | null;
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
  shortcut?: string;
  onClick?: () => void;
  submenu?: ContextMenuItem[];
}

interface UIActions {
  // View navigation
  setCurrentView: (view: AppView) => void;
  navigateBack: () => void;

  // Modal management
  openModal: (type: ModalType, data?: unknown, callbacks?: { onClose?: () => void; onConfirm?: () => void }) => void;
  closeModal: (type: ModalType) => void;
  closeAllModals: () => void;
  isModalOpen: (type: ModalType) => boolean;
  getModalData: <T>(type: ModalType) => T | undefined;

  // Toast management
  showToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
  showSuccessToast: (title: string, message?: string) => string;
  showErrorToast: (title: string, message?: string) => string;
  showInfoToast: (title: string, message?: string) => string;
  showWarningToast: (title: string, message?: string) => string;

  // Panel management
  togglePanel: (panelId: PanelId) => void;
  setPanelOpen: (panelId: PanelId, isOpen: boolean) => void;
  setPanelSize: (panelId: PanelId, size: { width?: number; height?: number }) => void;

  // Loading states
  setAppLoading: (loading: boolean, message?: string) => void;
  setBackendConnecting: (connecting: boolean) => void;
  setBackendConnected: (connected: boolean) => void;

  // Drag and drop
  startDrag: (source: string, data: unknown) => void;
  endDrag: () => void;

  // Context menu
  showContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  hideContextMenu: () => void;

  // Selection overlay
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => { x: number; y: number; width: number; height: number } | null;
  cancelSelection: () => void;

  // Help/Tutorial
  setShowTutorial: (show: boolean) => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  setTutorialStep: (step: number) => void;
  setShowHelpPanel: (show: boolean) => void;

  // Focus
  setFocusedElement: (elementId: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState: UIState = {
  currentView: 'startup',
  previousView: null,
  openModals: [],
  toasts: [],
  maxToasts: 5,
  panelStates: {
    sidebar: { isOpen: true, width: 280 },
    timeline: { isOpen: true, height: 200 },
    properties: { isOpen: false, width: 300 },
    preview: { isOpen: true },
  },
  isAppLoading: true,
  loadingMessage: 'Starting application...',
  isBackendConnecting: false,
  isBackendConnected: false,
  isDragging: false,
  dragSource: null,
  dragData: null,
  contextMenu: null,
  selectionOverlay: null,
  showTutorial: false,
  tutorialStep: 0,
  showHelpPanel: false,
  focusedElement: null,
};

export const useUIStore = create<UIState & UIActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // View navigation
    setCurrentView: (currentView) =>
      set((state) => ({ currentView, previousView: state.currentView })),
    navigateBack: () =>
      set((state) => ({
        currentView: state.previousView ?? 'startup',
        previousView: null,
      })),

    // Modal management
    openModal: (type, data, callbacks) =>
      set((state) => ({
        openModals: [
          ...state.openModals.filter((m) => m.type !== type),
          {
            type,
            isOpen: true,
            data,
            onClose: callbacks?.onClose,
            onConfirm: callbacks?.onConfirm,
          },
        ],
      })),

    closeModal: (type) =>
      set((state) => {
        const modal = state.openModals.find((m) => m.type === type);
        modal?.onClose?.();
        return { openModals: state.openModals.filter((m) => m.type !== type) };
      }),

    closeAllModals: () => {
      const { openModals } = get();
      openModals.forEach((m) => m.onClose?.());
      set({ openModals: [] });
    },

    isModalOpen: (type) => get().openModals.some((m) => m.type === type && m.isOpen),

    getModalData: <T,>(type: ModalType) => {
      const modal = get().openModals.find((m) => m.type === type);
      return modal?.data as T | undefined;
    },

    // Toast management
    showToast: (toast) => {
      const id = crypto.randomUUID();
      set((state) => {
        const newToast: Toast = {
          ...toast,
          id,
          createdAt: Date.now(),
          duration: toast.duration ?? 5000,
          dismissible: toast.dismissible ?? true,
        };
        const toasts = [newToast, ...state.toasts].slice(0, state.maxToasts);
        return { toasts };
      });

      // Auto-dismiss if duration > 0
      if (toast.duration !== 0) {
        setTimeout(() => {
          get().dismissToast(id);
        }, toast.duration ?? 5000);
      }

      return id;
    },

    dismissToast: (id) =>
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

    dismissAllToasts: () => set({ toasts: [] }),

    showSuccessToast: (title, message) =>
      get().showToast({ type: 'success', title, message, dismissible: true }),

    showErrorToast: (title, message) =>
      get().showToast({ type: 'error', title, message, duration: 0, dismissible: true }),

    showInfoToast: (title, message) =>
      get().showToast({ type: 'info', title, message, dismissible: true }),

    showWarningToast: (title, message) =>
      get().showToast({ type: 'warning', title, message, dismissible: true }),

    // Panel management
    togglePanel: (panelId) =>
      set((state) => ({
        panelStates: {
          ...state.panelStates,
          [panelId]: {
            ...state.panelStates[panelId],
            isOpen: !state.panelStates[panelId].isOpen,
          },
        },
      })),

    setPanelOpen: (panelId, isOpen) =>
      set((state) => ({
        panelStates: {
          ...state.panelStates,
          [panelId]: { ...state.panelStates[panelId], isOpen },
        },
      })),

    setPanelSize: (panelId, size) =>
      set((state) => ({
        panelStates: {
          ...state.panelStates,
          [panelId]: { ...state.panelStates[panelId], ...size },
        },
      })),

    // Loading states
    setAppLoading: (isAppLoading, loadingMessage) =>
      set({ isAppLoading, loadingMessage: loadingMessage ?? null }),

    setBackendConnecting: (isBackendConnecting) => set({ isBackendConnecting }),

    setBackendConnected: (isBackendConnected) => set({ isBackendConnected }),

    // Drag and drop
    startDrag: (dragSource, dragData) => set({ isDragging: true, dragSource, dragData }),
    endDrag: () => set({ isDragging: false, dragSource: null, dragData: null }),

    // Context menu
    showContextMenu: (x, y, items) =>
      set({ contextMenu: { isOpen: true, x, y, items } }),
    hideContextMenu: () => set({ contextMenu: null }),

    // Selection overlay
    startSelection: (x, y) =>
      set({ selectionOverlay: { isActive: true, startX: x, startY: y, endX: x, endY: y } }),

    updateSelection: (x, y) =>
      set((state) => ({
        selectionOverlay: state.selectionOverlay
          ? { ...state.selectionOverlay, endX: x, endY: y }
          : null,
      })),

    endSelection: () => {
      const { selectionOverlay } = get();
      if (!selectionOverlay) return null;

      const x = Math.min(selectionOverlay.startX, selectionOverlay.endX);
      const y = Math.min(selectionOverlay.startY, selectionOverlay.endY);
      const width = Math.abs(selectionOverlay.endX - selectionOverlay.startX);
      const height = Math.abs(selectionOverlay.endY - selectionOverlay.startY);

      set({ selectionOverlay: null });
      return { x, y, width, height };
    },

    cancelSelection: () => set({ selectionOverlay: null }),

    // Help/Tutorial
    setShowTutorial: (showTutorial) => set({ showTutorial }),
    nextTutorialStep: () => set((state) => ({ tutorialStep: state.tutorialStep + 1 })),
    prevTutorialStep: () =>
      set((state) => ({ tutorialStep: Math.max(0, state.tutorialStep - 1) })),
    setTutorialStep: (tutorialStep) => set({ tutorialStep }),
    setShowHelpPanel: (showHelpPanel) => set({ showHelpPanel }),

    // Focus
    setFocusedElement: (focusedElement) => set({ focusedElement }),

    // Reset
    reset: () => set(initialState),
  }))
);

// Selector hooks
export const selectCurrentView = (state: UIState) => state.currentView;
export const selectIsLoading = (state: UIState) => state.isAppLoading;
export const selectToasts = (state: UIState) => state.toasts;
export const selectIsBackendConnected = (state: UIState) => state.isBackendConnected;
