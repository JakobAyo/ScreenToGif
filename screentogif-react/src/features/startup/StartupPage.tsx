/**
 * StartupPage Component
 * Landing page with quick access to all modules
 */

import { useUIStore, type AppView } from '../../stores/uiStore';
import { useProjectStore } from '../../stores/projectStore';
import { Icon, type IconName } from '../../components/atoms/Icon';
import { Button } from '../../components/atoms/Button';

export interface StartupPageProps {
  className?: string;
}

interface QuickAction {
  id: AppView;
  label: string;
  description: string;
  icon: IconName;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'recorder',
    label: 'Screen Recorder',
    description: 'Record your screen, window, or a specific region',
    icon: 'record',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'webcam',
    label: 'Webcam',
    description: 'Record from your webcam',
    icon: 'eye',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'board',
    label: 'Sketch Board',
    description: 'Draw and annotate on a blank canvas',
    icon: 'pencil',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'editor',
    label: 'Editor',
    description: 'Edit and enhance your recordings',
    icon: 'film',
    color: 'from-purple-500 to-purple-600',
  },
];

export function StartupPage({ className = '' }: StartupPageProps) {
  const setCurrentView = useUIStore((state) => state.setCurrentView);
  const recentProjects = useProjectStore((state) => state.recentProjects);

  return (
    <div className={`flex-1 flex flex-col bg-surface-900 ${className}`}>
      {/* Header */}
      <header className="px-8 py-6 border-b border-surface-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
              <Icon name="gif" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-100">ScreenToGif</h1>
              <p className="text-surface-400">Screen, webcam and sketchboard recorder</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentView('settings')}
          >
            <Icon name="cog" size="sm" className="mr-2" />
            Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-surface-200 mb-4">Start Recording</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setCurrentView(action.id)}
                  className="group relative p-6 bg-surface-800 border border-surface-700 rounded-xl hover:border-surface-600 transition-all text-left overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                  />
                  <div className="relative flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${action.color}`}
                    >
                      <Icon name={action.icon} size="lg" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-100 group-hover:text-white transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-sm text-surface-400 mt-1">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Recent Projects */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-200">Recent Projects</h2>
              <Button variant="ghost" size="sm">
                <Icon name="folder" size="sm" className="mr-2" />
                Open Project
              </Button>
            </div>

            {recentProjects && recentProjects.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {recentProjects.slice(0, 6).map((project, index) => (
                  <button
                    key={index}
                    className="p-4 bg-surface-800 border border-surface-700 rounded-lg hover:border-surface-600 transition-all text-left"
                  >
                    <div className="aspect-video bg-surface-700 rounded mb-3 flex items-center justify-center">
                      <Icon name="photo" size="lg" className="text-surface-500" />
                    </div>
                    <h4 className="text-sm font-medium text-surface-200 truncate">
                      {project.name || `Project ${index + 1}`}
                    </h4>
                    <p className="text-xs text-surface-500 mt-1">
                      {project.frameCount || 0} frames
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-surface-800 border border-surface-700 rounded-xl text-center">
                <Icon name="folder" size="xl" className="text-surface-500 mx-auto mb-3" />
                <h3 className="text-surface-300 font-medium mb-1">No recent projects</h3>
                <p className="text-sm text-surface-500">
                  Start a new recording or open an existing project
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-surface-800">
        <div className="flex items-center justify-between text-xs text-surface-500">
          <span>Free and open source</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/NickeManarin/ScreenToGif"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-surface-300 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.screentogif.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-surface-300 transition-colors"
            >
              Website
            </a>
            <button
              onClick={() => setCurrentView('settings')}
              className="hover:text-surface-300 transition-colors"
            >
              About
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

StartupPage.displayName = 'StartupPage';
