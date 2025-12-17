import { type HTMLAttributes } from 'react';

export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'error';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  max?: number;
  size?: ProgressBarSize;
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  labelFormatter?: (value: number, max: number) => string;
  indeterminate?: boolean;
  striped?: boolean;
  animated?: boolean;
}

const sizeStyles: Record<ProgressBarSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const variantStyles: Record<ProgressBarVariant, string> = {
  default: 'bg-primary-500',
  success: 'bg-accent-success',
  warning: 'bg-accent-warning',
  error: 'bg-accent-error',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  labelFormatter = (v, m) => `${Math.round((v / m) * 100)}%`,
  indeterminate = false,
  striped = false,
  animated = false,
  className = '',
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={className} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-surface-300">Progress</span>
          <span className="text-sm text-surface-400 font-mono">
            {labelFormatter(value, max)}
          </span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`
          w-full ${sizeStyles[size]}
          bg-surface-700 rounded-full overflow-hidden
        `}
      >
        <div
          className={`
            h-full rounded-full
            ${variantStyles[variant]}
            ${indeterminate ? 'animate-indeterminate' : 'transition-all duration-300 ease-out'}
            ${striped ? 'progress-striped' : ''}
            ${animated && striped ? 'progress-animated' : ''}
          `}
          style={indeterminate ? {} : { width: `${percentage}%` }}
        />
      </div>

      <style>{`
        @keyframes indeterminate {
          0% {
            width: 30%;
            transform: translateX(-100%);
          }
          100% {
            width: 30%;
            transform: translateX(400%);
          }
        }

        .animate-indeterminate {
          animation: indeterminate 1.5s ease-in-out infinite;
        }

        .progress-striped {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 1rem 1rem;
        }

        .progress-animated {
          animation: progress-stripes 1s linear infinite;
        }

        @keyframes progress-stripes {
          0% {
            background-position: 1rem 0;
          }
          100% {
            background-position: 0 0;
          }
        }
      `}</style>
    </div>
  );
}

// Circular progress variant
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  labelFormatter?: (value: number, max: number) => string;
  indeterminate?: boolean;
  className?: string;
}

const circularVariantStyles: Record<ProgressBarVariant, string> = {
  default: 'stroke-primary-500',
  success: 'stroke-accent-success',
  warning: 'stroke-accent-warning',
  error: 'stroke-accent-error',
};

export function CircularProgress({
  value,
  max = 100,
  size = 40,
  strokeWidth = 4,
  variant = 'default',
  showLabel = false,
  labelFormatter = (v, m) => `${Math.round((v / m) * 100)}%`,
  indeterminate = false,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className={indeterminate ? 'animate-spin' : ''}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className="stroke-surface-700"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`${circularVariantStyles[variant]} transition-all duration-300 ease-out`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: indeterminate ? circumference * 0.75 : strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>

      {showLabel && !indeterminate && (
        <span className="absolute text-xs font-medium text-surface-300">
          {labelFormatter(value, max)}
        </span>
      )}
    </div>
  );
}
