/**
 * SettingsPage Component
 * Main settings page with tabbed navigation
 */

import { useState, useMemo } from 'react';
import { useUIStore, type AppView } from '../../../stores/uiStore';
import { Icon, type IconName } from '../../../components/atoms/Icon';
import { Button } from '../../../components/atoms/Button';
import { GeneralSettings } from '../components/GeneralSettings';
import { RecorderSettings } from '../components/RecorderSettings';
import { EditorSettings } from '../components/EditorSettings';
import { HotkeySettings } from '../components/HotkeySettings';
import { StorageSettings } from '../components/StorageSettings';
import { AboutSection } from '../components/AboutSection';

export interface SettingsPageProps {
  initialTab?: string;
  onClose?: () => void;
  className?: string;
}

interface SettingsTab {
  id: string;
  label: string;
  icon: IconName;
  component: React.ComponentType;
}

const SETTINGS_TABS: SettingsTab[] = [
  { id: 'general', label: 'General', icon: 'cog', component: GeneralSettings },
  { id: 'recorder', label: 'Recorder', icon: 'record', component: RecorderSettings },
  { id: 'editor', label: 'Editor', icon: 'pencil', component: EditorSettings },
  { id: 'hotkeys', label: 'Shortcuts', icon: 'keyboard', component: HotkeySettings },
  { id: 'storage', label: 'Storage', icon: 'folder', component: StorageSettings },
  { id: 'about', label: 'About', icon: 'info-circle', component: AboutSection },
];

export function SettingsPage({
  initialTab = 'general',
  onClose,
  className = '',
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const setCurrentView = useUIStore((state) => state.setCurrentView);
  const navigateBack = useUIStore((state) => state.navigateBack);
  const previousView = useUIStore((state) => state.previousView);

  const activeTabData = useMemo(
    () => SETTINGS_TABS.find((tab) => tab.id === activeTab) ?? SETTINGS_TABS[0],
    [activeTab]
  );

  const ActiveComponent = activeTabData.component;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (previousView) {
      navigateBack();
    } else {
      setCurrentView('startup');
    }
  };

  return (
    <div className={`flex h-screen bg-surface-900 ${className}`}>
      {/* Sidebar Navigation */}
      <aside className="w-56 flex flex-col bg-surface-800 border-r border-surface-700">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
          <h1 className="text-lg font-semibold text-surface-100">Settings</h1>
          <button
            onClick={handleClose}
            className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded transition-colors"
            title="Close settings"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        {/* Tab List */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {SETTINGS_TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5
                    rounded-lg transition-colors text-left
                    ${
                      activeTab === tab.id
                        ? 'bg-primary-500/15 text-primary-400'
                        : 'text-surface-300 hover:bg-surface-700 hover:text-surface-100'
                    }
                  `}
                >
                  <Icon
                    name={tab.icon}
                    size="sm"
                    className={activeTab === tab.id ? 'text-primary-400' : 'text-surface-400'}
                  />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-700">
          <Button variant="secondary" size="sm" onClick={handleClose} className="w-full">
            <Icon name="arrow-left" size="sm" className="mr-2" />
            Back
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-surface-700">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Icon name={activeTabData.icon} size="md" className="text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-surface-100">{activeTabData.label}</h2>
            <p className="text-sm text-surface-500">
              {getTabDescription(activeTabData.id)}
            </p>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl p-6">
            <ActiveComponent />
          </div>
        </div>
      </main>
    </div>
  );
}

function getTabDescription(tabId: string): string {
  switch (tabId) {
    case 'general':
      return 'Appearance, language, and startup behavior';
    case 'recorder':
      return 'Screen capture and recording defaults';
    case 'editor':
      return 'Timeline, preview, and editing tools';
    case 'hotkeys':
      return 'Keyboard shortcuts and key bindings';
    case 'storage':
      return 'Cache, temporary files, and memory';
    case 'about':
      return 'Version info, license, and credits';
    default:
      return '';
  }
}

SettingsPage.displayName = 'SettingsPage';
