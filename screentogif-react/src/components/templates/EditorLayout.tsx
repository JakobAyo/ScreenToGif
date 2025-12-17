import { useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../atoms/Icon';
import { Slider } from '../atoms/Slider';
import { Tooltip } from '../molecules/Tooltip';
import { Sidebar, type SidebarItem } from '../organisms/Sidebar';
import { Toolbar, type ToolbarGroup } from '../organisms/Toolbar';
import { StatusBar, type StatusItem } from '../organisms/StatusBar';

export interface EditorLayoutProps {
  // Frame data
  currentFrame?: number;
  totalFrames?: number;
  isPlaying?: boolean;
  zoom?: number;

  // Dimensions
  width?: number;
  height?: number;
  duration?: number; // in milliseconds

  // Callbacks
  onFrameChange?: (frame: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onPreviousFrame?: () => void;
  onNextFrame?: () => void;
  onFirstFrame?: () => void;
  onLastFrame?: () => void;
  onZoomChange?: (zoom: number) => void;
  onSave?: () => void;
  onExport?: () => void;

  // Tool selection
  activeTool?: string;
  onToolChange?: (tool: string) => void;

  // Sidebar
  sidebarItems?: SidebarItem[];
  activeSidebarItem?: string;
  onSidebarItemClick?: (item: SidebarItem) => void;

  // Content
  children?: ReactNode;
  rightPanel?: ReactNode;
  className?: string;
}

// Default editor sidebar items
const defaultSidebarItems: SidebarItem[] = [
  { id: 'frames', label: 'Frames', icon: 'film' },
  { id: 'edit', label: 'Edit', icon: 'pencil-square' },
  { id: 'image', label: 'Image', icon: 'photo' },
  { id: 'transitions', label: 'Transitions', icon: 'adjustments-horizontal' },
  { id: 'text', label: 'Text', icon: 'type' },
  { id: 'drawings', label: 'Drawings', icon: 'paint-brush' },
  { id: 'effects', label: 'Effects', icon: 'cog' },
];

// Editor toolbar groups
function getToolbarGroups(
  isPlaying: boolean,
  onPlay?: () => void,
  onPause?: () => void,
  onPreviousFrame?: () => void,
  onNextFrame?: () => void,
  onFirstFrame?: () => void,
  onLastFrame?: () => void,
  onSave?: () => void,
  onExport?: () => void
): ToolbarGroup[] {
  return [
    {
      id: 'file',
      buttons: [
        { id: 'save', icon: 'download', label: 'Save Project', onClick: onSave },
        { id: 'export', icon: 'upload', label: 'Export', onClick: onExport },
      ],
    },
    {
      id: 'history',
      buttons: [
        { id: 'undo', icon: 'undo', label: 'Undo (Ctrl+Z)' },
        { id: 'redo', icon: 'redo', label: 'Redo (Ctrl+Y)' },
      ],
    },
    {
      id: 'playback',
      buttons: [
        { id: 'first', icon: 'skip-back', label: 'First Frame', onClick: onFirstFrame },
        { id: 'prev', icon: 'chevron-left', label: 'Previous Frame', onClick: onPreviousFrame },
        {
          id: 'play',
          icon: isPlaying ? 'pause' : 'play',
          label: isPlaying ? 'Pause' : 'Play',
          onClick: isPlaying ? onPause : onPlay,
          active: isPlaying,
        },
        { id: 'next', icon: 'chevron-right', label: 'Next Frame', onClick: onNextFrame },
        { id: 'last', icon: 'skip-forward', label: 'Last Frame', onClick: onLastFrame },
      ],
    },
    {
      id: 'selection',
      buttons: [
        { id: 'select-all', icon: 'check', label: 'Select All' },
        { id: 'deselect', icon: 'x-mark', label: 'Deselect' },
      ],
    },
  ];
}

export function EditorLayout({
  currentFrame = 1,
  totalFrames = 0,
  isPlaying = false,
  zoom = 100,
  width = 0,
  height = 0,
  duration = 0,
  onFrameChange,
  onPlay,
  onPause,
  onPreviousFrame,
  onNextFrame,
  onFirstFrame,
  onLastFrame,
  onZoomChange,
  onSave,
  onExport,
  activeTool: _activeTool,
  onToolChange: _onToolChange,
  sidebarItems = defaultSidebarItems,
  activeSidebarItem = 'frames',
  onSidebarItemClick,
  children,
  rightPanel,
  className = '',
}: EditorLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toolbarGroups = getToolbarGroups(
    isPlaying,
    onPlay,
    onPause,
    onPreviousFrame,
    onNextFrame,
    onFirstFrame,
    onLastFrame,
    onSave,
    onExport
  );

  // Format duration
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Status bar items
  const statusBarLeftItems: StatusItem[] = [
    {
      id: 'frame-info',
      content: `Frame ${currentFrame} / ${totalFrames}`,
      icon: 'film',
      tooltip: 'Current frame position',
    },
    {
      id: 'duration',
      content: formatDuration(duration),
      icon: 'clock',
      tooltip: 'Total duration',
    },
  ];

  const statusBarRightItems: StatusItem[] = [
    ...(width > 0 && height > 0
      ? [
          {
            id: 'dimensions',
            content: `${width} x ${height}`,
            icon: 'photo' as IconName,
            tooltip: 'Image dimensions',
          },
        ]
      : []),
    {
      id: 'zoom',
      content: `${zoom}%`,
      icon: 'zoom-in',
      tooltip: 'Zoom level',
      onClick: () => onZoomChange?.(100),
    },
  ];

  return (
    <div className={`flex flex-col h-screen bg-surface-900 ${className}`}>
      {/* Toolbar */}
      <Toolbar groups={toolbarGroups} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <Sidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={onSidebarItemClick}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Main editor area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Canvas area */}
          <main className="flex-1 overflow-auto bg-surface-950 relative">
            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-surface-800/90 backdrop-blur-sm rounded-lg p-2 border border-surface-700">
              <Tooltip content="Zoom Out" position="bottom">
                <button
                  onClick={() => onZoomChange?.(Math.max(25, zoom - 25))}
                  className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded transition-colors"
                >
                  <Icon name="zoom-out" size="sm" />
                </button>
              </Tooltip>
              <span className="text-xs font-mono text-surface-300 min-w-[40px] text-center">
                {zoom}%
              </span>
              <Tooltip content="Zoom In" position="bottom">
                <button
                  onClick={() => onZoomChange?.(Math.min(400, zoom + 25))}
                  className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded transition-colors"
                >
                  <Icon name="zoom-in" size="sm" />
                </button>
              </Tooltip>
              <Tooltip content="Fit to Window" position="bottom">
                <button
                  onClick={() => onZoomChange?.(100)}
                  className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded transition-colors"
                >
                  <Icon name="crop" size="sm" />
                </button>
              </Tooltip>
            </div>

            {/* Canvas content */}
            <div className="flex items-center justify-center min-h-full p-8">
              {children}
            </div>
          </main>

          {/* Timeline / Frame scrubber */}
          <div className="h-20 bg-surface-800 border-t border-surface-700 px-4 py-2">
            <div className="flex items-center gap-4 h-full">
              {/* Frame slider */}
              <div className="flex-1">
                <Slider
                  value={currentFrame}
                  min={1}
                  max={totalFrames || 1}
                  step={1}
                  onChange={(e) => onFrameChange?.(Number(e.target.value))}
                  showValue={false}
                  size="md"
                />
              </div>

              {/* Frame counter */}
              <div className="flex items-center gap-2 min-w-[120px]">
                <input
                  type="number"
                  value={currentFrame}
                  min={1}
                  max={totalFrames || 1}
                  onChange={(e) => onFrameChange?.(Number(e.target.value))}
                  className="
                    w-16 h-8 px-2
                    bg-surface-700 text-surface-100
                    border border-surface-600 rounded
                    text-sm font-mono text-center
                    focus:outline-none focus:border-primary-500
                  "
                />
                <span className="text-surface-400 text-sm">/ {totalFrames}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel (properties/options) */}
        {rightPanel && (
          <aside className="w-72 bg-surface-800 border-l border-surface-700 overflow-y-auto">
            {rightPanel}
          </aside>
        )}
      </div>

      {/* Status bar */}
      <StatusBar
        status="idle"
        statusMessage="Ready"
        leftItems={statusBarLeftItems}
        rightItems={statusBarRightItems}
      />
    </div>
  );
}
