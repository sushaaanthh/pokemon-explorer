import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { useTheme } from './hooks/useTheme';
import { Home } from './pages/Home';
import { Favorites } from './pages/Favorites';
import { Comparison } from './pages/Comparison';
import { PokemonDetails } from './pages/PokemonDetails';
import { NotFound } from './pages/NotFound';
import { VaultTransitionProvider } from './components/VaultTransitionContext';
import { AppStateProvider, useAppState } from './context/AppStateContext';

function GlobalComparisonNotice() {
  const { comparisonNotice } = useAppState();

  if (!comparisonNotice) return null;

  return (
    <div className="global-notice" role="status" aria-live="polite">
      {comparisonNotice}
    </div>
  );
}

function AppShell() {
  const { theme, toggleTheme } = useTheme();

  return (
    <VaultTransitionProvider>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navigation
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/compare" element={<Comparison />} />
        <Route path="/pokemon/:name" element={<PokemonDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <GlobalComparisonNotice />
    </VaultTransitionProvider>
  );
}

function App() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (isInput) return;
      e.preventDefault();
      const searchInput = document.getElementById('pokemon-search');
      if (searchInput) {
        searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <AppStateProvider>
        <AppShell />
      </AppStateProvider>
    </BrowserRouter>
  );
}

export default App;
