import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { useTheme } from './hooks/useTheme';
import { Home } from './pages/Home';
import { Favorites } from './pages/Favorites';
import { Comparison } from './pages/Comparison';
import { PokemonDetails } from './pages/PokemonDetails';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparison, setComparison] = useState<string[]>(['pikachu', 'charizard']);
  const toggleFavorite = (name: string) => setFavorites(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);
  const toggleComparison = (name: string) => setComparison(current => current.includes(name) ? current.filter(item => item !== name) : current.length < 2 ? [...current, name] : current);

  return (
    <BrowserRouter>
      <Navigation
        theme={theme}
        onToggleTheme={toggleTheme}
        favoritesCount={favorites.length}
      />
      <Routes>
        <Route path="/" element={<Home favorites={favorites} comparison={comparison} onToggleFavorite={toggleFavorite} onToggleComparison={toggleComparison} />} />
        <Route path="/favorites" element={<Favorites favorites={favorites} comparison={comparison} onToggleFavorite={toggleFavorite} onToggleComparison={toggleComparison} />} />
        <Route path="/compare" element={<Comparison comparison={comparison} />} />
        <Route path="/pokemon/:name" element={<PokemonDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
