import { useState, useRef, useEffect, type ReactNode, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

interface TooltipCoords {
  top: number;
  left: number;
}

const OFFSET = 8;

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  disabled = false,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const calculatePosition = (): TooltipCoords => {
    if (!triggerRef.current || !tooltipRef.current) {
      return { top: 0, left: 0 };
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - OFFSET;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + OFFSET;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - OFFSET;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + OFFSET;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

    return { top, left };
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      setCoords(calculatePosition());
    }
  }, [isVisible, position]);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const arrowStyles: Record<TooltipPosition, string> = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-surface-700',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-surface-700',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-surface-700',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-surface-700',
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`inline-block ${className}`}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
            }}
            className="
              z-50 px-2.5 py-1.5
              bg-surface-700 text-surface-100
              text-xs font-medium
              rounded-md shadow-lg
              border border-surface-600
              animate-fade-in
              pointer-events-none
            "
          >
            {content}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowStyles[position]}`}
              aria-hidden="true"
            />
          </div>,
          document.body
        )}
    </>
  );
}

// Simple wrapper for common use cases
export interface TooltipWrapperProps extends HTMLAttributes<HTMLDivElement> {
  tooltip: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
}

export function WithTooltip({
  tooltip,
  position,
  delay,
  disabled,
  children,
  ...props
}: TooltipWrapperProps) {
  return (
    <Tooltip content={tooltip} position={position} delay={delay} disabled={disabled}>
      <div {...props}>{children}</div>
    </Tooltip>
  );
}
