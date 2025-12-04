import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    if (!item) {
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.log(error);
      console.log('Error parsing item from local storage. Deleting value', {
        key,
        item,
      });
      window.localStorage.removeItem(key);
      console.log('Setting initial value', initialValue);
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
  });

  function setValue(value: T | ((val: T) => T)) {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  }

  function listener(event: StorageEvent) {
    if (event.key === key) {
      try {
        setValue(JSON.parse(event.newValue as string));
      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    window.addEventListener('storage', listener);

    return () => {
      window.removeEventListener('storage', listener);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue] as const;
}
