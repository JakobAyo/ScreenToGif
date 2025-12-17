import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';
import { ProgressBar, CircularProgress } from '../../../../components/molecules/ProgressBar';
import { EncodingStages } from './EncodingStage';
import type { EncodingProgress, UploadProgress } from '../../../../api/types';

export interface ExportProgressProps {
  encodingProgress: EncodingProgress | null;
  uploadProgress?: UploadProgress | null;
  onCancel?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
  className?: string;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ExportProgress({
  encodingProgress,
  uploadProgress,
  onCancel,
  onPause,
  onResume,
  isPaused = false,
  className = '',
}: ExportProgressProps) {
  if (!encodingProgress) {
    return null;
  }

  const isEncoding = encodingProgress.state === 'encoding' || encodingProgress.state === 'preparing' || encodingProgress.state === 'optimizing';
  const isComplete = encodingProgress.state === 'completed';
  const isFailed = encodingProgress.state === 'failed';
  const isCancelled = encodingProgress.state === 'cancelled';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Progress */}
      <div className="text-center">
        <CircularProgress
          value={encodingProgress.progress}
          size={120}
          strokeWidth={8}
          variant={isComplete ? 'success' : isFailed ? 'error' : 'default'}
          showLabel
          className="mx-auto"
        />

        <h3 className="mt-4 text-lg font-medium text-surface-100">
          {isComplete && 'Export Complete!'}
          {isFailed && 'Export Failed'}
          {isCancelled && 'Export Cancelled'}
          {isEncoding && (isPaused ? 'Paused' : encodingProgress.stage)}
        </h3>

        {encodingProgress.error && (
          <p className="mt-2 text-sm text-accent-error">
            {encodingProgress.error}
          </p>
        )}
      </div>

      {/* Detailed Progress Bar */}
      {isEncoding && (
        <ProgressBar
          value={encodingProgress.progress}
          showLabel
          striped
          animated={!isPaused}
          size="md"
        />
      )}

      {/* Progress Details */}
      {isEncoding && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-surface-800 rounded-lg">
            <span className="text-surface-400">Frames</span>
            <p className="text-surface-100 font-mono">
              {encodingProgress.currentFrame} / {encodingProgress.totalFrames}
            </p>
          </div>

          {encodingProgress.estimatedTimeRemaining !== undefined && (
            <div className="p-3 bg-surface-800 rounded-lg">
              <span className="text-surface-400">Time Remaining</span>
              <p className="text-surface-100 font-mono">
                {formatTime(encodingProgress.estimatedTimeRemaining)}
              </p>
            </div>
          )}

          {encodingProgress.outputFileSize !== undefined && (
            <div className="p-3 bg-surface-800 rounded-lg">
              <span className="text-surface-400">Output Size</span>
              <p className="text-surface-100 font-mono">
                {formatFileSize(encodingProgress.outputFileSize)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Encoding Stages */}
      <EncodingStages currentStage={encodingProgress.state} />

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="pt-4 border-t border-surface-700">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="upload" size="sm" className="text-surface-400" />
            <span className="text-sm font-medium text-surface-200">Uploading...</span>
          </div>

          <ProgressBar
            value={uploadProgress.progress}
            showLabel
            variant={uploadProgress.state === 'failed' ? 'error' : 'default'}
            size="sm"
          />

          <p className="mt-2 text-xs text-surface-400">
            {formatFileSize(uploadProgress.bytesUploaded)} / {formatFileSize(uploadProgress.totalBytes)}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {isEncoding && (
        <div className="flex gap-3">
          {onPause && onResume && (
            <Button
              variant="secondary"
              onClick={isPaused ? onResume : onPause}
              leftIcon={<Icon name={isPaused ? 'play' : 'pause'} size="sm" />}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}

          {onCancel && (
            <Button
              variant="danger"
              onClick={onCancel}
              leftIcon={<Icon name="x-mark" size="sm" />}
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Complete Actions */}
      {isComplete && (
        <div className="flex gap-3">
          <Button
            variant="primary"
            leftIcon={<Icon name="folder" size="sm" />}
          >
            Open Folder
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Icon name="eye" size="sm" />}
          >
            Preview
          </Button>
        </div>
      )}
    </div>
  );
}
