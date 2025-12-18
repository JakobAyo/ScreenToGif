import { Input } from '../../../../components/atoms/Input';
import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';

export interface YandexConfig {
  accessToken?: string;
  folderPath?: string;
}

export interface YandexPanelProps {
  config: YandexConfig;
  onChange: (config: Partial<YandexConfig>) => void;
  onAuthenticate?: () => void;
  isAuthenticated?: boolean;
  disabled?: boolean;
  className?: string;
}

export function YandexPanel({
  config,
  onChange,
  onAuthenticate,
  isAuthenticated = false,
  disabled = false,
  className = '',
}: YandexPanelProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#FFCC00] flex items-center justify-center">
          <span className="text-black font-bold text-lg">Y</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-surface-100">Yandex Disk</h4>
          <p className="text-xs text-surface-400">
            {isAuthenticated ? 'Connected to your account' : 'Store files in Yandex Disk'}
          </p>
        </div>
      </div>

      {isAuthenticated ? (
        <>
          <div className="p-3 bg-accent-success/10 border border-accent-success/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name="check-circle" size="sm" className="text-accent-success" />
              <span className="text-sm text-accent-success">Connected to Yandex Disk</span>
            </div>
          </div>

          <Input
            label="Upload Folder"
            value={config.folderPath || ''}
            onChange={(e) => onChange({ folderPath: e.target.value })}
            placeholder="/ScreenToGif"
            helperText="Folder path in your Yandex Disk"
            disabled={disabled}
          />
        </>
      ) : (
        <>
          <p className="text-xs text-surface-400">
            Connect your Yandex account to upload files directly to Yandex Disk.
          </p>

          <Button
            variant="secondary"
            onClick={onAuthenticate}
            disabled={disabled}
            fullWidth
          >
            Connect Yandex Account
          </Button>
        </>
      )}
    </div>
  );
}
