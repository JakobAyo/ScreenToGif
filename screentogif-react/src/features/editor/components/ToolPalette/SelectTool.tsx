/**
 * SelectTool Component
 * Tool for selecting and manipulating frames/overlays
 */

import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';

export interface SelectToolProps {
  /** Whether this tool is currently active */
  isActive: boolean;
  /** Click handler */
  onClick: () => void;
  /** Additional class names */
  className?: string;
}

export function SelectTool({ isActive, onClick, className = '' }: SelectToolProps) {
  return (
    <Tooltip content="Select tool (V)" position="right">
      <button
        onClick={onClick}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-lg
          transition-colors duration-150
          ${isActive
            ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
            : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
          }
          ${className}
        `}
        aria-label="Select tool"
        aria-pressed={isActive}
      >
        <Icon name="cursor-arrow-rays" size="md" />
      </button>
    </Tooltip>
  );
}
