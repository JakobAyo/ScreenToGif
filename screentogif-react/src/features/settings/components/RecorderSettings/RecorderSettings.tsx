/**
 * RecorderSettings Component
 * Container for recording-related settings
 */

import { CaptureSettings } from './CaptureSettings';
import { FrameRateSettings } from './FrameRateSettings';

export interface RecorderSettingsProps {
  className?: string;
}

export function RecorderSettings({ className = '' }: RecorderSettingsProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Frame Rate Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Frame Rate</h3>
        <FrameRateSettings />
      </section>

      {/* Capture Settings Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Capture Settings</h3>
        <CaptureSettings />
      </section>
    </div>
  );
}

RecorderSettings.displayName = 'RecorderSettings';
