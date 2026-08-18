import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pokemon-explorer-comparison';

function getStoredComparison(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      // Migrate legacy string-name format to numeric IDs
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is number | string => typeof item === 'number' || typeof item === 'string')
          .map(item => {
            if (typeof item === 'number') return item;
            // Legacy name → attempt to convert; if not numeric, drop it
            const num = Number(item);
            return isNaN(num) ? null : num;
          })
          .filter((item): item is number => item !== null);
      }
    }
  } catch {
    // corrupted or unavailable
  }
  return [];
}

const MAX_COMPARISON = 2;

export function useComparison() {
  const [comparison, setComparison] = useState<number[]>(getStoredComparison);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparison));
    } catch {
      // localStorage unavailable
    }
  }, [comparison]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const toggleComparison = useCallback((id: number) => {
    const selected = comparison.includes(id);
    const full = comparison.length >= MAX_COMPARISON;

    if (selected) {
      // Remove
      setComparison(prev => prev.filter(cid => cid !== id));
      setNotice(null);
    } else if (full) {
      // Full – communicate clearly, do not add
      setNotice('Comparison is full. Remove one Pokémon to add another.');
    } else {
      // Add
      setComparison(prev => [...prev, id]);
      setNotice(null);
    }
  }, [comparison]);

  const removeFromComparison = useCallback((id: number) => {
    setComparison(prev => prev.filter(cid => cid !== id));
  }, []);

  const clearComparison = useCallback(() => {
    setComparison([]);
  }, []);

  const isCompareSelected = useCallback(
    (id: number) => comparison.includes(id),
    [comparison]
  );

  return {
    comparison,
    toggleComparison,
    removeFromComparison,
    clearComparison,
    isCompareSelected,
    count: comparison.length,
    isFull: comparison.length >= MAX_COMPARISON,
    MAX_COMPARISON,
    notice,
  };
}