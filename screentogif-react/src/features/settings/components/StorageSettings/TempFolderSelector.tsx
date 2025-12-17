/**
 * TempFolderSelector Component
 * Settings for temporary file storage location
 */

import { useState } from 'react';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { Button } from '../../../../components/atoms/Button';
import { Input } from '../../../../components/atoms/Input';
import { Icon } from '../../../../components/atoms/Icon';

export interface TempFolderSelectorProps {
  disabled?: boolean;
  className?: string;
}

export function TempFolderSelector({ disabled = false, className = '' }: TempFolderSelectorProps) {
  const cacheDirectory = useSettingsStore((state) => state.cacheDirectory);
  const setCacheDirectory = useSettingsStore((state) => state.setCacheDirectory);
  const [localPath, setLocalPath] = useState(cacheDirectory);

  const handleBrowse = async () => {
    // In a real implementation, this would use Tauri's dialog API
    try {
      // @ts-ignore - Tauri API
      if (window.__TAURI__) {
        // @ts-ignore
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          directory: true,
          multiple: false,
          title: 'Select Cache Directory',
        });
        if (selected && typeof selected === 'string') {
          setLocalPath(selected);
          setCacheDirectory(selected);
        }
      }
    } catch (error) {
      console.error('Failed to open directory picker:', error);
    }
  };

  const handlePathChange = (value: string) => {
    setLocalPath(value);
  };

  const handlePathBlur = () => {
    setCacheDirectory(localPath);
  };

  const handleReset = () => {
    setLocalPath('');
    setCacheDirectory('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-surface-200">
        Temporary files location
      </label>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={localPath}
            onChange={(e) => handlePathChange(e.target.value)}
            onBlur={handlePathBlur}
            placeholder="Default system temp folder"
            disabled={disabled}
            className="pr-10"
          />
          {localPath && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-surface-400 hover:text-surface-200"
              title="Reset to default"
            >
              <Icon name="close" size="xs" />
            </button>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={handleBrowse}
          disabled={disabled}
          title="Browse for folder"
        >
          <Icon name="folder" size="sm" />
        </Button>
      </div>

      <p className="text-xs text-surface-500">
        {localPath
          ? `Temporary files will be stored in: ${localPath}`
          : 'Leave empty to use the default system temporary folder.'}
      </p>
    </div>
  );
}

TempFolderSelector.displayName = 'TempFolderSelector';
