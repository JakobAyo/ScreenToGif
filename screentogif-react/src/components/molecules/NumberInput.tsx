import { useState, useRef, useEffect, type KeyboardEvent, type WheelEvent } from 'react';
import { Icon } from '../atoms/Icon';

export type NumberInputSize = 'sm' | 'md' | 'lg';

export interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  label?: string;
  unit?: string;
  size?: NumberInputSize;
  disabled?: boolean;
  showButtons?: boolean;
  allowMouseWheel?: boolean;
  className?: string;
}

const sizeStyles: Record<NumberInputSize, { input: string; button: string }> = {
  sm: { input: 'h-8 text-xs px-2', button: 'h-8 w-6' },
  md: { input: 'h-10 text-sm px-3', button: 'h-10 w-8' },
  lg: { input: 'h-12 text-base px-4', button: 'h-12 w-10' },
};

export function NumberInput({
  value = 0,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  precision = 0,
  label,
  unit,
  size = 'md',
  disabled = false,
  showButtons = true,
  allowMouseWheel = true,
  className = '',
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toFixed(precision));
    }
  }, [value, precision, isFocused]);

  const clamp = (val: number): number => {
    return Math.min(Math.max(val, min), max);
  };

  const roundToStep = (val: number): number => {
    const rounded = Math.round(val / step) * step;
    return Number(rounded.toFixed(precision));
  };

  const updateValue = (newValue: number) => {
    const clamped = clamp(roundToStep(newValue));
    setLocalValue(clamped.toFixed(precision));
    onChange?.(clamped);
  };

  const increment = () => {
    updateValue(Number(localValue) + step);
  };

  const decrement = () => {
    updateValue(Number(localValue) - step);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed)) {
      updateValue(parsed);
    } else {
      setLocalValue(value.toFixed(precision));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    inputRef.current?.select();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    } else if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const handleWheel = (e: WheelEvent<HTMLInputElement>) => {
    if (!allowMouseWheel || disabled || !isFocused) return;
    e.preventDefault();
    if (e.deltaY < 0) {
      increment();
    } else {
      decrement();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-surface-200 mb-1.5">
          {label}
        </label>
      )}

      <div className="flex items-center">
        {showButtons && (
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || Number(localValue) <= min}
            className={`
              ${sizeStyles[size].button}
              flex items-center justify-center
              bg-surface-700 hover:bg-surface-600
              border border-surface-600 border-r-0
              rounded-l-lg
              text-surface-300 hover:text-surface-100
              transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label="Decrease value"
          >
            <Icon name="minus" size="sm" />
          </button>
        )}

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onWheel={handleWheel}
            disabled={disabled}
            className={`
              ${sizeStyles[size].input}
              w-full
              bg-surface-800 text-surface-100
              border border-surface-600
              ${showButtons ? 'rounded-none' : 'rounded-lg'}
              text-center font-mono
              focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150
              ${unit ? 'pr-8' : ''}
            `}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm pointer-events-none">
              {unit}
            </span>
          )}
        </div>

        {showButtons && (
          <button
            type="button"
            onClick={increment}
            disabled={disabled || Number(localValue) >= max}
            className={`
              ${sizeStyles[size].button}
              flex items-center justify-center
              bg-surface-700 hover:bg-surface-600
              border border-surface-600 border-l-0
              rounded-r-lg
              text-surface-300 hover:text-surface-100
              transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label="Increase value"
          >
            <Icon name="plus" size="sm" />
          </button>
        )}
      </div>

      {min !== -Infinity && max !== Infinity && (
        <div className="mt-1 text-xs text-surface-500 text-center">
          {min} - {max}
        </div>
      )}
    </div>
  );
}
