import { Input } from '../../../../components/atoms/Input';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';

export interface ImgurConfig {
  clientId?: string;
  anonymous: boolean;
  accessToken?: string;
}

export interface ImgurPanelProps {
  config: ImgurConfig;
  onChange: (config: Partial<ImgurConfig>) => void;
  onAuthenticate?: () => void;
  isAuthenticated?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ImgurPanel({
  config,
  onChange,
  onAuthenticate,
  isAuthenticated = false,
  disabled = false,
  className = '',
}: ImgurPanelProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#1BB76E] flex items-center justify-center">
          <span className="text-white font-bold text-lg">i</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-surface-100">Imgur</h4>
          <p className="text-xs text-surface-400">
            {isAuthenticated ? 'Connected to your account' : 'Upload anonymously or with account'}
          </p>
        </div>
      </div>

      <Toggle
        label="Anonymous Upload"
        description="Upload without linking to an account"
        checked={config.anonymous}
        onChange={(e) => onChange({ anonymous: e.target.checked })}
        disabled={disabled}
      />

      {!config.anonymous && (
        <>
          {isAuthenticated ? (
            <div className="p-3 bg-accent-success/10 border border-accent-success/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="check-circle" size="sm" className="text-accent-success" />
                <span className="text-sm text-accent-success">Connected to Imgur</span>
              </div>
            </div>
          ) : (
            <>
              <Input
                label="Client ID"
                value={config.clientId || ''}
                onChange={(e) => onChange({ clientId: e.target.value })}
                placeholder="Enter Imgur Client ID"
                helperText="Get your Client ID from Imgur API settings"
                disabled={disabled}
              />

              <Button
                variant="secondary"
                onClick={onAuthenticate}
                disabled={disabled || !config.clientId}
                fullWidth
              >
                Authenticate with Imgur
              </Button>
            </>
          )}
        </>
      )}

      {config.anonymous && (
        <p className="text-xs text-surface-500">
          Anonymous uploads are not linked to any account and may expire after some time.
        </p>
      )}
    </div>
  );
}
