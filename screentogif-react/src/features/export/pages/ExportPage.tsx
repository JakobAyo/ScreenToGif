import { useState, useCallback } from 'react';
import { Button } from '../../../components/atoms/Button';
import { Icon } from '../../../components/atoms/Icon';
import { Toggle } from '../../../components/atoms/Toggle';
import { FormatSelector } from '../components/FormatSelector';
import { GifOptionsPanel } from '../components/GifOptions';
import { VideoOptionsPanel } from '../components/VideoOptions';
import { ImageOptionsPanel } from '../components/ImageOptions';
import { OutputSettings } from '../components/OutputSettings';
import { UploadOptionsPanel } from '../components/UploadOptions';
import { ExportProgress } from '../components/ProgressDisplay';
import { PresetManager } from '../components/PresetManager';
import { useExportStore } from '../../../stores/exportStore';
import { useProjectStore } from '../../../stores/projectStore';
import { useExport } from '../hooks/useExport';
import { usePresets } from '../hooks/usePresets';
import { useUpload } from '../hooks/useUpload';
import type {
  OutputFormat,
  GifEncodingOptions,
  VideoEncodingOptions,
  ImageSequenceOptions,
  UploadConfig,
} from '../../../api/types';

export function ExportPage() {
  const {
    currentOptions,
    selectedFormatTab,
    outputPath,
    outputFileName,
    showAdvancedOptions,
    isEncoding,
    encodingProgress,
    uploadConfig,
    setCurrentOptions,
    updateCurrentOptions,
    setSelectedFormatTab,
    setOutputPath,
    setOutputFileName,
    setShowAdvancedOptions,
    setUploadConfig,
  } = useExportStore();

  const { currentProject, frames } = useProjectStore();
  const { startExport, cancelExport } = useExport();
  const {
    allPresets,
    builtInPresets,
    customPresets,
    selectedPresetId,
    defaultPresetId,
    createPreset,
    updatePreset,
    deletePreset,
    setDefault,
    selectPreset,
  } = usePresets();
  const { uploadFile, isUploading, uploadProgress } = useUpload();

  const [uploadEnabled, setUploadEnabled] = useState(false);

  // Get default options for format
  const getDefaultOptionsForFormat = (format: OutputFormat) => {
    const base = { format, outputPath: '' };

    switch (format) {
      case 'gif':
        return {
          ...base,
          gif: {
            encoder: 'screentogif' as const,
            colorCount: 256,
            quantization: 'medianCut' as const,
            dithering: 'floydSteinberg' as const,
            quality: 80,
            loopCount: 0,
            enableTransparency: false,
            detectUnchangedPixels: true,
            paintTransparent: false,
          },
        };
      case 'mp4':
      case 'webm':
      case 'avi':
        return {
          ...base,
          video: {
            codec: format === 'webm' ? ('vp9' as const) : ('h264' as const),
            bitrate: 5000,
            quality: 23,
            preset: 'medium' as const,
            pixelFormat: 'yuv420p',
            audioEnabled: false,
          },
        };
      case 'png':
      case 'jpg':
        return {
          ...base,
          imageSequence: {
            format: format as 'png' | 'jpg',
            quality: 90,
            namePattern: 'frame_{0:D4}',
            includeTimestamp: false,
            zipOutput: false,
          },
        };
      default:
        return base;
    }
  };

  const handleFormatChange = useCallback(
    (format: OutputFormat) => {
      setSelectedFormatTab(format);

      // Initialize options for the selected format if not already set
      if (!currentOptions || currentOptions.format !== format) {
        setCurrentOptions(getDefaultOptionsForFormat(format));
      }
    },
    [currentOptions, setCurrentOptions, setSelectedFormatTab]
  );

  const handleGifOptionsChange = useCallback(
    (updates: Partial<GifEncodingOptions>) => {
      if (currentOptions?.gif) {
        updateCurrentOptions({
          gif: { ...currentOptions.gif, ...updates },
        });
      }
    },
    [currentOptions, updateCurrentOptions]
  );

  const handleVideoOptionsChange = useCallback(
    (updates: Partial<VideoEncodingOptions>) => {
      if (currentOptions?.video) {
        updateCurrentOptions({
          video: { ...currentOptions.video, ...updates },
        });
      }
    },
    [currentOptions, updateCurrentOptions]
  );

  const handleImageOptionsChange = useCallback(
    (updates: Partial<ImageSequenceOptions>) => {
      if (currentOptions?.imageSequence) {
        updateCurrentOptions({
          imageSequence: { ...currentOptions.imageSequence, ...updates },
        });
      }
    },
    [currentOptions, updateCurrentOptions]
  );

  const handleUploadConfigChange = useCallback(
    (config: UploadConfig) => {
      setUploadConfig(config);
    },
    [setUploadConfig]
  );

  const handleStartExport = useCallback(async () => {
    if (!currentProject?.id) return;

    await startExport(currentProject.id, currentOptions || undefined);

    // After export, upload if enabled
    if (uploadEnabled && uploadConfig) {
      const outputFilePath = `${outputPath}/${outputFileName}.${currentOptions?.format}`;
      await uploadFile(outputFilePath, uploadConfig);
    }
  }, [
    currentProject,
    currentOptions,
    outputPath,
    outputFileName,
    uploadEnabled,
    uploadConfig,
    startExport,
    uploadFile,
  ]);

  const handleBrowse = useCallback(() => {
    // This would typically invoke a native file dialog via Tauri
    console.log('Browse for output folder');
  }, []);

  const canExport = currentProject && frames.length > 0 && currentOptions && outputPath;

  // Show progress view during encoding
  if (isEncoding || encodingProgress?.state === 'completed') {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="max-w-md mx-auto w-full">
          <ExportProgress
            encodingProgress={encodingProgress}
            uploadProgress={isUploading ? uploadProgress : null}
            onCancel={cancelExport}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-surface-100">Export</h1>
            <p className="mt-1 text-sm text-surface-400">
              Configure and export your recording
            </p>
          </div>

          {/* Format Selection */}
          <section>
            <h2 className="text-sm font-medium text-surface-200 mb-4">Output Format</h2>
            <FormatSelector
              selectedFormat={currentOptions?.format || null}
              onFormatChange={handleFormatChange}
              disabled={isEncoding}
            />
          </section>

          {/* Format-specific Options */}
          {currentOptions && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-surface-200">Format Options</h2>
                <Toggle
                  label="Advanced"
                  checked={showAdvancedOptions}
                  onChange={(e) => setShowAdvancedOptions(e.target.checked)}
                  size="sm"
                />
              </div>

              {currentOptions.format === 'gif' && currentOptions.gif && (
                <GifOptionsPanel
                  options={currentOptions.gif}
                  onChange={handleGifOptionsChange}
                  showAdvanced={showAdvancedOptions}
                  disabled={isEncoding}
                />
              )}

              {['mp4', 'webm', 'avi'].includes(currentOptions.format) && currentOptions.video && (
                <VideoOptionsPanel
                  options={currentOptions.video}
                  onChange={handleVideoOptionsChange}
                  format={currentOptions.format}
                  showAdvanced={showAdvancedOptions}
                  disabled={isEncoding}
                />
              )}

              {['png', 'jpg'].includes(currentOptions.format) && currentOptions.imageSequence && (
                <ImageOptionsPanel
                  options={currentOptions.imageSequence}
                  onChange={handleImageOptionsChange}
                  showAdvanced={showAdvancedOptions}
                  disabled={isEncoding}
                />
              )}
            </section>
          )}

          {/* Output Settings */}
          <section>
            <h2 className="text-sm font-medium text-surface-200 mb-4">Output Settings</h2>
            <OutputSettings
              outputPath={outputPath}
              fileName={outputFileName}
              onOutputPathChange={setOutputPath}
              onFileNameChange={setOutputFileName}
              onBrowse={handleBrowse}
              disabled={isEncoding}
            />
          </section>

          {/* Upload Options */}
          <section>
            <h2 className="text-sm font-medium text-surface-200 mb-4">Upload</h2>
            <UploadOptionsPanel
              enabled={uploadEnabled}
              config={uploadConfig}
              onEnabledChange={setUploadEnabled}
              onConfigChange={handleUploadConfigChange}
              disabled={isEncoding}
            />
          </section>

          {/* Export Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-700">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartExport}
              disabled={!canExport || isEncoding}
              isLoading={isEncoding}
              leftIcon={<Icon name="download" size="md" />}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar - Presets */}
      <div className="w-80 border-l border-surface-700 bg-surface-900/50 overflow-y-auto p-4">
        <PresetManager
          builtInPresets={builtInPresets}
          customPresets={customPresets}
          selectedPresetId={selectedPresetId}
          defaultPresetId={defaultPresetId}
          currentOptions={currentOptions}
          onSelectPreset={selectPreset}
          onCreatePreset={createPreset}
          onUpdatePreset={updatePreset}
          onDeletePreset={deletePreset}
          onSetDefaultPreset={setDefault}
          disabled={isEncoding}
        />
      </div>
    </div>
  );
}
