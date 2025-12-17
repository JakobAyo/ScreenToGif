/**
 * ScreenOption Component
 * Display option for full screen capture
 */

import type { DisplayInfo } from '../../../../api/types';
import { Icon } from '../../../../components/atoms/Icon';

export interface ScreenOptionProps {
  display: DisplayInfo;
  isSelected: boolean;
  onClick: () => void;
}

export function ScreenOption({ display, isSelected, onClick }: ScreenOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg border transition-all duration-150
        flex items-center gap-3 text-left
        ${
          isSelected
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-surface-600 bg-surface-800 hover:border-surface-500 hover:bg-surface-700'
        }
      `}
    >
      {/* Display preview placeholder */}
      <div
        className={`
          relative w-16 h-10 rounded border flex-shrink-0
          flex items-center justify-center
          ${isSelected ? 'border-primary-500/50 bg-primary-500/20' : 'border-surface-500 bg-surface-700'}
        `}
      >
        <Icon
          name="photo"
          size="md"
          className={isSelected ? 'text-primary-400' : 'text-surface-400'}
        />
        {display.isPrimary && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-500 flex items-center justify-center">
            <Icon name="check" size="xs" className="text-white" />
          </div>
        )}
      </div>

      {/* Display info */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isSelected ? 'text-primary-400' : 'text-surface-200'}`}>
          {display.name}
          {display.isPrimary && (
            <span className="ml-2 text-xs text-primary-500">(Primary)</span>
          )}
        </div>
        <div className="text-xs text-surface-400">
          {display.width} x {display.height}
          {display.scaleFactor !== 1 && ` @ ${display.scaleFactor * 100}%`}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <Icon name="check-circle" size="md" className="text-primary-500 flex-shrink-0" />
      )}
    </button>
  );
}

ScreenOption.displayName = 'ScreenOption';
