import { Input } from '../../../../components/atoms/Input';
import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';

export interface FilePathSelectorProps {
  value: string;
  onChange: (path: string) => void;
  onBrowse?: () => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function FilePathSelector({
  value,
  onChange,
  onBrowse,
  label = 'Output Path',
  placeholder = 'Select output folder...',
  helperText,
  error = false,
  errorMessage,
  disabled = false,
  className = '',
}: FilePathSelectorProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-surface-200 mb-1.5">
          {label}
        </label>
      )}

      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          className="flex-1"
          leftIcon={<Icon name="folder" size="sm" />}
        />
        <Button
          variant="secondary"
          onClick={onBrowse}
          disabled={disabled}
          leftIcon={<Icon name="dots-horizontal" size="sm" />}
        >
          Browse
        </Button>
      </div>

      {(errorMessage || helperText) && (
        <p
          className={`mt-1.5 text-xs ${
            error && errorMessage ? 'text-accent-error' : 'text-surface-400'
          }`}
        >
          {error && errorMessage ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
}
