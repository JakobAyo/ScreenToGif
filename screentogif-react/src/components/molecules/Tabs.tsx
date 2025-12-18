import { useState, useRef, type ReactNode, type KeyboardEvent } from 'react';

export type TabsVariant = 'line' | 'pills' | 'enclosed';
export type TabsSize = 'sm' | 'md' | 'lg';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  content?: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

const sizeStyles: Record<TabsSize, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

const variantStyles: Record<TabsVariant, { container: string; tab: string; active: string }> = {
  line: {
    container: 'border-b border-surface-700',
    tab: 'border-b-2 border-transparent -mb-px hover:text-surface-100 hover:border-surface-500',
    active: 'border-primary-500 text-surface-100',
  },
  pills: {
    container: 'gap-1',
    tab: 'rounded-lg hover:bg-surface-700',
    active: 'bg-primary-600 text-white hover:bg-primary-600',
  },
  enclosed: {
    container: 'border-b border-surface-700',
    tab: 'border border-transparent rounded-t-lg -mb-px hover:bg-surface-800',
    active: 'border-surface-700 border-b-surface-900 bg-surface-900 text-surface-100',
  },
};

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
}: TabsProps) {
  const [, setFocusedIndex] = useState(-1);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabClick = (tab: Tab) => {
    if (tab.disabled) return;
    onChange?.(tab.id);
  };

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const enabledTabs = tabs
      .map((tab, i) => ({ tab, index: i }))
      .filter(({ tab }) => !tab.disabled);

    const currentEnabledIndex = enabledTabs.findIndex(({ index: i }) => i === index);

    let newIndex: number | undefined;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (currentEnabledIndex > 0) {
          newIndex = enabledTabs[currentEnabledIndex - 1].index;
        } else {
          newIndex = enabledTabs[enabledTabs.length - 1].index;
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentEnabledIndex < enabledTabs.length - 1) {
          newIndex = enabledTabs[currentEnabledIndex + 1].index;
        } else {
          newIndex = enabledTabs[0].index;
        }
        break;
      case 'Home':
        e.preventDefault();
        newIndex = enabledTabs[0].index;
        break;
      case 'End':
        e.preventDefault();
        newIndex = enabledTabs[enabledTabs.length - 1].index;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClick(tabs[index]);
        return;
    }

    if (newIndex !== undefined) {
      setFocusedIndex(newIndex);
      tabRefs.current[newIndex]?.focus();
    }
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role="tablist"
        className={`
          flex
          ${variantStyles[variant].container}
          ${fullWidth ? 'w-full' : 'w-fit'}
        `}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={tab.id === activeTab ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => handleTabClick(tab)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              ${sizeStyles[size]}
              ${variantStyles[variant].tab}
              ${tab.id === activeTab ? variantStyles[variant].active : 'text-surface-400'}
              ${fullWidth ? 'flex-1' : ''}
              flex items-center justify-center gap-2
              font-medium
              transition-all duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {(activeContent || children) && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={activeTab}
          className="mt-4"
        >
          {activeContent || children}
        </div>
      )}
    </div>
  );
}

// TabPanel component for more flexible usage
export interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, activeTab, children, className = '' }: TabPanelProps) {
  if (id !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={id}
      className={className}
    >
      {children}
    </div>
  );
}
