import { forwardRef, type InputHTMLAttributes } from 'react';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: CheckboxSize;
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

const sizeStyles: Record<CheckboxSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const iconSizeStyles: Record<CheckboxSize, string> = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = 'md',
      label,
      description,
      indeterminate = false,
      disabled,
      className = '',
      checked,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    const checkbox = (
      <label
        htmlFor={inputId}
        className={`
          relative inline-flex items-center cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`
            ${sizeStyles[size]}
            flex items-center justify-center
            rounded
            border-2 border-surface-500
            bg-transparent
            peer-checked:bg-primary-600 peer-checked:border-primary-600
            peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50
            transition-colors duration-150
          `}
        >
          {/* Checkmark */}
          <svg
            className={`
              ${iconSizeStyles[size]}
              text-white
              opacity-0 peer-checked:opacity-100
              transition-opacity duration-150
            `}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {indeterminate ? (
              <path
                d="M2.5 6h7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M2.5 6l2.5 2.5 4.5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>
      </label>
    );

    if (!label) {
      return <div className={className}>{checkbox}</div>;
    }

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        {checkbox}
        <div className="flex-1 pt-0.5">
          <label
            htmlFor={inputId}
            className={`
              text-sm font-medium text-surface-200 cursor-pointer
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
          >
            {label}
          </label>
          {description && (
            <p className="mt-0.5 text-xs text-surface-400">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
