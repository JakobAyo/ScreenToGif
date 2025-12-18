import { useState, createContext, useContext, type ReactNode } from 'react';
import { Icon, type IconName } from '../atoms/Icon';
import { Tooltip } from '../molecules/Tooltip';

export interface SidebarItem {
  id: string;
  label: string;
  icon: IconName;
  badge?: string | number;
  disabled?: boolean;
  items?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

// Context for sidebar state
interface SidebarContextValue {
  collapsed: boolean;
  activeItem: string | undefined;
}

const SidebarContext = createContext<SidebarContextValue>({ collapsed: false, activeItem: undefined });

// SidebarItem component
interface SidebarItemProps {
  item: SidebarItem;
  onClick?: (item: SidebarItem) => void;
  depth?: number;
}

function SidebarItemComponent({ item, onClick, depth = 0 }: SidebarItemProps) {
  const { collapsed, activeItem } = useContext(SidebarContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.items && item.items.length > 0;
  const isActive = activeItem === item.id;

  const handleClick = () => {
    if (item.disabled) return;

    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onClick?.(item);
    }
  };

  const button = (
    <button
      onClick={handleClick}
      disabled={item.disabled}
      className={`
        w-full flex items-center gap-3
        ${collapsed ? 'justify-center px-3' : 'px-4'}
        py-2.5
        text-sm font-medium
        rounded-lg
        transition-colors duration-150
        ${isActive
          ? 'bg-primary-600/20 text-primary-400'
          : 'text-surface-400 hover:text-surface-100 hover:bg-surface-700'
        }
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${depth > 0 ? 'ml-4' : ''}
      `}
    >
      <Icon name={item.icon} size="md" className="flex-shrink-0" />

      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{item.label}</span>

          {item.badge !== undefined && (
            <span className="
              px-1.5 py-0.5
              text-2xs font-medium
              bg-primary-600 text-white
              rounded-full
            ">
              {item.badge}
            </span>
          )}

          {hasChildren && (
            <Icon
              name="chevron-right"
              size="sm"
              className={`flex-shrink-0 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          )}
        </>
      )}
    </button>
  );

  return (
    <div>
      {collapsed && !item.disabled ? (
        <Tooltip content={item.label} position="right">
          {button}
        </Tooltip>
      ) : (
        button
      )}

      {/* Nested items */}
      {hasChildren && isExpanded && !collapsed && (
        <div className="mt-1 space-y-1">
          {item.items!.map((child) => (
            <SidebarItemComponent
              key={child.id}
              item={child}
              onClick={onClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  items,
  activeItem,
  onItemClick,
  collapsed = false,
  onCollapsedChange,
  header,
  footer,
  className = '',
}: SidebarProps) {
  return (
    <SidebarContext.Provider value={{ collapsed, activeItem }}>
      <aside
        className={`
          flex flex-col
          ${collapsed ? 'w-14' : 'w-64'}
          h-full
          bg-surface-900
          border-r border-surface-800
          transition-all duration-200
          ${className}
        `}
      >
        {/* Header */}
        {header && (
          <div className={`
            flex items-center
            ${collapsed ? 'justify-center px-2' : 'px-4'}
            py-4
            border-b border-surface-800
          `}>
            {header}
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {items.map((item) => (
            <SidebarItemComponent
              key={item.id}
              item={item}
              onClick={onItemClick}
            />
          ))}
        </nav>

        {/* Collapse toggle */}
        {onCollapsedChange && (
          <div className="px-2 py-2 border-t border-surface-800">
            <button
              onClick={() => onCollapsedChange(!collapsed)}
              className="
                w-full flex items-center justify-center
                py-2
                text-surface-500 hover:text-surface-300
                hover:bg-surface-800
                rounded-lg
                transition-colors duration-150
              "
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon
                name={collapsed ? 'chevron-right' : 'chevron-left'}
                size="md"
              />
            </button>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className={`
            ${collapsed ? 'px-2' : 'px-4'}
            py-4
            border-t border-surface-800
          `}>
            {footer}
          </div>
        )}
      </aside>
    </SidebarContext.Provider>
  );
}

// Simple divider for grouping sidebar items
export function SidebarDivider() {
  return <hr className="my-2 border-surface-800" />;
}

// Section header for grouping
export interface SidebarSectionProps {
  title: string;
  collapsed?: boolean;
}

export function SidebarSection({ title, collapsed }: SidebarSectionProps) {
  if (collapsed) return null;

  return (
    <div className="px-4 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
      {title}
    </div>
  );
}
