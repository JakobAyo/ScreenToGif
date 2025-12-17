import { Icon } from '../../../../components/atoms/Icon';
import { Button } from '../../../../components/atoms/Button';
import type { ExportPreset } from '../../../../api/types';

export interface PresetListProps {
  presets: ExportPreset[];
  selectedPresetId: string | null;
  onSelect: (preset: ExportPreset) => void;
  onEdit?: (preset: ExportPreset) => void;
  onDelete?: (preset: ExportPreset) => void;
  onSetDefault?: (preset: ExportPreset) => void;
  defaultPresetId?: string | null;
  disabled?: boolean;
  className?: string;
}

export function PresetList({
  presets,
  selectedPresetId,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  defaultPresetId,
  disabled = false,
  className = '',
}: PresetListProps) {
  if (presets.length === 0) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <Icon name="folder" size="lg" className="mx-auto text-surface-500 mb-2" />
        <p className="text-sm text-surface-400">No presets available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {presets.map((preset) => {
        const isSelected = preset.id === selectedPresetId;
        const isDefault = preset.id === defaultPresetId;

        return (
          <div
            key={preset.id}
            className={`
              group p-3 rounded-lg border cursor-pointer
              transition-all duration-150
              ${isSelected
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-surface-700 bg-surface-800 hover:border-surface-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !disabled && onSelect(preset)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-medium truncate ${isSelected ? 'text-primary-400' : 'text-surface-100'}`}>
                    {preset.name}
                  </h4>
                  {preset.isBuiltIn && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-surface-600 text-surface-300 rounded">
                      Built-in
                    </span>
                  )}
                  {isDefault && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary-500/20 text-primary-400 rounded">
                      Default
                    </span>
                  )}
                </div>

                {preset.description && (
                  <p className="mt-1 text-xs text-surface-400 truncate">
                    {preset.description}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs text-surface-500">
                  <span className="uppercase">{preset.options.format}</span>
                  <span>-</span>
                  <span className="capitalize">{preset.category}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!preset.isBuiltIn && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(preset);
                    }}
                    disabled={disabled}
                  >
                    <Icon name="pencil-square" size="sm" />
                  </Button>
                )}

                {!isDefault && onSetDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetDefault(preset);
                    }}
                    disabled={disabled}
                    title="Set as default"
                  >
                    <Icon name="check-circle" size="sm" />
                  </Button>
                )}

                {!preset.isBuiltIn && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(preset);
                    }}
                    disabled={disabled}
                  >
                    <Icon name="trash" size="sm" className="text-accent-error" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
