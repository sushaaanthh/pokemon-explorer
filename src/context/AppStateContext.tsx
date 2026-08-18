import { createContext, useContext, type ReactNode } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useComparison } from '../hooks/useComparison';

interface AppStateContextType {
  // Favorites
  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  favoritesCount: number;
  // Comparison
  comparison: number[];
  isCompareSelected: (id: number) => boolean;
  toggleComparison: (id: number) => void;
  setComparisonSlot: (slotIndex: 0 | 1, id: number) => void;
  removeFromComparison: (id: number) => void;
  clearComparison: () => void;
  comparisonCount: number;
  comparisonIsFull: boolean;
  comparisonMax: number;
  comparisonNotice: string | null;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const favoritesHook = useFavorites();
  const comparisonHook = useComparison();

  const value: AppStateContextType = {
    favorites: favoritesHook.favorites,
    isFavorite: favoritesHook.isFavorite,
    toggleFavorite: favoritesHook.toggleFavorite,
    favoritesCount: favoritesHook.count,

    comparison: comparisonHook.comparison,
    isCompareSelected: comparisonHook.isCompareSelected,
    toggleComparison: comparisonHook.toggleComparison,
    setComparisonSlot: comparisonHook.setComparisonSlot,
    removeFromComparison: comparisonHook.removeFromComparison,
    clearComparison: comparisonHook.clearComparison,
    comparisonCount: comparisonHook.count,
    comparisonIsFull: comparisonHook.isFull,
    comparisonMax: comparisonHook.MAX_COMPARISON,
    comparisonNotice: comparisonHook.notice,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}