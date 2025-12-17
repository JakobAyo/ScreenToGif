/**
 * HotkeyEditor Component
 * Individual hotkey binding editor with key capture functionality
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Button } from '../../../../components/atoms/Button';
import type { HotkeyBinding } from '../../../../stores/settingsStore';
import { HotkeyService } from '../../../../services/HotkeyService';

export interface HotkeyEditorProps {
  binding: HotkeyBinding;
  onChange: (id: string, updates: Partial<HotkeyBinding>) => void;
  onReset: (id: string) => void;
  disabled?: boolean;
  hasConflict?: boolean;
  className?: string;
}

export function HotkeyEditor({
  binding,
  onChange,
  onReset,
  disabled = false,
  hasConflict = false,
  className = '',
}: HotkeyEditorProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const inputRef = useRef<HTMLButtonElement>(null);

  const displayString = HotkeyService.getHotkeyDisplayString(binding);
  const actionLabel = binding.action.split('.').map((part) =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' > ');

  const handleKeyCapture = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // Ignore modifier keys alone
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
        return;
      }

      // Escape cancels capture
      if (event.key === 'Escape') {
        setIsCapturing(false);
        return;
      }

      const newBinding: Partial<HotkeyBinding> = {
        key: event.key,
        modifiers: {
          ctrl: event.ctrlKey,
          alt: event.altKey,
          shift: event.shiftKey,
          meta: event.metaKey,
        },
      };

      onChange(binding.id, newBinding);
      setIsCapturing(false);
    },
    [binding.id, onChange]
  );

  useEffect(() => {
    if (isCapturing) {
      // Temporarily disable hotkey service during capture
      HotkeyService.setEnabled(false);
      window.addEventListener('keydown', handleKeyCapture);

      return () => {
        window.removeEventListener('keydown', handleKeyCapture);
        HotkeyService.setEnabled(true);
      };
    }
  }, [isCapturing, handleKeyCapture]);

  const handleStartCapture = () => {
    if (!disabled) {
      setIsCapturing(true);
    }
  };

  const handleCancelCapture = () => {
    setIsCapturing(false);
  };

  const handleToggleEnabled = () => {
    onChange(binding.id, { enabled: !binding.enabled });
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3
        bg-surface-800 border rounded-lg
        ${hasConflict ? 'border-accent-warning/50' : 'border-surface-700'}
        ${!binding.enabled ? 'opacity-60' : ''}
        ${className}
      `}
    >
      {/* Enable toggle */}
      <button
        type="button"
        onClick={handleToggleEnabled}
        disabled={disabled}
        className="text-surface-400 hover:text-surface-200 disabled:cursor-not-allowed"
        title={binding.enabled ? 'Disable' : 'Enable'}
      >
        <Icon name={binding.enabled ? 'check-circle' : 'circle'} size="sm" />
      </button>

      {/* Action label */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-surface-200 truncate block">{actionLabel}</span>
      </div>

      {/* Key binding */}
      <button
        ref={inputRef}
        type="button"
        onClick={handleStartCapture}
        disabled={disabled || !binding.enabled}
        className={`
          min-w-[120px] px-3 py-1.5
          bg-surface-700 border rounded-lg
          text-sm font-mono text-center
          transition-colors
          ${
            isCapturing
              ? 'border-primary-500 ring-2 ring-primary-500/50 text-primary-400'
              : hasConflict
                ? 'border-accent-warning/50 text-accent-warning'
                : 'border-surface-600 text-surface-200 hover:border-surface-500'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isCapturing ? 'Press keys...' : displayString}
      </button>

      {/* Reset button */}
      <button
        type="button"
        onClick={() => onReset(binding.id)}
        disabled={disabled}
        className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded transition-colors disabled:cursor-not-allowed"
        title="Reset to default"
      >
        <Icon name="arrow-path" size="sm" />
      </button>

      {/* Cancel capture overlay */}
      {isCapturing && (
        <button
          type="button"
          onClick={handleCancelCapture}
          className="absolute inset-0 z-10"
          aria-label="Cancel key capture"
        />
      )}
    </div>
  );
}

HotkeyEditor.displayName = 'HotkeyEditor';
