import { forwardRef, type InputHTMLAttributes } from 'react';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: RadioSize;
  label?: string;
  description?: string;
}

const sizeStyles: Record<RadioSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const dotSizeStyles: Record<RadioSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      size = 'md',
      label,
      description,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;

    const radio = (
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
          type="radio"
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`
            ${sizeStyles[size]}
            flex items-center justify-center
            rounded-full
            border-2 border-surface-500
            bg-transparent
            peer-checked:border-primary-600
            peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50
            transition-colors duration-150
          `}
        >
          {/* Inner dot */}
          <div
            className={`
              ${dotSizeStyles[size]}
              rounded-full
              bg-primary-600
              scale-0 peer-checked:scale-100
              transition-transform duration-150
            `}
          />
        </div>
      </label>
    );

    if (!label) {
      return <div className={className}>{radio}</div>;
    }

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        {radio}
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

Radio.displayName = 'Radio';

// RadioGroup component for managing a group of radio buttons
export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  size?: RadioSize;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  size = 'md',
  orientation = 'vertical',
  label,
  className = '',
}: RadioGroupProps) {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-surface-200 mb-3">
          {label}
        </legend>
      )}
      <div
        className={`
          flex
          ${orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row gap-6'}
        `}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            size={size}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
          />
        ))}
      </div>
    </fieldset>
  );
}
