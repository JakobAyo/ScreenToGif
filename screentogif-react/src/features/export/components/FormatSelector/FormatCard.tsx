import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../../../components/atoms/Icon';

export interface FormatCardProps {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  badge?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function FormatCard({
  name,
  description,
  icon,
  badge,
  selected = false,
  disabled = false,
  onClick,
}: FormatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center p-4 rounded-lg
        border-2 transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
        ${selected
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-surface-600 bg-surface-800 hover:border-surface-500 hover:bg-surface-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {badge && (
        <span className="absolute top-2 right-2">
          {badge}
        </span>
      )}

      <div
        className={`
          w-12 h-12 rounded-full flex items-center justify-center mb-3
          ${selected ? 'bg-primary-500/20 text-primary-400' : 'bg-surface-700 text-surface-300'}
        `}
      >
        <Icon name={icon} size="lg" />
      </div>

      <h3
        className={`
          text-sm font-medium mb-1
          ${selected ? 'text-primary-400' : 'text-surface-100'}
        `}
      >
        {name}
      </h3>

      <p className="text-xs text-surface-400 text-center line-clamp-2">
        {description}
      </p>

      {selected && (
        <div className="absolute top-2 left-2">
          <Icon name="check-circle" size="sm" className="text-primary-500" />
        </div>
      )}
    </button>
  );
}
