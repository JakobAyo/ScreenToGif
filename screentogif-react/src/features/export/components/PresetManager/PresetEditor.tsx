import { useState } from 'react';
import { Input } from '../../../../components/atoms/Input';
import { Button } from '../../../../components/atoms/Button';
import { Dropdown, type DropdownOption } from '../../../../components/molecules/Dropdown';
import type { ExportPreset, PresetCategory, EncodingOptions } from '../../../../api/types';

export interface PresetEditorProps {
  preset?: ExportPreset | null;
  currentOptions?: EncodingOptions | null;
  onSave: (preset: Omit<ExportPreset, 'id' | 'isBuiltIn' | 'createdAt'>) => void;
  onCancel: () => void;
  disabled?: boolean;
  className?: string;
}

const categoryOptions: DropdownOption<PresetCategory>[] = [
  { value: 'gif', label: 'GIF', description: 'Animated GIF presets' },
  { value: 'video', label: 'Video', description: 'Video format presets' },
  { value: 'social', label: 'Social', description: 'Optimized for social media' },
  { value: 'web', label: 'Web', description: 'Optimized for web' },
  { value: 'custom', label: 'Custom', description: 'Custom presets' },
];

export function PresetEditor({
  preset,
  currentOptions,
  onSave,
  onCancel,
  disabled = false,
  className = '',
}: PresetEditorProps) {
  const [name, setName] = useState(preset?.name || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [category, setCategory] = useState<PresetCategory>(preset?.category || 'custom');

  const isEditing = !!preset;
  const options = preset?.options || currentOptions;

  const handleSave = () => {
    if (!name.trim() || !options) return;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      options,
      modifiedAt: new Date().toISOString(),
    });
  };

  const isValid = name.trim().length > 0 && options !== null;

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-surface-100">
        {isEditing ? 'Edit Preset' : 'Create Preset'}
      </h3>

      <Input
        label="Preset Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="My Custom Preset"
        disabled={disabled}
        error={name.length > 0 && name.trim().length === 0}
        errorMessage="Name cannot be empty"
      />

      <Input
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what this preset is for..."
        disabled={disabled}
      />

      <Dropdown
        label="Category"
        options={categoryOptions}
        value={category}
        onChange={setCategory}
        disabled={disabled}
      />

      {options && (
        <div className="p-3 bg-surface-800 rounded-lg border border-surface-700">
          <span className="text-xs text-surface-400">Current Settings:</span>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-surface-500">Format: </span>
              <span className="text-surface-200 uppercase">{options.format}</span>
            </div>
            {options.gif && (
              <>
                <div>
                  <span className="text-surface-500">Colors: </span>
                  <span className="text-surface-200">{options.gif.colorCount}</span>
                </div>
                <div>
                  <span className="text-surface-500">Quality: </span>
                  <span className="text-surface-200">{options.gif.quality}%</span>
                </div>
              </>
            )}
            {options.video && (
              <>
                <div>
                  <span className="text-surface-500">Codec: </span>
                  <span className="text-surface-200 uppercase">{options.video.codec}</span>
                </div>
                <div>
                  <span className="text-surface-500">Bitrate: </span>
                  <span className="text-surface-200">{options.video.bitrate} kbps</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!options && (
        <p className="text-sm text-accent-warning">
          Configure export settings before saving as a preset.
        </p>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-surface-700">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={disabled || !isValid}
        >
          {isEditing ? 'Update Preset' : 'Save Preset'}
        </Button>
      </div>
    </div>
  );
}
