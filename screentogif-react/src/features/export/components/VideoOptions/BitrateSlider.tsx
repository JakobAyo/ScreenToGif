import { Slider } from '../../../../components/atoms/Slider';

export interface BitrateSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

function formatBitrate(kbps: number): string {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${kbps} Kbps`;
}

export function BitrateSlider({
  value,
  onChange,
  min = 500,
  max = 20000,
  disabled = false,
  className = '',
}: BitrateSliderProps) {
  return (
    <div className={className}>
      <Slider
        label="Bitrate"
        value={value}
        min={min}
        max={max}
        step={100}
        onChange={(e) => onChange(Number(e.target.value))}
        valueFormatter={formatBitrate}
        disabled={disabled}
      />
      <div className="mt-2 flex justify-between text-xs text-surface-500">
        <span>Smaller file</span>
        <span>Higher quality</span>
      </div>
    </div>
  );
}
