import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pokemon-explorer-favorites';

function getStoredFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as number[];
  } catch {
    // corrupted or unavailable
  }
  return [];
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(getStoredFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // localStorage unavailable
    }
  }, [favorites]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, count: favorites.length };
}
