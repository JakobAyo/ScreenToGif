import { useCallback, useState } from 'react';
import { useExportStore } from '../../../stores/exportStore';
import {
  uploadToImgur,
  uploadToYandex,
  getUploadProgress,
  cancelUpload as cancelUploadApi,
} from '../../../api/clients/uploadClient';
import type { UploadConfig, UploadResult, UploadProgress, UploadDestination } from '../../../api/types';

export interface UseUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const {
    isUploading,
    uploadProgress,
    lastUploadResult,
    uploadConfig,
    startUpload: setStartUpload,
    updateUploadProgress,
    completeUpload,
    cancelUpload: setCancelUpload,
    setUploadConfig,
  } = useExportStore();

  const [isPaused, setIsPaused] = useState(false);

  const uploadFile = useCallback(
    async (filePath: string, config: UploadConfig) => {
      try {
        setStartUpload(config);

        // Select upload method based on destination
        let uploadPromise: Promise<UploadResult>;

        switch (config.destination) {
          case 'imgur':
            uploadPromise = uploadToImgur({
              filePath,
              config,
            });
            break;
          case 'yandex':
            uploadPromise = uploadToYandex({
              filePath,
              config,
            });
            break;
          default:
            throw new Error(`Unsupported upload destination: ${config.destination}`);
        }

        // Start polling for progress
        const pollProgress = async (uploadId: string) => {
          while (true) {
            const progress = await getUploadProgress(uploadId);
            updateUploadProgress(progress);
            options.onProgress?.(progress);

            if (
              progress.state === 'completed' ||
              progress.state === 'failed'
            ) {
              break;
            }

            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        };

        // Wait for upload to complete
        const result = await uploadPromise;

        if (result.success) {
          completeUpload(result);
          options.onComplete?.(result);
        } else {
          completeUpload(result);
          options.onError?.(result.error || 'Upload failed');
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const failedResult: UploadResult = {
          uploadId: crypto.randomUUID(),
          success: false,
          destination: config.destination,
          error: errorMessage,
        };
        completeUpload(failedResult);
        options.onError?.(errorMessage);
        return failedResult;
      }
    },
    [setStartUpload, updateUploadProgress, completeUpload, options]
  );

  const cancelUpload = useCallback(async () => {
    try {
      const currentProgress = uploadProgress;
      if (currentProgress?.uploadId) {
        await cancelUploadApi(currentProgress.uploadId);
      }
      setCancelUpload();
    } catch (error) {
      console.error('Failed to cancel upload:', error);
    }
  }, [uploadProgress, setCancelUpload]);

  const retryUpload = useCallback(
    async (filePath: string) => {
      if (uploadConfig) {
        return uploadFile(filePath, uploadConfig);
      }
      throw new Error('No previous upload config to retry');
    },
    [uploadConfig, uploadFile]
  );

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  const copyResultUrl = useCallback(async () => {
    if (lastUploadResult?.url) {
      return copyToClipboard(lastUploadResult.url);
    }
    return false;
  }, [lastUploadResult, copyToClipboard]);

  return {
    // State
    isUploading,
    uploadProgress,
    lastUploadResult,
    uploadConfig,
    isPaused,

    // Actions
    uploadFile,
    cancelUpload,
    retryUpload,
    setUploadConfig,
    copyResultUrl,
    copyToClipboard,
  };
}
