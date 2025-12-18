import { forwardRef, type InputHTMLAttributes } from 'react';

export type SliderSize = 'sm' | 'md' | 'lg';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: SliderSize;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
}

const trackHeightStyles: Record<SliderSize, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

const thumbSizeStyles: Record<SliderSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      size = 'md',
      label,
      showValue = true,
      valueFormatter = (v) => String(v),
      disabled,
      className = '',
      value,
      min = 0,
      max = 100,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `slider-${Math.random().toString(36).slice(2, 9)}`;
    const currentValue = Number(value ?? min);
    const percentage = ((currentValue - Number(min)) / (Number(max) - Number(min))) * 100;

    return (
      <div className={`w-full ${className}`}>
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-surface-200"
              >
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm text-surface-400 font-mono">
                {valueFormatter(currentValue)}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="range"
            disabled={disabled}
            value={value}
            min={min}
            max={max}
            className={`
              w-full appearance-none bg-transparent cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              [&::-webkit-slider-runnable-track]:rounded-full
              [&::-webkit-slider-runnable-track]:bg-surface-700
              [&::-webkit-slider-runnable-track]:${trackHeightStyles[size]}
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:${thumbSizeStyles[size]}
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary-500
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-primary-400
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:duration-150
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:-mt-[5px]
              [&::-moz-range-track]:rounded-full
              [&::-moz-range-track]:bg-surface-700
              [&::-moz-range-track]:${trackHeightStyles[size]}
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:${thumbSizeStyles[size]}
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-primary-500
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-primary-400
              [&::-moz-range-thumb]:transition-transform
              [&::-moz-range-thumb]:duration-150
              [&::-moz-range-thumb]:hover:scale-110
            `}
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #334155 ${percentage}%, #334155 100%)`,
            }}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
