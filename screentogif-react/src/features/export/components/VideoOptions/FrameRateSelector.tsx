import { Dropdown, type DropdownOption } from '../../../../components/molecules/Dropdown';
import { Slider } from '../../../../components/atoms/Slider';
import { Toggle } from '../../../../components/atoms/Toggle';
import { useState } from 'react';

export interface FrameRateSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  originalFrameRate?: number;
  disabled?: boolean;
  className?: string;
}

const commonFrameRates: DropdownOption<number>[] = [
  { value: 15, label: '15 FPS', description: 'Low motion' },
  { value: 24, label: '24 FPS', description: 'Cinematic' },
  { value: 30, label: '30 FPS', description: 'Standard' },
  { value: 60, label: '60 FPS', description: 'Smooth' },
];

export function FrameRateSelector({
  value,
  onChange,
  originalFrameRate,
  disabled = false,
  className = '',
}: FrameRateSelectorProps) {
  const [useCustom, setUseCustom] = useState(
    value !== undefined && !commonFrameRates.some((f) => f.value === value)
  );

  const handleToggle = (checked: boolean) => {
    setUseCustom(checked);
    if (!checked) {
      onChange(undefined); // Use original
    } else {
      onChange(30); // Default custom value
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Toggle
        label="Override Frame Rate"
        description={
          originalFrameRate
            ? `Original: ${originalFrameRate} FPS`
            : 'Use a custom frame rate'
        }
        checked={value !== undefined}
        onChange={(e) => handleToggle(e.target.checked)}
        disabled={disabled}
      />

      {value !== undefined && (
        <>
          {useCustom ? (
            <Slider
              label="Frame Rate"
              value={value}
              min={1}
              max={120}
              onChange={(e) => onChange(Number(e.target.value))}
              valueFormatter={(v) => `${v} FPS`}
              disabled={disabled}
            />
          ) : (
            <Dropdown
              label="Frame Rate"
              options={commonFrameRates}
              value={value}
              onChange={onChange}
              disabled={disabled}
            />
          )}

          <button
            type="button"
            onClick={() => setUseCustom(!useCustom)}
            className="text-xs text-primary-400 hover:text-primary-300"
            disabled={disabled}
          >
            {useCustom ? 'Use preset values' : 'Enter custom value'}
          </button>
        </>
      )}
    </div>
  );
}
