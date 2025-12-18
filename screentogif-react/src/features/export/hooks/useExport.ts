import { useCallback } from 'react';
import { useExportStore } from '../../../stores/exportStore';
import { startEncoding, cancelEncoding, getEncodingProgress } from '../../../api/clients/encodingClient';
import type { EncodingOptions, EncodingProgress } from '../../../api/types';

export interface UseExportOptions {
  onProgress?: (progress: EncodingProgress) => void;
  onComplete?: (success: boolean, outputPath?: string) => void;
  onError?: (error: string) => void;
}

export function useExport(options: UseExportOptions = {}) {
  const {
    currentOptions,
    isEncoding,
    encodingProgress,
    outputPath,
    outputFileName,
    startEncoding: setStartEncoding,
    updateEncodingProgress,
    completeEncoding,
    cancelEncoding: setCancelEncoding,
    setError,
    clearError,
  } = useExportStore();

  const startExport = useCallback(
    async (projectId: string, exportOptions?: EncodingOptions) => {
      const finalOptions = exportOptions || currentOptions;

      if (!finalOptions) {
        setError('No export options configured');
        options.onError?.('No export options configured');
        return;
      }

      try {
        clearError();

        // Construct full output path
        const fullOutputPath = `${outputPath}/${outputFileName}.${finalOptions.format}`;
        const optionsWithPath = { ...finalOptions, outputPath: fullOutputPath };

        // Start encoding via API
        const response = await startEncoding({
          projectId,
          options: optionsWithPath,
        });

        if (!response.success || !response.jobId) {
          const error = response.error || 'Failed to start encoding';
          setError(error);
          options.onError?.(error);
          return;
        }

        // Update store state
        setStartEncoding(response.jobId);

        // Start polling for progress
        const pollProgress = async () => {
          while (true) {
            const progress = await getEncodingProgress(response.jobId);

            updateEncodingProgress(progress);
            options.onProgress?.(progress);

            if (progress.state === 'completed') {
              completeEncoding(true);
              options.onComplete?.(true, fullOutputPath);
              break;
            }

            if (progress.state === 'failed') {
              completeEncoding(false, progress.error);
              options.onError?.(progress.error || 'Encoding failed');
              break;
            }

            if (progress.state === 'cancelled') {
              break;
            }

            // Poll every 500ms
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        };

        pollProgress();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        options.onError?.(errorMessage);
      }
    },
    [
      currentOptions,
      outputPath,
      outputFileName,
      setStartEncoding,
      updateEncodingProgress,
      completeEncoding,
      setError,
      clearError,
      options,
    ]
  );

  const cancelExport = useCallback(async () => {
    try {
      const { currentJobId } = useExportStore.getState();
      if (currentJobId) {
        await cancelEncoding(currentJobId);
      }
      setCancelEncoding();
    } catch (error) {
      console.error('Failed to cancel encoding:', error);
    }
  }, [setCancelEncoding]);

  return {
    startExport,
    cancelExport,
    isEncoding,
    encodingProgress,
    currentOptions,
  };
}
