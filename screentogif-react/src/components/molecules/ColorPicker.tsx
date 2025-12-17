import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { Input } from '../atoms/Input';

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  label?: string;
  showInput?: boolean;
  presetColors?: string[];
  disabled?: boolean;
  className?: string;
}

const defaultPresetColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ffffff', '#94a3b8', '#000000',
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}


export function ColorPicker({
  value = '#6366f1',
  onChange,
  label,
  showInput = true,
  presetColors = defaultPresetColors,
  disabled = false,
  className = '',
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = (newColor: string) => {
    setLocalValue(newColor);
    onChange?.(newColor);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange?.(newValue);
    }
  };

  const handleNativePickerChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleColorChange(e.target.value);
  };

  const rgb = hexToRgb(localValue);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-surface-200 mb-1.5">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {/* Color preview button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-10 h-10 rounded-lg border-2 border-surface-600
            transition-all duration-150
            hover:border-surface-500
            focus:outline-none focus:ring-2 focus:ring-primary-500/50
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          style={{ backgroundColor: localValue }}
          aria-label="Open color picker"
        />

        {/* Hex input */}
        {showInput && (
          <Input
            value={localValue}
            onChange={handleInputChange}
            disabled={disabled}
            size="md"
            className="w-28 font-mono uppercase"
            maxLength={7}
          />
        )}

        {/* Native color picker (hidden, triggered by button) */}
        <input
          ref={inputRef}
          type="color"
          value={localValue}
          onChange={handleNativePickerChange}
          disabled={disabled}
          className="sr-only"
        />
      </div>

      {/* Dropdown panel */}
      {isOpen && !disabled && (
        <div
          className="
            absolute z-50 mt-2 p-3
            bg-surface-800 rounded-lg border border-surface-700
            shadow-lg animate-fade-in
          "
        >
          {/* Preset colors grid */}
          <div className="grid grid-cols-10 gap-1 mb-3">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  handleColorChange(color);
                  setIsOpen(false);
                }}
                className={`
                  w-5 h-5 rounded
                  border border-surface-600
                  hover:scale-110 hover:border-surface-400
                  transition-transform duration-100
                  ${localValue === color ? 'ring-2 ring-primary-500 ring-offset-1 ring-offset-surface-800' : ''}
                `}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>

          {/* Custom color button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="
              w-full py-1.5 px-3
              text-sm text-surface-300
              bg-surface-700 hover:bg-surface-600
              rounded transition-colors
            "
          >
            Custom Color...
          </button>

          {/* RGB display */}
          {rgb && (
            <div className="mt-2 text-xs text-surface-400 font-mono text-center">
              RGB({rgb.r}, {rgb.g}, {rgb.b})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
