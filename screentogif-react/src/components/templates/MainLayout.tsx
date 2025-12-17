import { type ReactNode } from 'react';
import { Sidebar, type SidebarItem } from '../organisms/Sidebar';
import { Toolbar, type ToolbarGroup, type ToolbarButton } from '../organisms/Toolbar';
import { StatusBar, type StatusType, type StatusItem } from '../organisms/StatusBar';

export interface MainLayoutProps {
  // Sidebar
  sidebarItems?: SidebarItem[];
  activeSidebarItem?: string;
  onSidebarItemClick?: (item: SidebarItem) => void;
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  sidebarHeader?: ReactNode;
  sidebarFooter?: ReactNode;
  hideSidebar?: boolean;

  // Toolbar
  toolbarGroups?: ToolbarGroup[];
  toolbarButtons?: ToolbarButton[];
  toolbarLeftContent?: ReactNode;
  toolbarRightContent?: ReactNode;
  hideToolbar?: boolean;

  // Status bar
  status?: StatusType;
  statusMessage?: string;
  statusBarLeftItems?: StatusItem[];
  statusBarRightItems?: StatusItem[];
  hideStatusBar?: boolean;

  // Main content
  children: ReactNode;

  // Additional
  className?: string;
}

export function MainLayout({
  // Sidebar props
  sidebarItems = [],
  activeSidebarItem,
  onSidebarItemClick,
  sidebarCollapsed = false,
  onSidebarCollapsedChange,
  sidebarHeader,
  sidebarFooter,
  hideSidebar = false,

  // Toolbar props
  toolbarGroups,
  toolbarButtons,
  toolbarLeftContent,
  toolbarRightContent,
  hideToolbar = false,

  // Status bar props
  status = 'idle',
  statusMessage,
  statusBarLeftItems = [],
  statusBarRightItems = [],
  hideStatusBar = false,

  // Main content
  children,

  // Additional
  className = '',
}: MainLayoutProps) {
  return (
    <div className={`flex flex-col h-screen bg-surface-900 ${className}`}>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!hideSidebar && sidebarItems.length > 0 && (
          <Sidebar
            items={sidebarItems}
            activeItem={activeSidebarItem}
            onItemClick={onSidebarItemClick}
            collapsed={sidebarCollapsed}
            onCollapsedChange={onSidebarCollapsedChange}
            header={sidebarHeader}
            footer={sidebarFooter}
          />
        )}

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Toolbar */}
          {!hideToolbar && (toolbarGroups || toolbarButtons) && (
            <Toolbar
              groups={toolbarGroups}
              buttons={toolbarButtons}
              leftContent={toolbarLeftContent}
              rightContent={toolbarRightContent}
            />
          )}

          {/* Main content */}
          <main className="flex-1 overflow-auto bg-surface-950">
            {children}
          </main>
        </div>
      </div>

      {/* Status bar */}
      {!hideStatusBar && (
        <StatusBar
          status={status}
          statusMessage={statusMessage}
          leftItems={statusBarLeftItems}
          rightItems={statusBarRightItems}
        />
      )}
    </div>
  );
}
