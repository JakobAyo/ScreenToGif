import { Toggle } from '../../../../components/atoms/Toggle';
import { Slider } from '../../../../components/atoms/Slider';
import { Input } from '../../../../components/atoms/Input';
import { Dropdown, type DropdownOption } from '../../../../components/molecules/Dropdown';
import { QualitySlider } from './QualitySlider';
import type { ImageSequenceOptions } from '../../../../api/types';

export interface ImageOptionsPanelProps {
  options: ImageSequenceOptions;
  onChange: (options: Partial<ImageSequenceOptions>) => void;
  showAdvanced?: boolean;
  disabled?: boolean;
  className?: string;
}

type ImageFormat = ImageSequenceOptions['format'];

const formatOptions: DropdownOption<ImageFormat>[] = [
  {
    value: 'png',
    label: 'PNG',
    description: 'Lossless, supports transparency',
  },
  {
    value: 'jpg',
    label: 'JPEG',
    description: 'Smaller files, no transparency',
  },
  {
    value: 'bmp',
    label: 'BMP',
    description: 'Uncompressed, large files',
  },
];

export function ImageOptionsPanel({
  options,
  onChange,
  showAdvanced = false,
  disabled = false,
  className = '',
}: ImageOptionsPanelProps) {
  const showQuality = options.format === 'jpg';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Format Selection */}
      <Dropdown
        label="Image Format"
        options={formatOptions}
        value={options.format}
        onChange={(format) => onChange({ format })}
        disabled={disabled}
      />

      {/* Quality (JPEG only) */}
      {showQuality && (
        <QualitySlider
          value={options.quality}
          onChange={(quality) => onChange({ quality })}
          disabled={disabled}
        />
      )}

      {/* Naming Pattern */}
      <Input
        label="Naming Pattern"
        value={options.namePattern}
        onChange={(e) => onChange({ namePattern: e.target.value })}
        placeholder="frame_{0:D4}"
        helperText="Use {0:D4} for 4-digit frame number"
        disabled={disabled}
      />

      {/* Output Options */}
      <div className="space-y-4">
        <Toggle
          label="Include Timestamp"
          description="Add timestamp to file names"
          checked={options.includeTimestamp}
          onChange={(e) => onChange({ includeTimestamp: e.target.checked })}
          disabled={disabled}
        />

        <Toggle
          label="Create ZIP Archive"
          description="Pack all frames into a ZIP file"
          checked={options.zipOutput}
          onChange={(e) => onChange({ zipOutput: e.target.checked })}
          disabled={disabled}
        />
      </div>

      {/* Advanced Options */}
      {showAdvanced && options.format === 'png' && (
        <div className="pt-4 border-t border-surface-700 space-y-4">
          <h4 className="text-sm font-medium text-surface-200">PNG Options</h4>

          <Slider
            label="Compression Level"
            value={6}
            min={0}
            max={9}
            onChange={() => {}}
            valueFormatter={(v) => {
              if (v === 0) return 'None';
              if (v <= 3) return `${v} (Fast)`;
              if (v <= 6) return `${v} (Balanced)`;
              return `${v} (Best)`;
            }}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
