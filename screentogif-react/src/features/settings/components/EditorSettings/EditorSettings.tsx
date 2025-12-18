/**
 * EditorSettings Component
 * Container for editor-related settings
 */

import { GridSettings } from './GridSettings';
import { DefaultToolSettings } from './DefaultToolSettings';

export interface EditorSettingsProps {
  className?: string;
}

export function EditorSettings({ className = '' }: EditorSettingsProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Timeline & Preview Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Timeline & Preview</h3>
        <DefaultToolSettings />
      </section>

      {/* Grid Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Grid & Alignment</h3>
        <GridSettings />
      </section>
    </div>
  );
}

EditorSettings.displayName = 'EditorSettings';
