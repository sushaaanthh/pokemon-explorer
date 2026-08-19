import type { PokemonTypeName } from '../types/pokemon';
import { ALL_TYPES, getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonName } from '../utils/formatPokemonName';
import './TypeFilter.css';

interface TypeFilterProps {
  selected: PokemonTypeName | null;
  onSelect: (type: PokemonTypeName | null) => void;
}

export function TypeFilter({ selected, onSelect }: TypeFilterProps) {
  return (
    <div className="type-filter" role="group" aria-label="Filter by Pokémon type">
      <button
        className={`type-filter__btn ${selected === null ? 'type-filter__btn--active' : ''}`}
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
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
          >
            {formatPokemonName(type)}
          </button>
        );
      })}
    </div>
  );
}
