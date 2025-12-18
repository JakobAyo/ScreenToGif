/**
 * WebcamPreview Component
 * Display webcam feed with device selection and position/size controls
 */

import { useRef, useEffect, useState } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Button } from '../../../../components/atoms/Button';
import { Dropdown, type DropdownOption } from '../../../../components/molecules/Dropdown';
import { Tooltip } from '../../../../components/molecules/Tooltip';

export interface WebcamDevice {
  deviceId: string;
  label: string;
}

export interface WebcamPreviewProps {
  devices: WebcamDevice[];
  selectedDeviceId: string | null;
  onDeviceChange: (deviceId: string) => void;
  stream: MediaStream | null;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onPositionChange?: (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void;
  size?: 'small' | 'medium' | 'large';
  onSizeChange?: (size: 'small' | 'medium' | 'large') => void;
  onClose?: () => void;
  className?: string;
}

const sizeStyles = {
  small: 'w-32 h-24',
  medium: 'w-48 h-36',
  large: 'w-64 h-48',
};

const positionStyles = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

export function WebcamPreview({
  devices,
  selectedDeviceId,
  onDeviceChange,
  stream,
  position = 'bottom-right',
  onPositionChange,
  size = 'medium',
  onSizeChange,
  onClose,
  className = '',
}: WebcamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const deviceOptions: DropdownOption<string>[] = devices.map((device) => ({
    value: device.deviceId,
    label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
  }));

  const handleCyclePosition = () => {
    if (!onPositionChange) return;
    const positions: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
      'top-left',
      'top-right',
      'bottom-right',
      'bottom-left',
    ];
    const currentIndex = positions.indexOf(position);
    const nextPosition = positions[(currentIndex + 1) % positions.length];
    onPositionChange(nextPosition);
  };

  const handleCycleSize = () => {
    if (!onSizeChange) return;
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(size);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    onSizeChange(nextSize);
  };

  return (
    <div
      className={`
        absolute rounded-lg overflow-hidden shadow-lg
        border border-surface-600 bg-surface-900
        transition-all duration-200
        ${positionStyles[position]}
        ${sizeStyles[size]}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowControls(false);
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {/* No camera placeholder */}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-800">
          <div className="text-center text-surface-400">
            <Icon name="eye-slash" size="lg" className="mx-auto mb-2" />
            <span className="text-xs">No camera</span>
          </div>
        </div>
      )}

      {/* Hover controls overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 via-transparent to-surface-900/60">
          {/* Top controls */}
          <div className="absolute top-1 right-1 flex gap-1">
            {onClose && (
              <Tooltip content="Close preview" position="bottom">
                <button
                  onClick={onClose}
                  className="p-1 rounded bg-surface-800/80 text-surface-300 hover:text-white hover:bg-accent-error/80 transition-colors"
                >
                  <Icon name="close" size="xs" />
                </button>
              </Tooltip>
            )}
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center">
            <div className="flex gap-1">
              {onPositionChange && (
                <Tooltip content="Change position" position="top">
                  <button
                    onClick={handleCyclePosition}
                    className="p-1 rounded bg-surface-800/80 text-surface-300 hover:text-white transition-colors"
                  >
                    <Icon name="arrow-right" size="xs" />
                  </button>
                </Tooltip>
              )}
              {onSizeChange && (
                <Tooltip content="Change size" position="top">
                  <button
                    onClick={handleCycleSize}
                    className="p-1 rounded bg-surface-800/80 text-surface-300 hover:text-white transition-colors"
                  >
                    <Icon name="zoom-in" size="xs" />
                  </button>
                </Tooltip>
              )}
            </div>

            <button
              onClick={() => setShowControls(!showControls)}
              className="p-1 rounded bg-surface-800/80 text-surface-300 hover:text-white transition-colors"
            >
              <Icon name="cog" size="xs" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded controls panel */}
      {showControls && (
        <div className="absolute inset-0 bg-surface-900/95 p-2 flex flex-col gap-2">
          <div className="text-xs text-surface-400 font-medium">Camera</div>
          <Dropdown
            options={deviceOptions}
            value={selectedDeviceId ?? undefined}
            onChange={onDeviceChange}
            placeholder="Select camera"
            size="sm"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowControls(false)}
            className="mt-auto"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

WebcamPreview.displayName = 'WebcamPreview';
