/**
 * WindowOption Component
 * Display option for window capture
 */

import type { WindowInfo } from '../../../../api/types';
import { Icon } from '../../../../components/atoms/Icon';

export interface WindowOptionProps {
  window: WindowInfo;
  isSelected: boolean;
  onClick: () => void;
  thumbnail?: string; // Base64 encoded thumbnail image
}

export function WindowOption({ window, isSelected, onClick, thumbnail }: WindowOptionProps) {
  const isMinimized = window.isMinimized;

  return (
    <button
      onClick={onClick}
      disabled={isMinimized}
      className={`
        w-full p-3 rounded-lg border transition-all duration-150
        flex items-center gap-3 text-left
        ${isMinimized ? 'opacity-50 cursor-not-allowed' : ''}
        ${
          isSelected
            ? 'border-primary-500 bg-primary-500/10'
            : isMinimized
              ? 'border-surface-700 bg-surface-800/50'
              : 'border-surface-600 bg-surface-800 hover:border-surface-500 hover:bg-surface-700'
        }
      `}
    >
      {/* Window thumbnail/icon */}
      <div
        className={`
          relative w-16 h-10 rounded border flex-shrink-0 overflow-hidden
          flex items-center justify-center
          ${isSelected ? 'border-primary-500/50' : 'border-surface-500'}
        `}
      >
        {thumbnail ? (
          <img
            src={`data:image/png;base64,${thumbnail}`}
            alt={window.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isSelected ? 'bg-primary-500/20' : 'bg-surface-700'}`}>
            <Icon
              name="document"
              size="md"
              className={isSelected ? 'text-primary-400' : 'text-surface-400'}
            />
          </div>
        )}
      </div>

      {/* Window info */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isSelected ? 'text-primary-400' : 'text-surface-200'}`}>
          {window.title || 'Untitled Window'}
        </div>
        <div className="text-xs text-surface-400 flex items-center gap-2">
          <span className="truncate">{window.processName}</span>
          {isMinimized && (
            <span className="flex items-center gap-1 text-amber-500">
              <Icon name="minus" size="xs" />
              Minimized
            </span>
          )}
        </div>
        <div className="text-xs text-surface-500">
          {window.bounds.width} x {window.bounds.height}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && !isMinimized && (
        <Icon name="check-circle" size="md" className="text-primary-500 flex-shrink-0" />
      )}
    </button>
  );
}

WindowOption.displayName = 'WindowOption';
