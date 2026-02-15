import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  key: string;
  interval?: number; // milliseconds, default 30000 (30 seconds)
  enabled?: boolean;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

/**
 * Hook to automatically save form data to localStorage
 * @param data - Data to save
 * @param options - Configuration options
 * @returns State object with saving status and restore function
 */
export function useAutoSave<T>(
  data: T,
  options: UseAutoSaveOptions
): AutoSaveState & { restore: () => T | null; clear: () => void } {
  const { key, interval = 30000, enabled = true } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const lastDataRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage
  const save = (dataToSave: T) => {
    try {
      setIsSaving(true);
      localStorage.setItem(key, JSON.stringify(dataToSave));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      // Reset saving state after animation
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      setIsSaving(false);
    }
  };

  // Restore from localStorage
  const restore = (): T | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved) as T;
      }
      return null;
    } catch (error) {
      console.error('Failed to restore from localStorage:', error);
      return null;
    }
  };

  // Clear saved data
  const clear = () => {
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);

    // Check if data has changed
    if (currentData !== lastDataRef.current) {
      setHasUnsavedChanges(true);
      lastDataRef.current = currentData;

      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule save
      saveTimeoutRef.current = setTimeout(() => {
        save(data);
      }, interval);
    }

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, enabled, interval, key]);

  // Save on page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (hasUnsavedChanges) {
        save(data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data, enabled, hasUnsavedChanges]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    restore,
    clear,
  };
}
