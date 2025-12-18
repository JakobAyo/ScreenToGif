import { Toggle } from '../../../../components/atoms/Toggle';
import { FilePathSelector } from './FilePathSelector';
import { NamingPattern } from './NamingPattern';

export interface OutputSettingsProps {
  outputPath: string;
  fileName: string;
  overwriteExisting?: boolean;
  openAfterExport?: boolean;
  copyToClipboard?: boolean;
  onOutputPathChange: (path: string) => void;
  onFileNameChange: (name: string) => void;
  onOverwriteChange?: (overwrite: boolean) => void;
  onOpenAfterExportChange?: (open: boolean) => void;
  onCopyToClipboardChange?: (copy: boolean) => void;
  onBrowse?: () => void;
  disabled?: boolean;
  className?: string;
}

export function OutputSettings({
  outputPath,
  fileName,
  overwriteExisting = false,
  openAfterExport = true,
  copyToClipboard = false,
  onOutputPathChange,
  onFileNameChange,
  onOverwriteChange,
  onOpenAfterExportChange,
  onCopyToClipboardChange,
  onBrowse,
  disabled = false,
  className = '',
}: OutputSettingsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Output Path */}
      <FilePathSelector
        value={outputPath}
        onChange={onOutputPathChange}
        onBrowse={onBrowse}
        label="Output Folder"
        placeholder="Select output folder..."
        disabled={disabled}
      />

      {/* File Name Pattern */}
      <NamingPattern
        value={fileName}
        onChange={onFileNameChange}
        disabled={disabled}
      />

      {/* Output Options */}
      <div className="space-y-4 pt-4 border-t border-surface-700">
        <h4 className="text-sm font-medium text-surface-200">Options</h4>

        <Toggle
          label="Overwrite Existing Files"
          description="Replace files with the same name"
          checked={overwriteExisting}
          onChange={(e) => onOverwriteChange?.(e.target.checked)}
          disabled={disabled}
        />

        <Toggle
          label="Open After Export"
          description="Open the file after export completes"
          checked={openAfterExport}
          onChange={(e) => onOpenAfterExportChange?.(e.target.checked)}
          disabled={disabled}
        />

        <Toggle
          label="Copy to Clipboard"
          description="Copy the file path to clipboard"
          checked={copyToClipboard}
          onChange={(e) => onCopyToClipboardChange?.(e.target.checked)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
