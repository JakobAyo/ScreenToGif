import { type ReactNode } from 'react';
import { Icon, type IconName } from '../atoms/Icon';
import { Tooltip } from '../molecules/Tooltip';

export type StatusType = 'idle' | 'recording' | 'processing' | 'success' | 'error' | 'warning';

export interface StatusItem {
  id: string;
  content: ReactNode;
  tooltip?: string;
  onClick?: () => void;
  icon?: IconName;
}

export interface StatusBarProps {
  status?: StatusType;
  statusMessage?: string;
  leftItems?: StatusItem[];
  rightItems?: StatusItem[];
  className?: string;
}

const statusConfig: Record<StatusType, { icon: IconName; color: string; bg: string }> = {
  idle: { icon: 'check-circle', color: 'text-surface-400', bg: 'bg-surface-700' },
  recording: { icon: 'record', color: 'text-accent-error', bg: 'bg-accent-error/20' },
  processing: { icon: 'clock', color: 'text-accent-warning', bg: 'bg-accent-warning/20' },
  success: { icon: 'check-circle', color: 'text-accent-success', bg: 'bg-accent-success/20' },
  error: { icon: 'x-circle', color: 'text-accent-error', bg: 'bg-accent-error/20' },
  warning: { icon: 'exclamation-circle', color: 'text-accent-warning', bg: 'bg-accent-warning/20' },
};

// StatusItem component
function StatusItemComponent({ item }: { item: StatusItem }) {
  const content = (
    <div
      className={`
        flex items-center gap-1.5
        px-2 h-full
        text-xs text-surface-300
        ${item.onClick ? 'hover:bg-surface-700 cursor-pointer' : ''}
        transition-colors duration-100
      `}
      onClick={item.onClick}
      role={item.onClick ? 'button' : undefined}
    >
      {item.icon && <Icon name={item.icon} size="xs" />}
      {item.content}
    </div>
  );

  if (item.tooltip) {
    return (
      <Tooltip content={item.tooltip} position="top">
        {content}
      </Tooltip>
    );
  }

  return content;
}

// Divider between status items
function StatusDivider() {
  return <div className="w-px h-3 bg-surface-700" />;
}

export function StatusBar({
  status = 'idle',
  statusMessage,
  leftItems = [],
  rightItems = [],
  className = '',
}: StatusBarProps) {
  const { icon, color, bg } = statusConfig[status];

  return (
    <footer
      className={`
        flex items-center justify-between
        h-6
        bg-surface-900
        border-t border-surface-800
        text-xs
        select-none
        ${className}
      `}
    >
      {/* Left section */}
      <div className="flex items-center h-full">
        {/* Status indicator */}
        <div className={`flex items-center gap-1.5 px-3 h-full ${bg}`}>
          <Icon name={icon} size="xs" className={color} />
          {statusMessage && (
            <span className={color}>{statusMessage}</span>
          )}
          {status === 'recording' && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent-error animate-pulse-soft" />
          )}
          {status === 'processing' && (
            <Icon name="cog" size="xs" className="animate-spin text-accent-warning" />
          )}
        </div>

        {/* Left items */}
        {leftItems.length > 0 && (
          <>
            <StatusDivider />
            {leftItems.map((item, index) => (
              <div key={item.id} className="flex items-center h-full">
                <StatusItemComponent item={item} />
                {index < leftItems.length - 1 && <StatusDivider />}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center h-full">
        {rightItems.map((item, index) => (
          <div key={item.id} className="flex items-center h-full">
            {index > 0 && <StatusDivider />}
            <StatusItemComponent item={item} />
          </div>
        ))}
      </div>
    </footer>
  );
}

// Pre-built status items for common use cases
export interface FrameInfoProps {
  currentFrame: number;
  totalFrames: number;
  onClick?: () => void;
}

export function FrameInfo({ currentFrame, totalFrames, onClick }: FrameInfoProps) {
  return (
    <StatusItemComponent
      item={{
        id: 'frame-info',
        content: `Frame ${currentFrame} / ${totalFrames}`,
        icon: 'film',
        tooltip: 'Current frame position',
        onClick,
      }}
    />
  );
}

export interface DurationInfoProps {
  duration: number; // in milliseconds
  onClick?: () => void;
}

export function DurationInfo({ duration, onClick }: DurationInfoProps) {
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = ms % 1000;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${Math.floor(remainingMs / 10).toString().padStart(2, '0')}`;
  };

  return (
    <StatusItemComponent
      item={{
        id: 'duration-info',
        content: formatDuration(duration),
        icon: 'clock',
        tooltip: 'Total duration',
        onClick,
      }}
    />
  );
}

export interface DimensionsInfoProps {
  width: number;
  height: number;
  onClick?: () => void;
}

export function DimensionsInfo({ width, height, onClick }: DimensionsInfoProps) {
  return (
    <StatusItemComponent
      item={{
        id: 'dimensions-info',
        content: `${width} x ${height}`,
        icon: 'photo',
        tooltip: 'Dimensions',
        onClick,
      }}
    />
  );
}

export interface ZoomInfoProps {
  zoom: number; // as percentage (100 = 100%)
  onClick?: () => void;
}

export function ZoomInfo({ zoom, onClick }: ZoomInfoProps) {
  return (
    <StatusItemComponent
      item={{
        id: 'zoom-info',
        content: `${zoom}%`,
        icon: 'zoom-in',
        tooltip: 'Zoom level',
        onClick,
      }}
    />
  );
}
