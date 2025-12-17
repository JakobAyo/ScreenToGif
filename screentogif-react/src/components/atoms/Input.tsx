import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  variant?: InputVariant;
  error?: boolean;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label?: string;
  helperText?: string;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
};

const variantStyles: Record<InputVariant, string> = {
  default: 'bg-transparent border border-surface-600 focus:border-primary-500',
  filled: 'bg-surface-800 border border-transparent focus:border-primary-500',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      error = false,
      errorMessage,
      leftIcon,
      rightIcon,
      label,
      helperText,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full rounded-lg
              text-surface-100 placeholder:text-surface-500
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500/30
              disabled:opacity-50 disabled:cursor-not-allowed
              ${variantStyles[variant]}
              ${sizeStyles[size]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'border-accent-error focus:border-accent-error focus:ring-accent-error/30' : ''}
              ${className}
            `.trim()}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
              {rightIcon}
            </span>
          )}
        </div>
        {(errorMessage || helperText) && (
          <p
            className={`mt-1.5 text-xs ${
              error && errorMessage ? 'text-accent-error' : 'text-surface-400'
            }`}
          >
            {error && errorMessage ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
