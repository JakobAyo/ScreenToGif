import { Slider } from '../../../../components/atoms/Slider';

export interface QualitySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  showHint?: boolean;
  disabled?: boolean;
  className?: string;
}

function getQualityHint(value: number): string {
  if (value >= 90) return 'Excellent quality, larger file';
  if (value >= 75) return 'Good quality, balanced file size';
  if (value >= 50) return 'Acceptable quality, smaller file';
  return 'Lower quality, smallest file';
}

export function QualitySlider({
  value,
  onChange,
  min = 1,
  max = 100,
  label = 'Quality',
  showHint = true,
  disabled = false,
  className = '',
}: QualitySliderProps) {
  return (
    <div className={className}>
      <Slider
        label={label}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        valueFormatter={(v) => `${v}%`}
        disabled={disabled}
      />
      {showHint && (
        <p className="mt-1.5 text-xs text-surface-500">
          {getQualityHint(value)}
        </p>
      )}
    </div>
  );
}
