import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { VaultLink } from './VaultLink';
import { ThemeToggle } from './ThemeToggle';
import './Navigation.css';

interface NavigationProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  favoritesCount: number;
}

const NAV_LINKS = [
  { to: '/', label: 'Dex' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/compare', label: 'Compare' },
];

export function Navigation({ theme, onToggleTheme, favoritesCount }: NavigationProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <div className="nav__inner container">
        <VaultLink to="/" className="nav__brand" aria-label="Pokémon Explorer Home">
          <span className="nav__brand-icon">◆</span>
          <span className="nav__brand-text">Pokémon Explorer</span>
        </VaultLink>

        <div className={`nav__links ${mobileOpen ? 'nav__links--open' : ''}`}>
          {NAV_LINKS.map(link => (
            <VaultLink
              key={link.to}
              to={link.to}
              className={`nav__link ${location.pathname === link.to ? 'nav__link--active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
              {link.to === '/favorites' && favoritesCount > 0 && (
                <span className="nav__badge">{favoritesCount}</span>
              )}
            </VaultLink>
          ))}
        </div>

        <div className="nav__actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <VaultLink to="/favorites" className="nav__fav-icon" aria-label={`Favorites (${favoritesCount})`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {favoritesCount > 0 && (
              <span className="nav__fav-count">{favoritesCount}</span>
            )}
          </VaultLink>

          <button
            className={`nav__hamburger ${mobileOpen ? 'nav__hamburger--open' : ''}`}
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}
