import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { useTheme } from './hooks/useTheme';
import { Home } from './pages/Home';
import { Favorites } from './pages/Favorites';
import { Comparison } from './pages/Comparison';
import { PokemonDetails } from './pages/PokemonDetails';
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
      <Navigation
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/compare" element={<Comparison />} />
        <Route path="/pokemon/:name" element={<PokemonDetails />} />
      </Routes>
      <GlobalComparisonNotice />
    </VaultTransitionProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <AppShell />
      </AppStateProvider>
    </BrowserRouter>
  );
}

export default App;
