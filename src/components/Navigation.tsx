import logo from '../assets/branding/logo.png';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { VaultLink } from './VaultLink';
import { ThemeToggle } from './ThemeToggle';
import { useAppState } from '../context/AppStateContext';
import './Navigation.css';

interface NavigationProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { to: '/', label: 'Dex' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/compare', label: 'Compare' },
];

export function Navigation({ theme, onToggleTheme }: NavigationProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { favoritesCount, comparisonCount } = useAppState();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      mobileMenuRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      hamburgerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
      // Focus trap
      if (e.key === 'Tab' && mobileMenuRef.current) {
        const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <div className="nav__inner container">
        <VaultLink to="/" className="nav__brand" aria-label="Pokémon Explorer Home">
          <img className="nav__brand-icon" src={logo} alt="" width="32" height="32" />
          <span className="nav__brand-text">Pokémon Explorer</span>
        </VaultLink>

        <div
          ref={mobileMenuRef}
          id="mobile-nav-menu"
          className={`nav__links ${mobileOpen ? 'nav__links--open' : ''}`}
          tabIndex={mobileOpen ? 0 : -1}
          aria-hidden={!mobileOpen}
        >
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
              {link.to === '/compare' && comparisonCount > 0 && (
                <span className="nav__badge nav__badge--compare">{comparisonCount}</span>
              )}
            </VaultLink>
          ))}
        </div>

        <div className="nav__actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <VaultLink to="/favorites" className="nav__fav-icon" aria-label={`Favorites (${favoritesCount})`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {favoritesCount > 0 && (
              <span className="nav__fav-count">{favoritesCount}</span>
            )}
          </VaultLink>

          <button
            ref={hamburgerRef}
            className={`nav__hamburger ${mobileOpen ? 'nav__hamburger--open' : ''}`}
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div
          className="nav__backdrop"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') setMobileOpen(false);
          }}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </nav>
  );
}