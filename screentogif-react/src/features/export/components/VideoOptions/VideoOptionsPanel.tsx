import { Slider } from '../../../../components/atoms/Slider';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Dropdown, type DropdownOption } from '../../../../components/molecules/Dropdown';
import { CodecSelector } from './CodecSelector';
import { BitrateSlider } from './BitrateSlider';
import { FrameRateSelector } from './FrameRateSelector';
import type { VideoEncodingOptions, OutputFormat } from '../../../../api/types';

export interface VideoOptionsPanelProps {
  options: VideoEncodingOptions;
  onChange: (options: Partial<VideoEncodingOptions>) => void;
  format?: OutputFormat;
  frameRate?: number;
  showAdvanced?: boolean;
  disabled?: boolean;
  className?: string;
}

type EncodingPreset = VideoEncodingOptions['preset'];

const presetOptions: DropdownOption<EncodingPreset>[] = [
  { value: 'ultrafast', label: 'Ultrafast', description: 'Fastest encoding, largest file' },
  { value: 'superfast', label: 'Superfast', description: 'Very fast encoding' },
  { value: 'veryfast', label: 'Very Fast', description: 'Fast encoding' },
  { value: 'faster', label: 'Faster', description: 'Above average speed' },
  { value: 'fast', label: 'Fast', description: 'Slightly faster' },
  { value: 'medium', label: 'Medium', description: 'Default balance' },
  { value: 'slow', label: 'Slow', description: 'Better compression' },
  { value: 'slower', label: 'Slower', description: 'Even better compression' },
  { value: 'veryslow', label: 'Very Slow', description: 'Best compression, slowest' },
];

const pixelFormatOptions: DropdownOption<string>[] = [
  { value: 'yuv420p', label: 'YUV 4:2:0', description: 'Best compatibility' },
  { value: 'yuv422p', label: 'YUV 4:2:2', description: 'Better color' },
  { value: 'yuv444p', label: 'YUV 4:4:4', description: 'Full color' },
];

export function VideoOptionsPanel({
  options,
  onChange,
  format = 'mp4',
  frameRate,
  showAdvanced = false,
  disabled = false,
  className = '',
}: VideoOptionsPanelProps) {
  const videoFormat = format === 'mp4' || format === 'webm' || format === 'avi' ? format : 'mp4';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Codec Selection */}
      <CodecSelector
        value={options.codec}
        onChange={(codec) => onChange({ codec })}
        format={videoFormat}
        disabled={disabled}
      />

      {/* Quality (CRF) */}
      <Slider
        label="Quality (CRF)"
        value={options.quality}
        min={0}
        max={51}
        onChange={(e) => onChange({ quality: Number(e.target.value) })}
        valueFormatter={(v) => {
          if (v <= 17) return `${v} (Lossless)`;
          if (v <= 23) return `${v} (High)`;
          if (v <= 28) return `${v} (Medium)`;
          return `${v} (Low)`;
        }}
        disabled={disabled}
      />

      {/* Bitrate */}
      <BitrateSlider
        value={options.bitrate}
        onChange={(bitrate) => onChange({ bitrate })}
        disabled={disabled}
      />

      {/* Encoding Preset */}
      <Dropdown
        label="Encoding Speed"
        options={presetOptions}
        value={options.preset}
        onChange={(preset) => onChange({ preset })}
        disabled={disabled}
      />

      {/* Frame Rate Override */}
      <FrameRateSelector
        value={undefined}
        onChange={() => {}}
        originalFrameRate={frameRate}
        disabled={disabled}
      />

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="pt-4 border-t border-surface-700 space-y-4">
          <h4 className="text-sm font-medium text-surface-200">Advanced Options</h4>

          <Dropdown
            label="Pixel Format"
            options={pixelFormatOptions}
            value={options.pixelFormat}
            onChange={(pixelFormat) => onChange({ pixelFormat })}
            disabled={disabled}
          />

          <Toggle
            label="Include Audio"
            description="Include audio track if available"
            checked={options.audioEnabled}
            onChange={(e) => onChange({ audioEnabled: e.target.checked })}
            disabled={disabled}
          />

          {options.audioEnabled && (
            <Slider
              label="Audio Bitrate"
              value={options.audioBitrate || 128}
              min={64}
              max={320}
              step={32}
              onChange={(e) => onChange({ audioBitrate: Number(e.target.value) })}
              valueFormatter={(v) => `${v} kbps`}
              disabled={disabled}
            />
          )}
        </div>
      )}
    </div>
  );
}
