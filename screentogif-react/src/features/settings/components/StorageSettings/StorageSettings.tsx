/**
 * StorageSettings Component
 * Container for storage and cache settings
 */

import { useSettingsStore } from '../../../../stores/settingsStore';
import { Slider } from '../../../../components/atoms/Slider';
import { TempFolderSelector } from './TempFolderSelector';
import { CacheManager } from './CacheManager';

export interface StorageSettingsProps {
  className?: string;
}

export function StorageSettings({ className = '' }: StorageSettingsProps) {
  const {
    maxUndoHistory,
    maxRecentProjects,
    setMaxUndoHistory,
    setMaxRecentProjects,
  } = useSettingsStore();

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Cache Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Cache</h3>
        <CacheManager />
      </section>

      {/* Temporary Files Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Temporary Files</h3>
        <TempFolderSelector />
      </section>

      {/* Memory Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Memory Management</h3>
        <div className="space-y-6">
          {/* Undo History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-surface-200">Undo history limit</label>
              <span className="text-sm text-surface-400 font-mono">{maxUndoHistory} steps</span>
            </div>
            <Slider
              value={maxUndoHistory}
              onChange={(e) => setMaxUndoHistory(Number(e.target.value))}
              min={10}
              max={500}
              step={10}
            />
            <p className="text-xs text-surface-500">
              Higher values allow more undo steps but use more memory
            </p>
          </div>

          {/* Recent Projects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-surface-200">Recent projects</label>
              <span className="text-sm text-surface-400 font-mono">{maxRecentProjects} items</span>
            </div>
            <Slider
              value={maxRecentProjects}
              onChange={(e) => setMaxRecentProjects(Number(e.target.value))}
              min={5}
              max={50}
              step={5}
            />
            <p className="text-xs text-surface-500">
              Number of recent projects to keep in the list
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

StorageSettings.displayName = 'StorageSettings';
