import { useState } from 'react';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Tabs, type Tab } from '../../../../components/molecules/Tabs';
import { ImgurPanel, type ImgurConfig } from './ImgurPanel';
import { YandexPanel, type YandexConfig } from './YandexPanel';
import type { UploadDestination, UploadConfig } from '../../../../api/types';

export interface UploadOptionsPanelProps {
  enabled: boolean;
  config: UploadConfig | null;
  onEnabledChange: (enabled: boolean) => void;
  onConfigChange: (config: UploadConfig) => void;
  onAuthenticate?: (destination: UploadDestination) => void;
  authStatus?: Record<UploadDestination, boolean>;
  disabled?: boolean;
  className?: string;
}

const uploadTabs: Tab[] = [
  { id: 'imgur', label: 'Imgur' },
  { id: 'yandex', label: 'Yandex' },
  { id: 'custom', label: 'Custom' },
];

export function UploadOptionsPanel({
  enabled,
  config,
  onEnabledChange,
  onConfigChange,
  onAuthenticate,
  authStatus = {},
  disabled = false,
  className = '',
}: UploadOptionsPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(config?.destination || 'imgur');

  const handleDestinationChange = (destination: string) => {
    setActiveTab(destination);
    onConfigChange({
      destination: destination as UploadDestination,
      anonymous: true,
    });
  };

  const imgurConfig: ImgurConfig = {
    clientId: config?.apiKey,
    anonymous: config?.anonymous ?? true,
  };

  const yandexConfig: YandexConfig = {
    accessToken: config?.apiKey,
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Toggle
        label="Upload After Export"
        description="Automatically upload the file after export"
        checked={enabled}
        onChange={(e) => onEnabledChange(e.target.checked)}
        disabled={disabled}
      />

      {enabled && (
        <div className="mt-4">
          <Tabs
            tabs={uploadTabs}
            activeTab={activeTab}
            onChange={handleDestinationChange}
            variant="pills"
            size="sm"
          />

          <div className="mt-4 p-4 bg-surface-800/50 rounded-lg border border-surface-700">
            {activeTab === 'imgur' && (
              <ImgurPanel
                config={imgurConfig}
                onChange={(updates) => {
                  onConfigChange({
                    destination: 'imgur',
                    anonymous: updates.anonymous ?? imgurConfig.anonymous,
                    apiKey: updates.clientId,
                  });
                }}
                onAuthenticate={() => onAuthenticate?.('imgur')}
                isAuthenticated={authStatus.imgur}
                disabled={disabled}
              />
            )}

            {activeTab === 'yandex' && (
              <YandexPanel
                config={yandexConfig}
                onChange={(updates) => {
                  onConfigChange({
                    destination: 'yandex',
                    anonymous: false,
                    apiKey: updates.accessToken,
                  });
                }}
                onAuthenticate={() => onAuthenticate?.('yandex')}
                isAuthenticated={authStatus.yandex}
                disabled={disabled}
              />
            )}

            {activeTab === 'custom' && (
              <div className="space-y-4">
                <p className="text-sm text-surface-400">
                  Configure a custom upload endpoint for your own server or service.
                </p>
                <div className="p-3 bg-surface-700/50 rounded border border-surface-600">
                  <p className="text-xs text-surface-500">
                    Custom upload configuration coming soon...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
