/**
 * RegionOverlay Component
 * Renders dimmed overlay outside the selected region
 */

import type { CaptureRegion } from '../../../../api/types';

export interface RegionOverlayProps {
  region: CaptureRegion | null;
  containerWidth: number;
  containerHeight: number;
  opacity?: number;
}

export function RegionOverlay({
  region,
  containerWidth,
  containerHeight,
  opacity = 0.5,
}: RegionOverlayProps) {
  if (!region || containerWidth === 0 || containerHeight === 0) {
    return (
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity }}
      />
    );
  }

  const { x, y, width, height } = region;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <mask id="region-mask">
          {/* White reveals, black hides */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={width} height={height} fill="black" />
        </mask>
      </defs>

      {/* Overlay with cutout */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="black"
        fillOpacity={opacity}
        mask="url(#region-mask)"
      />
    </svg>
  );
}

RegionOverlay.displayName = 'RegionOverlay';
