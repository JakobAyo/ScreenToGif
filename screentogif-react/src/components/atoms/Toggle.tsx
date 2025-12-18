import { forwardRef, type InputHTMLAttributes } from 'react';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: ToggleSize;
  label?: string;
  description?: string;
  labelPosition?: 'left' | 'right';
}

const trackSizeStyles: Record<ToggleSize, string> = {
  sm: 'w-8 h-4',
  md: 'w-11 h-6',
  lg: 'w-14 h-7',
};

const thumbSizeStyles: Record<ToggleSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const thumbTranslateStyles: Record<ToggleSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
  lg: 'translate-x-7',
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      size = 'md',
      label,
      description,
      labelPosition = 'right',
      disabled,
      className = '',
      checked,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `toggle-${Math.random().toString(36).slice(2, 9)}`;

    const toggle = (
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
            ${trackSizeStyles[size]}
            bg-surface-600 rounded-full
            peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50
            peer-checked:bg-primary-600
            transition-colors duration-200
          `}
        />
        <div
          className={`
            ${thumbSizeStyles[size]}
            absolute left-0.5 top-1/2 -translate-y-1/2
            bg-white rounded-full shadow-md
            transition-transform duration-200
            peer-checked:${thumbTranslateStyles[size]}
          `}
        />
      </label>
    );

    if (!label) {
      return <div className={className}>{toggle}</div>;
    }

    return (
      <div
        className={`
          flex items-start gap-3
          ${labelPosition === 'left' ? 'flex-row-reverse justify-end' : ''}
          ${className}
        `}
      >
        {toggle}
        <div className="flex-1">
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

Toggle.displayName = 'Toggle';
