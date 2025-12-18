import { useState } from 'react';
import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';
import { Tabs, type Tab } from '../../../../components/molecules/Tabs';
import { Modal } from '../../../../components/molecules/Modal';
import { PresetList } from './PresetList';
import { PresetEditor } from './PresetEditor';
import type { ExportPreset, PresetCategory, EncodingOptions } from '../../../../api/types';

export interface PresetManagerProps {
  builtInPresets: ExportPreset[];
  customPresets: ExportPreset[];
  selectedPresetId: string | null;
  defaultPresetId: string | null;
  currentOptions: EncodingOptions | null;
  onSelectPreset: (preset: ExportPreset) => void;
  onCreatePreset: (preset: Omit<ExportPreset, 'id' | 'isBuiltIn' | 'createdAt'>) => void;
  onUpdatePreset: (presetId: string, preset: Partial<ExportPreset>) => void;
  onDeletePreset: (presetId: string) => void;
  onSetDefaultPreset: (presetId: string) => void;
  onImportPreset?: () => void;
  onExportPreset?: (preset: ExportPreset) => void;
  disabled?: boolean;
  className?: string;
}

const categoryTabs: Tab[] = [
  { id: 'all', label: 'All' },
  { id: 'gif', label: 'GIF' },
  { id: 'video', label: 'Video' },
  { id: 'social', label: 'Social' },
  { id: 'custom', label: 'Custom' },
];

export function PresetManager({
  builtInPresets,
  customPresets,
  selectedPresetId,
  defaultPresetId,
  currentOptions,
  onSelectPreset,
  onCreatePreset,
  onUpdatePreset,
  onDeletePreset,
  onSetDefaultPreset,
  onImportPreset,
  onExportPreset,
  disabled = false,
  className = '',
}: PresetManagerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ExportPreset | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ExportPreset | null>(null);

  const allPresets = [...builtInPresets, ...customPresets];

  const filteredPresets = activeCategory === 'all'
    ? allPresets
    : allPresets.filter((p) => p.category === activeCategory);

  const handleEdit = (preset: ExportPreset) => {
    setEditingPreset(preset);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingPreset(null);
    setShowEditor(true);
  };

  const handleSavePreset = (presetData: Omit<ExportPreset, 'id' | 'isBuiltIn' | 'createdAt'>) => {
    if (editingPreset) {
      onUpdatePreset(editingPreset.id, presetData);
    } else {
      onCreatePreset(presetData);
    }
    setShowEditor(false);
    setEditingPreset(null);
  };

  const handleConfirmDelete = () => {
    if (showDeleteConfirm) {
      onDeletePreset(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-surface-200">Presets</h3>
        <div className="flex gap-2">
          {onImportPreset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onImportPreset}
              disabled={disabled}
              title="Import preset"
            >
              <Icon name="download" size="sm" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCreate}
            disabled={disabled || !currentOptions}
            leftIcon={<Icon name="plus" size="sm" />}
          >
            New Preset
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs
        tabs={categoryTabs}
        activeTab={activeCategory}
        onChange={setActiveCategory}
        variant="pills"
        size="sm"
        className="mb-4"
      />

      {/* Preset List */}
      <PresetList
        presets={filteredPresets}
        selectedPresetId={selectedPresetId}
        defaultPresetId={defaultPresetId}
        onSelect={onSelectPreset}
        onEdit={handleEdit}
        onDelete={(preset) => setShowDeleteConfirm(preset)}
        onSetDefault={(preset) => onSetDefaultPreset(preset.id)}
        disabled={disabled}
      />

      {/* Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        title={editingPreset ? 'Edit Preset' : 'Create Preset'}
        size="md"
      >
        <PresetEditor
          preset={editingPreset}
          currentOptions={currentOptions}
          onSave={handleSavePreset}
          onCancel={() => setShowEditor(false)}
          disabled={disabled}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Preset"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-300">
            Are you sure you want to delete the preset "{showDeleteConfirm?.name}"?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
