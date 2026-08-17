import { BrowserRouter } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <Navigation
        theme={theme}
        onToggleTheme={toggleTheme}
        favoritesCount={0}
      />
      <main />
    </BrowserRouter>
  );
}

export default App;
