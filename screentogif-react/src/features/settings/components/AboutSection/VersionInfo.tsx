/**
 * VersionInfo Component
 * Displays application version and update information
 */

import { useState, useEffect } from 'react';
import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';

export interface VersionInfoProps {
  className?: string;
}

interface AppVersion {
  version: string;
  buildNumber: string;
  buildDate: string;
  platform: string;
  arch: string;
}

export function VersionInfo({ className = '' }: VersionInfoProps) {
  const [versionInfo, setVersionInfo] = useState<AppVersion | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'none' | 'available' | 'uptodate'>('none');

  useEffect(() => {
    // Simulate loading version info
    // In real implementation, this would come from Tauri or package.json
    setVersionInfo({
      version: '3.0.0',
      buildNumber: '2024.12.17.1',
      buildDate: new Date().toISOString(),
      platform: navigator.platform || 'Unknown',
      arch: 'x64',
    });
  }, []);

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus('none');

    // Simulate update check
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Randomly show update available or up to date
    setUpdateStatus(Math.random() > 0.7 ? 'available' : 'uptodate');
    setIsCheckingUpdate(false);
  };

  if (!versionInfo) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-surface-700 rounded w-1/3 mb-2" />
        <div className="h-3 bg-surface-700 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Version Display */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
          <Icon name="record" size="xl" className="text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-surface-100">ScreenToGif</h4>
          <p className="text-sm text-surface-400">
            Version {versionInfo.version} ({versionInfo.buildNumber})
          </p>
        </div>
      </div>

      {/* Version Details */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-surface-800 rounded-lg border border-surface-700">
        <div>
          <span className="text-xs text-surface-500">Platform</span>
          <p className="text-sm text-surface-200">{versionInfo.platform}</p>
        </div>
        <div>
          <span className="text-xs text-surface-500">Architecture</span>
          <p className="text-sm text-surface-200">{versionInfo.arch}</p>
        </div>
        <div>
          <span className="text-xs text-surface-500">Build Date</span>
          <p className="text-sm text-surface-200">
            {new Date(versionInfo.buildDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-xs text-surface-500">Framework</span>
          <p className="text-sm text-surface-200">Tauri 2.0 + React</p>
        </div>
      </div>

      {/* Update Status */}
      {updateStatus === 'available' && (
        <div className="flex items-center gap-3 p-4 bg-accent-success/10 border border-accent-success/30 rounded-lg">
          <Icon name="arrow-down" size="md" className="text-accent-success" />
          <div className="flex-1">
            <h5 className="text-sm font-medium text-accent-success">Update Available</h5>
            <p className="text-xs text-surface-400">Version 3.1.0 is ready to download</p>
          </div>
          <Button variant="primary" size="sm">
            Download
          </Button>
        </div>
      )}

      {updateStatus === 'uptodate' && (
        <div className="flex items-center gap-3 p-4 bg-surface-800 border border-surface-700 rounded-lg">
          <Icon name="check-circle" size="md" className="text-accent-success" />
          <div>
            <h5 className="text-sm font-medium text-surface-200">Up to Date</h5>
            <p className="text-xs text-surface-400">You have the latest version</p>
          </div>
        </div>
      )}

      {/* Check for Updates Button */}
      <Button
        variant="secondary"
        onClick={handleCheckForUpdates}
        disabled={isCheckingUpdate}
        className="w-full"
      >
        {isCheckingUpdate ? (
          <>
            <Icon name="spinner" size="sm" className="mr-2 animate-spin" />
            Checking for updates...
          </>
        ) : (
          <>
            <Icon name="arrow-path" size="sm" className="mr-2" />
            Check for Updates
          </>
        )}
      </Button>
    </div>
  );
}

VersionInfo.displayName = 'VersionInfo';
