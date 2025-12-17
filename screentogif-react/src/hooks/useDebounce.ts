import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that debounces a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced callback function
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, ...deps]
  );
}

/**
 * Hook that returns a debounced callback with immediate option
 */
export function useDebouncedCallbackImmediate<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number,
  immediate: boolean = false
): [(...args: Parameters<T>) => void, () => void, boolean] {
  const timeoutRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const callNow = immediate && !timeoutRef.current;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsPending(true);

      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = undefined;
        setIsPending(false);
        if (!immediate) {
          callbackRef.current(...args);
        }
      }, delay);

      if (callNow) {
        callbackRef.current(...args);
        setIsPending(false);
      }
    },
    [delay, immediate]
  );

  return [debouncedCallback, cancel, isPending];
}

/**
 * Hook for throttling a value (limits how often it updates)
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Hook that returns a throttled callback function
 */
export function useThrottledCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRan = useRef(0);
  const lastCallback = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (lastCallback.current) {
        clearTimeout(lastCallback.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= limit) {
        lastRan.current = now;
        callbackRef.current(...args);
      } else {
        // Schedule the callback for when the throttle period ends
        if (lastCallback.current) {
          clearTimeout(lastCallback.current);
        }
        lastCallback.current = window.setTimeout(
          () => {
            lastRan.current = Date.now();
            callbackRef.current(...args);
          },
          limit - (now - lastRan.current)
        );
      }
    },
    [limit]
  );
}
