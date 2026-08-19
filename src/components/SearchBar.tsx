import { useState, useCallback, useEffect, useRef } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [value, setValue] = useState('');
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      onSearch(value.trim());
    },
    [value, onSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = null;
        }
        setValue('');
        onSearch('');
        onClear?.();
      }
    },
    [onClear, onSearch]
  );

  const handleClear = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    setValue('');
    onSearch('');
    onClear?.();
  }, [onClear, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search" aria-label="Search Pokémon">
      <div className="search-bar__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <label htmlFor="pokemon-search" className="search-bar__sr-label">
        Search Pokémon by name or Pokédex number
      </label>
      <input
        type="search"
        className="search-bar__input"
        id="pokemon-search"
        placeholder="Search Pokémon by name…"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label="Search Pokémon by name or Pokédex number"
        inputMode="search"
        autoComplete="off"
      />
      {value.trim().length > 0 && (
        <button
          type="button"
          className="search-bar__clear"
          aria-label="Clear search"
          onClick={handleClear}
        >
          ×
        </button>
      )}
      <span className="search-bar__actions">
        <button type="submit" className="search-bar__submit" aria-label="Submit search">
          Search
        </button>
      </span>
    </form>
  );
}
