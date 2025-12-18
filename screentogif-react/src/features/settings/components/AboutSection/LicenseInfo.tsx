/**
 * LicenseInfo Component
 * Displays license and attribution information
 */

import { Icon } from '../../../../components/atoms/Icon';
import { Button } from '../../../../components/atoms/Button';

export interface LicenseInfoProps {
  className?: string;
}

const THIRD_PARTY_LICENSES = [
  { name: 'React', version: '19.x', license: 'MIT' },
  { name: 'Tauri', version: '2.x', license: 'MIT/Apache-2.0' },
  { name: 'Zustand', version: '5.x', license: 'MIT' },
  { name: 'TailwindCSS', version: '4.x', license: 'MIT' },
  { name: 'FFmpeg', version: '6.x', license: 'LGPL/GPL' },
];

export function LicenseInfo({ className = '' }: LicenseInfoProps) {
  const handleOpenLicense = () => {
    // In real implementation, open the LICENSE file or URL
    window.open('https://github.com/NickeManarin/ScreenToGif/blob/master/LICENSE.txt', '_blank');
  };

  const handleOpenSourceCode = () => {
    window.open('https://github.com/NickeManarin/ScreenToGif', '_blank');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main License */}
      <div className="p-4 bg-surface-800 rounded-lg border border-surface-700">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-surface-700 rounded-lg">
            <Icon name="document" size="md" className="text-primary-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-surface-200">Microsoft Public License (Ms-PL)</h4>
            <p className="text-xs text-surface-500 mt-1">
              ScreenToGif is free and open source software
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleOpenLicense}>
            <Icon name="document" size="sm" className="mr-2" />
            View License
          </Button>
          <Button variant="secondary" size="sm" onClick={handleOpenSourceCode}>
            <Icon name="code" size="sm" className="mr-2" />
            Source Code
          </Button>
        </div>
      </div>

      {/* Third-Party Licenses */}
      <div>
        <h4 className="text-sm font-medium text-surface-300 mb-3">Third-Party Libraries</h4>
        <div className="space-y-2">
          {THIRD_PARTY_LICENSES.map((lib) => (
            <div
              key={lib.name}
              className="flex items-center justify-between p-3 bg-surface-800 rounded-lg border border-surface-700"
            >
              <div className="flex items-center gap-3">
                <Icon name="cube" size="sm" className="text-surface-400" />
                <div>
                  <span className="text-sm text-surface-200">{lib.name}</span>
                  <span className="text-xs text-surface-500 ml-2">v{lib.version}</span>
                </div>
              </div>
              <span className="text-xs text-surface-400 bg-surface-700 px-2 py-1 rounded">
                {lib.license}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Credits */}
      <div className="p-4 bg-surface-800 rounded-lg border border-surface-700">
        <h4 className="text-sm font-medium text-surface-300 mb-3">Credits</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Icon name="user" size="sm" className="text-surface-400" />
            <div>
              <p className="text-sm text-surface-200">Nicke Manarin</p>
              <p className="text-xs text-surface-500">Original Author</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="users" size="sm" className="text-surface-400" />
            <div>
              <p className="text-sm text-surface-200">Contributors</p>
              <p className="text-xs text-surface-500">
                Thanks to all the amazing contributors on GitHub
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="globe" size="sm" className="text-surface-400" />
            <div>
              <p className="text-sm text-surface-200">Translators</p>
              <p className="text-xs text-surface-500">
                Community translators for localization support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-surface-500 leading-relaxed">
        This software is provided "as is" without warranty of any kind. The authors are not
        responsible for any damages caused by the use of this software.
      </p>
    </div>
  );
}

LicenseInfo.displayName = 'LicenseInfo';
