import { type HTMLAttributes } from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'primary' | 'white';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const strokeWidthStyles: Record<SpinnerSize, number> = {
  xs: 4,
  sm: 4,
  md: 3,
  lg: 3,
  xl: 2.5,
};

const variantStyles: Record<SpinnerVariant, string> = {
  default: 'text-surface-400',
  primary: 'text-primary-500',
  white: 'text-white',
};

export function Spinner({
  size = 'md',
  variant = 'default',
  label = 'Loading',
  className = '',
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      <svg
        className={`animate-spin ${sizeStyles[size]} ${variantStyles[variant]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokeWidthStyles[size]}
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d={`M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z`}
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Dots variant for alternative loading indicator
export function SpinnerDots({
  size = 'md',
  variant = 'default',
  label = 'Loading',
  className = '',
  ...props
}: SpinnerProps) {
  const dotSizeStyles: Record<SpinnerSize, string> = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3',
  };

  const gapStyles: Record<SpinnerSize, string> = {
    xs: 'gap-0.5',
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
    xl: 'gap-2.5',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center ${gapStyles[size]} ${className}`}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`
            ${dotSizeStyles[size]}
            ${variantStyles[variant]}
            rounded-full bg-current
            animate-bounce
          `}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
