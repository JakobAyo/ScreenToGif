/**
 * HotkeyConflictWarning Component
 * Warning display for conflicting hotkey bindings
 */

import { Icon } from '../../../../components/atoms/Icon';
import type { HotkeyBinding } from '../../../../stores/settingsStore';
import { HotkeyService } from '../../../../services/HotkeyService';

export interface HotkeyConflictWarningProps {
  conflictingBindings: HotkeyBinding[];
  className?: string;
}

export function HotkeyConflictWarning({
  conflictingBindings,
  className = '',
}: HotkeyConflictWarningProps) {
  if (conflictingBindings.length < 2) {
    return null;
  }

  const hotkeyDisplay = HotkeyService.getHotkeyDisplayString(conflictingBindings[0]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4
        bg-accent-warning/10 border border-accent-warning/30
        rounded-lg
        ${className}
      `}
    >
      <Icon name="exclamation-triangle" size="md" className="text-accent-warning flex-shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-accent-warning mb-1">Hotkey Conflict</h4>
        <p className="text-xs text-surface-300 mb-2">
          The key combination <kbd className="px-1 py-0.5 bg-surface-700 rounded">{hotkeyDisplay}</kbd> is assigned to multiple actions:
        </p>
        <ul className="text-xs text-surface-400 space-y-1">
          {conflictingBindings.map((binding) => (
            <li key={binding.id} className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-warning rounded-full" />
              <span>{binding.action.replace(/\./g, ' > ')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

HotkeyConflictWarning.displayName = 'HotkeyConflictWarning';
