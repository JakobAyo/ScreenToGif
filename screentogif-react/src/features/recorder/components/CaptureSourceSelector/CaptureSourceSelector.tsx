/**
 * CaptureSourceSelector Component
 * Choose screen/window to capture with thumbnails
 */

import { useState } from 'react';
import type { DisplayInfo, WindowInfo, CaptureMode } from '../../../../api/types';
import { Icon } from '../../../../components/atoms/Icon';
import { Button } from '../../../../components/atoms/Button';
import { ScreenOption } from './ScreenOption';
import { WindowOption } from './WindowOption';

export interface CaptureSourceSelectorProps {
  mode: CaptureMode;
  displays: DisplayInfo[];
  windows: WindowInfo[];
  selectedDisplayId: string | null;
  selectedWindowId: string | null;
  onModeChange: (mode: CaptureMode) => void;
  onDisplaySelect: (displayId: string) => void;
  onWindowSelect: (windowId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

type TabMode = 'region' | 'screen' | 'window';

export function CaptureSourceSelector({
  mode,
  displays,
  windows,
  selectedDisplayId,
  selectedWindowId,
  onModeChange,
  onDisplaySelect,
  onWindowSelect,
  onRefresh,
  isLoading = false,
  className = '',
}: CaptureSourceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Map capture mode to tab mode
  const tabMode: TabMode =
    mode === 'screen' ? 'screen' : mode === 'window' ? 'window' : 'region';

  const filteredWindows = windows.filter(
    (w) =>
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.processName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleWindows = filteredWindows.filter((w) => w.isVisible);

  return (
    <div className={`flex flex-col bg-surface-800 rounded-lg border border-surface-700 ${className}`}>
      {/* Tab header */}
      <div className="flex items-center border-b border-surface-700">
        <button
          onClick={() => onModeChange('region')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            flex items-center justify-center gap-2
            ${
              tabMode === 'region'
                ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/5'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
            }
          `}
        >
          <Icon name="crop" size="sm" />
          Region
        </button>
        <button
          onClick={() => onModeChange('screen')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            flex items-center justify-center gap-2
            ${
              tabMode === 'screen'
                ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/5'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
            }
          `}
        >
          <Icon name="photo" size="sm" />
          Screen
        </button>
        <button
          onClick={() => onModeChange('window')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            flex items-center justify-center gap-2
            ${
              tabMode === 'window'
                ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/5'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
            }
          `}
        >
          <Icon name="document" size="sm" />
          Window
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Region mode */}
        {tabMode === 'region' && (
          <div className="text-center py-8">
            <Icon name="crop" size="xl" className="mx-auto text-surface-400 mb-3" />
            <p className="text-sm text-surface-300 mb-2">
              Select a region on your screen to record
            </p>
            <p className="text-xs text-surface-500">
              Click and drag on the preview area to define your capture region
            </p>
          </div>
        )}

        {/* Screen mode */}
        {tabMode === 'screen' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-surface-300">
                {displays.length} display{displays.length !== 1 ? 's' : ''} available
              </span>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  isLoading={isLoading}
                  leftIcon={<Icon name="arrow-right" className="rotate-[135deg]" />}
                >
                  Refresh
                </Button>
              )}
            </div>

            {displays.length === 0 ? (
              <div className="text-center py-6 text-surface-400">
                <Icon name="photo" size="lg" className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No displays found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {displays.map((display) => (
                  <ScreenOption
                    key={display.id}
                    display={display}
                    isSelected={selectedDisplayId === display.id}
                    onClick={() => onDisplaySelect(display.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Window mode */}
        {tabMode === 'window' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search windows..."
                  className="
                    w-full h-9 px-3 pl-9
                    bg-surface-700 text-surface-100
                    placeholder:text-surface-500
                    border border-surface-600 rounded-lg
                    text-sm
                    focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                  "
                />
                <Icon
                  name="eye"
                  size="sm"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                />
              </div>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  isLoading={isLoading}
                  leftIcon={<Icon name="arrow-right" className="rotate-[135deg]" />}
                >
                  Refresh
                </Button>
              )}
            </div>

            <div className="text-xs text-surface-400 mb-2">
              {visibleWindows.length} visible window{visibleWindows.length !== 1 ? 's' : ''}
            </div>

            {visibleWindows.length === 0 ? (
              <div className="text-center py-6 text-surface-400">
                <Icon name="document" size="lg" className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'No windows match your search' : 'No windows found'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {visibleWindows.map((window) => (
                  <WindowOption
                    key={window.id}
                    window={window}
                    isSelected={selectedWindowId === window.id}
                    onClick={() => onWindowSelect(window.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

CaptureSourceSelector.displayName = 'CaptureSourceSelector';
