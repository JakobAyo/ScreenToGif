/**
 * MainNavigation Component
 * Main navigation sidebar with links to all modules
 */

import { useUIStore, type AppView } from '../../stores/uiStore';
import { Icon, type IconName } from '../atoms/Icon';

export interface MainNavigationProps {
  className?: string;
}

interface NavItem {
  id: AppView;
  label: string;
  icon: IconName;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'recorder',
    label: 'Recorder',
    icon: 'record',
    description: 'Screen capture',
  },
  {
    id: 'webcam',
    label: 'Webcam',
    icon: 'eye',
    description: 'Webcam recording',
  },
  {
    id: 'board',
    label: 'Board',
    icon: 'pencil',
    description: 'Sketch board',
  },
  {
    id: 'editor',
    label: 'Editor',
    icon: 'film',
    description: 'Edit frames',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'cog',
    description: 'Preferences',
  },
];

export function MainNavigation({ className = '' }: MainNavigationProps) {
  const currentView = useUIStore((state) => state.currentView);
  const setCurrentView = useUIStore((state) => state.setCurrentView);

  return (
    <nav className={`flex flex-col bg-surface-800 ${className}`}>
      {/* Logo */}
      <div className="p-4 border-b border-surface-700">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <Icon name="gif" size="lg" className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-100">ScreenToGif</h1>
            <p className="text-xs text-surface-500">v3.0</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-3
              rounded-lg transition-colors text-left
              ${
                currentView === item.id
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-surface-300 hover:bg-surface-700 hover:text-surface-100'
              }
            `}
          >
            <Icon
              name={item.icon}
              size="md"
              className={currentView === item.id ? 'text-primary-400' : 'text-surface-400'}
            />
            <div>
              <span className="text-sm font-medium block">{item.label}</span>
              <span className="text-xs text-surface-500">{item.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Help & Version */}
      <div className="p-4 border-t border-surface-700">
        <button
          onClick={() => setCurrentView('startup')}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded-lg transition-colors"
        >
          <Icon name="home" size="sm" />
          <span>Home</span>
        </button>
      </div>
    </nav>
  );
}

MainNavigation.displayName = 'MainNavigation';
