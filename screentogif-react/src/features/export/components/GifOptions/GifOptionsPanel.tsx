import { Slider } from '../../../../components/atoms/Slider';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Dropdown, type DropdownOption } from '../../../../components/molecules/Dropdown';
import { QuantizerSelector } from './QuantizerSelector';
import { ColorPalettePreview } from './ColorPalettePreview';
import type { GifEncodingOptions, GifEncoder, DitheringAlgorithm } from '../../../../api/types';

export interface GifOptionsPanelProps {
  options: GifEncodingOptions;
  onChange: (options: Partial<GifEncodingOptions>) => void;
  showAdvanced?: boolean;
  disabled?: boolean;
  className?: string;
}

const encoderOptions: DropdownOption<GifEncoder>[] = [
  {
    value: 'screentogif',
    label: 'ScreenToGif',
    description: 'Default encoder with good quality',
  },
  {
    value: 'gifski',
    label: 'Gifski',
    description: 'High quality, slower encoding',
  },
  {
    value: 'ffmpeg',
    label: 'FFmpeg',
    description: 'Fast encoding with FFmpeg',
  },
  {
    value: 'system',
    label: 'System',
    description: 'Use system encoder',
  },
];

const ditheringOptions: DropdownOption<DitheringAlgorithm>[] = [
  {
    value: 'none',
    label: 'None',
    description: 'No dithering applied',
  },
  {
    value: 'floydSteinberg',
    label: 'Floyd-Steinberg',
    description: 'Classic error diffusion',
  },
  {
    value: 'ordered',
    label: 'Ordered',
    description: 'Bayer matrix dithering',
  },
  {
    value: 'atkinson',
    label: 'Atkinson',
    description: 'Preserves more detail',
  },
];

export function GifOptionsPanel({
  options,
  onChange,
  showAdvanced = false,
  disabled = false,
  className = '',
}: GifOptionsPanelProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Encoder Selection */}
      <Dropdown
        label="Encoder"
        options={encoderOptions}
        value={options.encoder}
        onChange={(encoder) => onChange({ encoder })}
        disabled={disabled}
      />

      {/* Quality Slider */}
      <Slider
        label="Quality"
        value={options.quality}
        min={1}
        max={100}
        onChange={(e) => onChange({ quality: Number(e.target.value) })}
        valueFormatter={(v) => `${v}%`}
        disabled={disabled}
      />

      {/* Color Count */}
      <div>
        <Slider
          label="Colors"
          value={options.colorCount}
          min={2}
          max={256}
          step={2}
          onChange={(e) => onChange({ colorCount: Number(e.target.value) })}
          valueFormatter={(v) => `${v}`}
          disabled={disabled}
        />
        <ColorPalettePreview
          colorCount={options.colorCount}
          className="mt-3"
        />
      </div>

      {/* Quantization Method */}
      <QuantizerSelector
        value={options.quantization}
        onChange={(quantization) => onChange({ quantization })}
        disabled={disabled}
      />

      {/* Dithering */}
      <Dropdown
        label="Dithering"
        options={ditheringOptions}
        value={options.dithering}
        onChange={(dithering) => onChange({ dithering })}
        disabled={disabled}
      />

      {/* Loop Count */}
      <Slider
        label="Loop Count"
        value={options.loopCount}
        min={0}
        max={100}
        onChange={(e) => onChange({ loopCount: Number(e.target.value) })}
        valueFormatter={(v) => (v === 0 ? 'Infinite' : `${v} times`)}
        disabled={disabled}
      />

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="pt-4 border-t border-surface-700 space-y-4">
          <h4 className="text-sm font-medium text-surface-200">Advanced Options</h4>

          <Toggle
            label="Enable Transparency"
            description="Allow transparent pixels in the GIF"
            checked={options.enableTransparency}
            onChange={(e) => onChange({ enableTransparency: e.target.checked })}
            disabled={disabled}
          />

          <Toggle
            label="Detect Unchanged Pixels"
            description="Optimize by detecting static regions"
            checked={options.detectUnchangedPixels}
            onChange={(e) => onChange({ detectUnchangedPixels: e.target.checked })}
            disabled={disabled}
          />

          <Toggle
            label="Paint Transparent"
            description="Paint over unchanged regions with transparency"
            checked={options.paintTransparent}
            onChange={(e) => onChange({ paintTransparent: e.target.checked })}
            disabled={disabled || !options.enableTransparency}
          />
        </div>
      )}
    </div>
  );
}
