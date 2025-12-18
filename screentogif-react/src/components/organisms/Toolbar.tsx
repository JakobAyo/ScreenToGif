import { type ReactNode } from 'react';
import { type ButtonSize, type ButtonVariant } from '../atoms/Button';
import { Icon, type IconName } from '../atoms/Icon';
import { Tooltip } from '../molecules/Tooltip';

export interface ToolbarButton {
  id: string;
  icon: IconName;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: ButtonVariant;
}

export interface ToolbarGroup {
  id: string;
  buttons: ToolbarButton[];
}

export interface ToolbarProps {
  groups?: ToolbarGroup[];
  buttons?: ToolbarButton[];
  size?: ButtonSize;
  showLabels?: boolean;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
}

// Individual toolbar button component
interface ToolbarButtonProps {
  button: ToolbarButton;
  size: ButtonSize;
  showLabel: boolean;
}

function ToolbarButtonComponent({ button, size, showLabel }: ToolbarButtonProps) {
  const buttonElement = (
    <button
      onClick={button.onClick}
      disabled={button.disabled}
      className={`
        flex items-center justify-center gap-1.5
        ${size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-3' : 'p-2'}
        rounded-lg
        transition-colors duration-150
        ${button.active
          ? 'bg-primary-600/20 text-primary-400'
          : 'text-surface-400 hover:text-surface-100 hover:bg-surface-700'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      aria-label={button.label}
      aria-pressed={button.active}
    >
      <Icon
        name={button.icon}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      />
      {showLabel && (
        <span className={`text-${size === 'sm' ? 'xs' : size === 'lg' ? 'base' : 'sm'}`}>
          {button.label}
        </span>
      )}
    </button>
  );

  if (!showLabel) {
    return (
      <Tooltip content={button.label} position="bottom">
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
}

// Toolbar divider
function ToolbarDivider() {
  return <div className="w-px h-6 bg-surface-700 mx-1" />;
}

export function Toolbar({
  groups,
  buttons,
  size = 'md',
  showLabels = false,
  leftContent,
  rightContent,
  className = '',
}: ToolbarProps) {
  // Render buttons from either groups or flat buttons array
  const renderButtons = () => {
    if (groups) {
      return groups.map((group, groupIndex) => (
        <div key={group.id} className="flex items-center gap-0.5">
          {group.buttons.map((button) => (
            <ToolbarButtonComponent
              key={button.id}
              button={button}
              size={size}
              showLabel={showLabels}
            />
          ))}
          {groupIndex < groups.length - 1 && <ToolbarDivider />}
        </div>
      ));
    }

    if (buttons) {
      return buttons.map((button) => (
        <ToolbarButtonComponent
          key={button.id}
          button={button}
          size={size}
          showLabel={showLabels}
        />
      ));
    }

    return null;
  };

  return (
    <div
      role="toolbar"
      className={`
        flex items-center gap-2
        ${size === 'sm' ? 'h-10' : size === 'lg' ? 'h-14' : 'h-12'}
        px-2
        bg-surface-800
        border-b border-surface-700
        ${className}
      `}
    >
      {/* Left content */}
      {leftContent && (
        <>
          <div className="flex items-center">{leftContent}</div>
          <ToolbarDivider />
        </>
      )}

      {/* Main toolbar buttons */}
      <div className="flex items-center gap-0.5 flex-1">
        {renderButtons()}
      </div>

      {/* Right content */}
      {rightContent && (
        <>
          <ToolbarDivider />
          <div className="flex items-center">{rightContent}</div>
        </>
      )}
    </div>
  );
}

// Vertical toolbar variant
export interface VerticalToolbarProps {
  buttons: ToolbarButton[];
  size?: ButtonSize;
  className?: string;
}

export function VerticalToolbar({
  buttons,
  size = 'md',
  className = '',
}: VerticalToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-orientation="vertical"
      className={`
        flex flex-col items-center gap-1
        ${size === 'sm' ? 'w-10' : size === 'lg' ? 'w-14' : 'w-12'}
        py-2
        bg-surface-800
        border-r border-surface-700
        ${className}
      `}
    >
      {buttons.map((button) => (
        <ToolbarButtonComponent
          key={button.id}
          button={button}
          size={size}
          showLabel={false}
        />
      ))}
    </div>
  );
}

// Floating toolbar for contextual actions
export interface FloatingToolbarProps {
  buttons: ToolbarButton[];
  size?: ButtonSize;
  visible?: boolean;
  position?: { top?: number; left?: number; right?: number; bottom?: number };
  className?: string;
}

export function FloatingToolbar({
  buttons,
  size = 'sm',
  visible = true,
  position = {},
  className = '',
}: FloatingToolbarProps) {
  if (!visible) return null;

  return (
    <div
      role="toolbar"
      className={`
        fixed z-40
        flex items-center gap-0.5
        p-1.5
        bg-surface-800 rounded-lg
        border border-surface-700
        shadow-lg
        animate-scale-in
        ${className}
      `}
      style={position}
    >
      {buttons.map((button) => (
        <ToolbarButtonComponent
          key={button.id}
          button={button}
          size={size}
          showLabel={false}
        />
      ))}
    </div>
  );
}
