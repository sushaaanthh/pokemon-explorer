import { useState, useCallback } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) {
        onSearch(value.trim());
      }
    },
    [value, onSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setValue('');
        onClear();
      }
    },
    [onClear]
  );

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <div className="search-bar__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search Pokémon by name…"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Search Pokémon by name"
        id="pokemon-search"
      />
      <button type="submit" className="search-bar__submit" aria-label="Submit search">
        Search
      </button>
    </form>
  );
}
