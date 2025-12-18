/**
 * FrameRenderer Component
 * Displays the current frame image with proper scaling
 */

import { memo, useEffect, useRef, useState } from 'react';
import type { Frame } from '../../../../api/types';

export interface FrameRendererProps {
  /** Current frame to display */
  frame: Frame | null;
  /** Zoom level (1.0 = 100%) */
  zoom: number;
  /** Whether to show a checkerboard pattern for transparency */
  showTransparency?: boolean;
  /** Image fit mode */
  fitMode?: 'contain' | 'cover' | 'actual';
  /** Callback when image loads */
  onImageLoad?: (width: number, height: number) => void;
  /** Callback on image load error */
  onImageError?: (error: string) => void;
  className?: string;
}

export const FrameRenderer = memo(function FrameRenderer({
  frame,
  zoom,
  showTransparency = true,
  fitMode = 'contain',
  onImageLoad,
  onImageError,
  className = '',
}: FrameRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Get image source
  const imageSrc = frame?.imageDataUrl || frame?.filePath;

  // Handle image load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    setIsLoading(false);
    setHasError(false);
    onImageLoad?.(img.naturalWidth, img.naturalHeight);
  };

  // Handle image error
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    onImageError?.('Failed to load frame image');
  };

  // Reset states when frame changes
  useEffect(() => {
    if (frame) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [frame?.id]);

  // Calculate dimensions based on fit mode
  const getImageStyle = (): React.CSSProperties => {
    if (!imageSize) return {};

    const scaledWidth = imageSize.width * zoom;
    const scaledHeight = imageSize.height * zoom;

    switch (fitMode) {
      case 'actual':
        return {
          width: scaledWidth,
          height: scaledHeight,
          maxWidth: 'none',
          maxHeight: 'none',
        };
      case 'cover':
        return {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        };
      case 'contain':
      default:
        return {
          width: scaledWidth,
          height: scaledHeight,
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        };
    }
  };

  // No frame to display
  if (!frame) {
    return (
      <div
        className={`
          flex items-center justify-center
          bg-surface-900 text-surface-500
          ${className}
        `}
      >
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-surface-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">No frame selected</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`
        relative flex items-center justify-center overflow-hidden
        ${showTransparency ? 'bg-checkerboard' : 'bg-surface-900'}
        ${className}
      `}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-900/50">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="flex flex-col items-center justify-center text-accent-error">
          <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm">Failed to load frame</span>
        </div>
      )}

      {/* Frame image */}
      {imageSrc && !hasError && (
        <img
          src={imageSrc}
          alt={`Frame ${frame.metadata.index + 1}`}
          style={getImageStyle()}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`
            transition-opacity duration-200
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
          draggable={false}
        />
      )}

      {/* Frame info overlay (shown on hover or when paused) */}
      <div
        className="
          absolute bottom-2 left-2
          px-2 py-1 rounded
          bg-surface-900/80 backdrop-blur-sm
          text-xs text-surface-300 font-mono
          opacity-0 hover:opacity-100 transition-opacity
        "
      >
        <div>Frame {frame.metadata.index + 1}</div>
        {imageSize && (
          <div>
            {imageSize.width} × {imageSize.height}
          </div>
        )}
        <div>{frame.metadata.delay}ms</div>
      </div>
    </div>
  );
});
