import type { PokemonTypeName } from '../types/pokemon';
import { ALL_TYPES, getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonName } from '../utils/formatPokemonName';
import './TypeFilter.css';

interface TypeFilterProps {
  selected: PokemonTypeName | null;
  onSelect: (type: PokemonTypeName | null) => void;
}

export function TypeFilter({ selected, onSelect }: TypeFilterProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')
    );
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % buttons.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = buttons.length - 1;
    }
    if (nextIndex !== currentIndex) {
      buttons[nextIndex]?.focus();
    }
  };

  return (
    <div
      className="type-filter"
      role="group"
      aria-label="Filter by Pokémon type"
      onKeyDown={handleKeyDown}
    >
      <button
        className={`type-filter__btn ${selected === null ? 'type-filter__btn--active' : ''}`}
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
        type="button"
      >
        All
      </button>
      {ALL_TYPES.map(type => {
        const color = getTypeColor(type);
        const isActive = selected === type;
        return (
          <button
            key={type}
            className={`type-filter__btn ${isActive ? 'type-filter__btn--active' : ''}`}
            style={{
              '--type-color': color,
              ...(isActive
                ? { background: color, color: '#fff', borderColor: color }
                : {}),
            } as React.CSSProperties}
            onClick={() => onSelect(isActive ? null : type)}
            aria-pressed={isActive}
            type="button"
          >
            {formatPokemonName(type)}
          </button>
        );
      })}
    </div>
  );
}
