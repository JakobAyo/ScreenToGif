/**
 * CacheManager Component
 * Cache size display and clear functionality
 */

import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { Button } from '../../../../components/atoms/Button';
import { Slider } from '../../../../components/atoms/Slider';
import { Icon } from '../../../../components/atoms/Icon';
import { ProgressBar } from '../../../../components/molecules/ProgressBar';
import { LocalizationService } from '../../../../services/LocalizationService';

export interface CacheManagerProps {
  disabled?: boolean;
  className?: string;
}

export function CacheManager({ disabled = false, className = '' }: CacheManagerProps) {
  const maxCacheSize = useSettingsStore((state) => state.maxCacheSize);
  const setMaxCacheSize = useSettingsStore((state) => state.setMaxCacheSize);

  // Simulated cache data - in real implementation, this would come from backend
  const [cacheInfo, setCacheInfo] = useState({
    currentSize: 0,
    itemCount: 0,
    isLoading: true,
    isClearing: false,
  });

  useEffect(() => {
    // Simulate loading cache info
    const loadCacheInfo = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCacheInfo({
        currentSize: Math.floor(Math.random() * 500) * 1024 * 1024, // Random size up to 500MB
        itemCount: Math.floor(Math.random() * 100),
        isLoading: false,
        isClearing: false,
      });
    };
    loadCacheInfo();
  }, []);

  const handleClearCache = async () => {
    setCacheInfo((prev) => ({ ...prev, isClearing: true }));

    // Simulate clearing cache
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setCacheInfo({
      currentSize: 0,
      itemCount: 0,
      isLoading: false,
      isClearing: false,
    });
  };

  const usagePercent = maxCacheSize > 0
    ? Math.min(100, (cacheInfo.currentSize / (maxCacheSize * 1024 * 1024)) * 100)
    : 0;

  const formatSize = (bytes: number) => LocalizationService.formatFileSize(bytes);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cache Usage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-surface-200">Cache usage</label>
          <span className="text-sm text-surface-400">
            {cacheInfo.isLoading ? (
              'Loading...'
            ) : (
              <>
                {formatSize(cacheInfo.currentSize)} / {formatSize(maxCacheSize * 1024 * 1024)}
              </>
            )}
          </span>
        </div>

        <ProgressBar
          progress={usagePercent}
          size="md"
          variant={usagePercent > 90 ? 'error' : usagePercent > 70 ? 'warning' : 'primary'}
        />

        {!cacheInfo.isLoading && (
          <p className="text-xs text-surface-500">
            {cacheInfo.itemCount} cached items
          </p>
        )}
      </div>

      {/* Max Cache Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-surface-200">Maximum cache size</label>
          <span className="text-sm text-surface-400 font-mono">{maxCacheSize} MB</span>
        </div>
        <Slider
          value={maxCacheSize}
          onChange={(e) => setMaxCacheSize(Number(e.target.value))}
          min={256}
          max={4096}
          step={256}
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-surface-500">
          <span>256 MB</span>
          <span>4 GB</span>
        </div>
      </div>

      {/* Clear Cache */}
      <div className="flex items-center justify-between p-4 bg-surface-800 rounded-lg border border-surface-700">
        <div>
          <label className="block text-sm font-medium text-surface-200">Clear cache</label>
          <p className="text-xs text-surface-500">
            Remove all cached files to free up disk space
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClearCache}
          disabled={disabled || cacheInfo.isClearing || cacheInfo.currentSize === 0}
        >
          {cacheInfo.isClearing ? (
            <>
              <Icon name="spinner" size="sm" className="mr-2 animate-spin" />
              Clearing...
            </>
          ) : (
            <>
              <Icon name="trash" size="sm" className="mr-2" />
              Clear Cache
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-surface-800 rounded-lg border border-surface-700">
        <Icon name="info-circle" size="sm" className="text-surface-400 mt-0.5" />
        <p className="text-xs text-surface-400">
          The cache stores temporary files to improve performance. Clearing it may temporarily slow
          down the application until files are regenerated.
        </p>
      </div>
    </div>
  );
}

CacheManager.displayName = 'CacheManager';
