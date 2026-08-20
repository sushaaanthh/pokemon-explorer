import { useState, useCallback, useEffect, useRef } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  suggestions?: string[];
  onSuggestionSelect?: (name: string) => void;
}

export function SearchBar({ onSearch, onClear, suggestions = [], onSuggestionSelect }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLLIElement[]>([]);

  const trimmedValue = value.trim();
  const showDropdown = isOpen && trimmedValue.length > 0;

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (name: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      setValue(name);
      setIsOpen(false);
      setHighlightedIndex(-1);
      onSuggestionSelect?.(name);
      onSearch(name);
    },
    [onSearch, onSuggestionSelect]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      if (showDropdown && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex]);
      } else {
        onSearch(value.trim());
      }
      closeDropdown();
    },
    [value, onSearch, showDropdown, highlightedIndex, suggestions, handleSelect, closeDropdown]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown' && showDropdown) {
        e.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev < suggestions.length - 1 ? prev + 1 : 0;
          itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        return;
      }

      if (e.key === 'ArrowUp' && showDropdown) {
        e.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev > 0 ? prev - 1 : suggestions.length - 1;
          itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        return;
      }

      if (e.key === 'Escape') {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = null;
        }
        setValue('');
        onSearch('');
        onClear?.();
        closeDropdown();
        return;
      }

      if (e.key === 'Enter') {
        if (showDropdown && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          e.preventDefault();
          handleSelect(suggestions[highlightedIndex]);
          return;
        }
      }
    },
    [showDropdown, suggestions, highlightedIndex, onSearch, onClear, closeDropdown, handleSelect]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, []);

  const handleFocus = useCallback(() => {
    if (trimmedValue.length > 0) {
      setIsOpen(true);
    }
  }, [trimmedValue.length]);

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
        closeDropdown();
      }
    },
    [closeDropdown]
  );

  useEffect(() => {
    if (!showDropdown) {
      setHighlightedIndex(-1);
    }
  }, [showDropdown]);

  return (
    <div className="search-bar-wrapper" ref={containerRef} onBlur={handleBlur}>
      <form
        className="search-bar"
        onSubmit={handleSubmit}
        role="search"
        aria-label="Search Pokémon"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      >
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
          type="text"
          className="search-bar__input"
          id="pokemon-search"
          placeholder="Search Pokémon by name…"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          aria-label="Search Pokémon by name or Pokédex number"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-activedescendant={showDropdown && highlightedIndex >= 0 ? `search-suggestion-${highlightedIndex}` : undefined}
          inputMode="search"
          autoComplete="off"
          role="combobox"
        />
        <span className="search-bar__actions">
          {trimmedValue.length > 0 && (
            <button
              type="button"
              className="search-bar__clear"
              aria-label="Clear search"
              onClick={() => {
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                  searchTimeoutRef.current = null;
                }
                setValue('');
                setIsOpen(false);
                onSearch('');
                onClear?.();
              }}
            >
              ×
            </button>
          )}
          <button type="submit" className="search-bar__submit" aria-label="Submit search">
            Search
          </button>
        </span>
      </form>

      {showDropdown && (
        <ul
          id="search-suggestions"
          className="search-bar__suggestions"
          role="listbox"
          aria-label="Pokémon suggestions"
        >
          {suggestions.length > 0 ? (
            suggestions.map((name, index) => (
              <li
                key={name}
                id={`search-suggestion-${index}`}
                ref={el => { itemRefs.current[index] = el!; }}
                className={`search-bar__suggestion${index === highlightedIndex ? ' search-bar__suggestion--highlighted' : ''}`}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseDown={e => {
                  e.preventDefault();
                  handleSelect(name);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="search-bar__suggestion-name">{name}</span>
              </li>
            ))
          ) : (
            <li className="search-bar__suggestion--empty" role="option" aria-disabled="true">
              No Pokémon found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
