/**
 * HotkeySettings Component
 * Container for keyboard shortcut settings
 */

import { useMemo, useCallback } from 'react';
import { useSettingsStore, type HotkeyBinding } from '../../../../stores/settingsStore';
import { Button } from '../../../../components/atoms/Button';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Icon } from '../../../../components/atoms/Icon';
import { HotkeyEditor } from './HotkeyEditor';
import { HotkeyConflictWarning } from './HotkeyConflictWarning';
import { HotkeyService } from '../../../../services/HotkeyService';

export interface HotkeySettingsProps {
  className?: string;
}

// Group hotkeys by category
const HOTKEY_CATEGORIES = [
  {
    id: 'recording',
    label: 'Recording',
    icon: 'record' as const,
    actions: ['recording.start', 'recording.pause', 'recording.stop', 'recording.discard'],
  },
  {
    id: 'playback',
    label: 'Playback',
    icon: 'play' as const,
    actions: ['playback.toggle', 'playback.next', 'playback.prev', 'playback.first', 'playback.last'],
  },
  {
    id: 'selection',
    label: 'Selection',
    icon: 'cursor' as const,
    actions: ['selection.all', 'selection.none', 'selection.invert'],
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: 'pencil' as const,
    actions: ['edit.copy', 'edit.cut', 'edit.paste', 'edit.delete', 'edit.undo', 'edit.redo'],
  },
  {
    id: 'file',
    label: 'File',
    icon: 'document' as const,
    actions: ['file.new', 'file.open', 'file.save', 'file.saveAs', 'file.export'],
  },
  {
    id: 'view',
    label: 'View',
    icon: 'eye' as const,
    actions: ['view.zoomIn', 'view.zoomOut', 'view.zoomFit', 'view.fullscreen'],
  },
];

export function HotkeySettings({ className = '' }: HotkeySettingsProps) {
  const {
    hotkeys,
    globalHotkeysEnabled,
    setHotkey,
    resetHotkey,
    resetAllHotkeys,
    setGlobalHotkeysEnabled,
  } = useSettingsStore();

  // Find conflicting hotkeys
  const conflicts = useMemo(() => {
    const hotkeyMap = new Map<string, HotkeyBinding[]>();

    hotkeys.filter(h => h.enabled).forEach((binding) => {
      const key = HotkeyService.getHotkeyDisplayString(binding);
      const existing = hotkeyMap.get(key) || [];
      hotkeyMap.set(key, [...existing, binding]);
    });

    return Array.from(hotkeyMap.values()).filter((bindings) => bindings.length > 1);
  }, [hotkeys]);

  const hasConflict = useCallback(
    (binding: HotkeyBinding) => {
      return conflicts.some((group) => group.some((b) => b.id === binding.id));
    },
    [conflicts]
  );

  const handleHotkeyChange = useCallback(
    (id: string, updates: Partial<HotkeyBinding>) => {
      setHotkey(id, updates);
    },
    [setHotkey]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Global Settings */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Global Settings</h3>
        <div className="flex items-center justify-between p-4 bg-surface-800 rounded-lg border border-surface-700">
          <div>
            <label className="block text-sm font-medium text-surface-200">
              Enable global hotkeys
            </label>
            <p className="text-xs text-surface-500">
              Allow keyboard shortcuts to work even when the app is in the background
            </p>
          </div>
          <Toggle
            checked={globalHotkeysEnabled}
            onChange={(e) => setGlobalHotkeysEnabled(e.target.checked)}
            size="sm"
          />
        </div>
      </section>

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <section>
          {conflicts.map((conflictGroup, index) => (
            <HotkeyConflictWarning
              key={index}
              conflictingBindings={conflictGroup}
              className="mb-2"
            />
          ))}
        </section>
      )}

      {/* Hotkey Categories */}
      <section className="space-y-6">
        {HOTKEY_CATEGORIES.map((category) => {
          const categoryHotkeys = hotkeys.filter((h) =>
            category.actions.includes(h.action)
          );

          if (categoryHotkeys.length === 0) return null;

          return (
            <div key={category.id}>
              <h4 className="text-sm font-medium text-surface-300 flex items-center gap-2 mb-3">
                <Icon name={category.icon} size="sm" className="text-surface-400" />
                {category.label}
              </h4>
              <div className="space-y-2">
                {categoryHotkeys.map((binding) => (
                  <HotkeyEditor
                    key={binding.id}
                    binding={binding}
                    onChange={handleHotkeyChange}
                    onReset={resetHotkey}
                    hasConflict={hasConflict(binding)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Reset All */}
      <section className="pt-4 border-t border-surface-700">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-surface-200">Reset all hotkeys</h4>
            <p className="text-xs text-surface-500">Restore all shortcuts to default values</p>
          </div>
          <Button variant="secondary" size="sm" onClick={resetAllHotkeys}>
            <Icon name="arrow-path" size="sm" className="mr-2" />
            Reset All
          </Button>
        </div>
      </section>
    </div>
  );
}

HotkeySettings.displayName = 'HotkeySettings';
