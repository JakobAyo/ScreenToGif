import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  syncTabs?: boolean;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncTabs = true,
  } = options;

  // Get initial value from localStorage or use provided initial value
  const getStoredValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer(valueToStore));

          // Dispatch custom event for same-tab sync
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: serializer(valueToStore),
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sync with other tabs/windows
  useEffect(() => {
    if (!syncTabs || typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return;

      if (event.newValue === null) {
        setStoredValue(initialValue);
      } else {
        try {
          setStoredValue(deserializer(event.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, deserializer, syncTabs]);

  return [storedValue, setValue, removeValue];
}

// Specialized hook for boolean values
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean = false,
  options?: Omit<UseLocalStorageOptions<boolean>, 'serializer' | 'deserializer'>
): [boolean, (value: SetValue<boolean>) => void, () => void] {
  return useLocalStorage(key, initialValue, {
    ...options,
    serializer: String,
    deserializer: (v) => v === 'true',
  });
}

// Specialized hook for number values
export function useLocalStorageNumber(
  key: string,
  initialValue: number = 0,
  options?: Omit<UseLocalStorageOptions<number>, 'serializer' | 'deserializer'>
): [number, (value: SetValue<number>) => void, () => void] {
  return useLocalStorage(key, initialValue, {
    ...options,
    serializer: String,
    deserializer: Number,
  });
}
