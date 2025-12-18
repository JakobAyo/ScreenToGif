import { useState, useEffect, useCallback } from 'react';
import { useDebounce, useThrottledCallback } from './useDebounce';

export interface WindowSize {
  width: number;
  height: number;
}

export interface UseWindowSizeOptions {
  /**
   * Debounce delay in milliseconds
   * Set to 0 to disable debouncing
   */
  debounce?: number;
  /**
   * Throttle interval in milliseconds
   * Alternative to debouncing for smoother updates
   */
  throttle?: number;
  /**
   * Initial size to use before window is measured
   */
  initialSize?: WindowSize;
}

const defaultSize: WindowSize = {
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0,
};

export function useWindowSize(options: UseWindowSizeOptions = {}): WindowSize {
  const { debounce = 100, throttle, initialSize = defaultSize } = options;

  const [windowSize, setWindowSize] = useState<WindowSize>(initialSize);

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Apply throttle if specified, otherwise we'll use debounce below
  const throttledResize = useThrottledCallback(handleResize, throttle ?? 100);

  useEffect(() => {
    // Set initial size
    handleResize();

    const handler = throttle ? throttledResize : handleResize;

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [handleResize, throttledResize, throttle]);

  // Apply debounce if not using throttle
  const debouncedSize = useDebounce(windowSize, throttle ? 0 : debounce);

  return throttle ? windowSize : debouncedSize;
}

// Hook to detect specific breakpoints
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpointValues: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useBreakpoint(): {
  breakpoint: Breakpoint | null;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
  isAbove: (bp: Breakpoint) => boolean;
  isBelow: (bp: Breakpoint) => boolean;
} {
  const { width } = useWindowSize({ debounce: 150 });

  const getBreakpoint = (): Breakpoint | null => {
    if (width >= breakpointValues['2xl']) return '2xl';
    if (width >= breakpointValues.xl) return 'xl';
    if (width >= breakpointValues.lg) return 'lg';
    if (width >= breakpointValues.md) return 'md';
    if (width >= breakpointValues.sm) return 'sm';
    return null;
  };

  const breakpoint = getBreakpoint();

  return {
    breakpoint,
    isSm: width >= breakpointValues.sm,
    isMd: width >= breakpointValues.md,
    isLg: width >= breakpointValues.lg,
    isXl: width >= breakpointValues.xl,
    is2Xl: width >= breakpointValues['2xl'],
    isAbove: (bp: Breakpoint) => width >= breakpointValues[bp],
    isBelow: (bp: Breakpoint) => width < breakpointValues[bp],
  };
}

// Hook to detect window focus
export function useWindowFocus(): boolean {
  const [isFocused, setIsFocused] = useState(
    typeof document !== 'undefined' ? document.hasFocus() : true
  );

  useEffect(() => {
    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return isFocused;
}

// Hook to detect if document is visible
export function useDocumentVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return isVisible;
}

// Hook to get element dimensions
export function useElementSize<T extends HTMLElement>(
  elementRef: React.RefObject<T | null>
): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [elementRef]);

  return size;
}
