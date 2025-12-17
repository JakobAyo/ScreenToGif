import { useCallback, useMemo } from 'react';
import { useExportStore } from '../../../stores/exportStore';
import type { ExportPreset, PresetCategory, EncodingOptions } from '../../../api/types';

export function usePresets() {
  const {
    builtInPresets,
    customPresets,
    selectedPresetId,
    defaultPresetId,
    currentOptions,
    addCustomPreset,
    updateCustomPreset,
    removeCustomPreset,
    setDefaultPresetId,
    applyPreset,
    getPresetById,
    getPresetsByCategory,
  } = useExportStore();

  const allPresets = useMemo(
    () => [...builtInPresets, ...customPresets],
    [builtInPresets, customPresets]
  );

  const selectedPreset = useMemo(
    () => (selectedPresetId ? getPresetById(selectedPresetId) : undefined),
    [selectedPresetId, getPresetById]
  );

  const defaultPreset = useMemo(
    () => (defaultPresetId ? getPresetById(defaultPresetId) : undefined),
    [defaultPresetId, getPresetById]
  );

  const createPreset = useCallback(
    (
      preset: Omit<ExportPreset, 'id' | 'isBuiltIn' | 'createdAt'>
    ) => {
      const newPreset: ExportPreset = {
        ...preset,
        id: crypto.randomUUID(),
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
      };
      addCustomPreset(newPreset);
      return newPreset;
    },
    [addCustomPreset]
  );

  const updatePreset = useCallback(
    (presetId: string, updates: Partial<ExportPreset>) => {
      updateCustomPreset(presetId, updates);
    },
    [updateCustomPreset]
  );

  const deletePreset = useCallback(
    (presetId: string) => {
      removeCustomPreset(presetId);
    },
    [removeCustomPreset]
  );

  const setDefault = useCallback(
    (presetId: string) => {
      setDefaultPresetId(presetId);
    },
    [setDefaultPresetId]
  );

  const selectPreset = useCallback(
    (preset: ExportPreset) => {
      applyPreset(preset);
    },
    [applyPreset]
  );

  const getByCategory = useCallback(
    (category: PresetCategory) => {
      return getPresetsByCategory(category);
    },
    [getPresetsByCategory]
  );

  const saveCurrentAsPreset = useCallback(
    (
      name: string,
      description?: string,
      category: PresetCategory = 'custom'
    ) => {
      if (!currentOptions) {
        throw new Error('No current options to save');
      }

      return createPreset({
        name,
        description,
        category,
        options: { ...currentOptions },
      });
    },
    [currentOptions, createPreset]
  );

  const exportPreset = useCallback(
    (preset: ExportPreset): string => {
      return JSON.stringify(preset, null, 2);
    },
    []
  );

  const importPreset = useCallback(
    (jsonString: string): ExportPreset => {
      try {
        const parsed = JSON.parse(jsonString);

        // Validate required fields
        if (!parsed.name || !parsed.options) {
          throw new Error('Invalid preset format');
        }

        const newPreset: ExportPreset = {
          id: crypto.randomUUID(),
          name: parsed.name,
          description: parsed.description,
          category: parsed.category || 'custom',
          isBuiltIn: false,
          options: parsed.options,
          createdAt: new Date().toISOString(),
        };

        addCustomPreset(newPreset);
        return newPreset;
      } catch (error) {
        throw new Error('Failed to import preset: Invalid JSON format');
      }
    },
    [addCustomPreset]
  );

  return {
    // State
    allPresets,
    builtInPresets,
    customPresets,
    selectedPreset,
    defaultPreset,
    selectedPresetId,
    defaultPresetId,

    // Actions
    createPreset,
    updatePreset,
    deletePreset,
    setDefault,
    selectPreset,
    getByCategory,
    saveCurrentAsPreset,
    exportPreset,
    importPreset,
  };
}
