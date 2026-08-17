import { Link } from 'react-router-dom';
import type { Pokemon } from '../types/pokemon';
import { getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonId } from '../utils/formatPokemonId';
import { formatPokemonName } from '../utils/formatPokemonName';
import { FavoriteButton } from './FavoriteButton';
import { CompareButton } from './CompareButton';
import './PokemonCard.css';

interface PokemonCardProps {
  pokemon: Pokemon;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isCompareSelected: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
}

function getArtwork(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default ??
    ''
  );
}

export function PokemonCard({
  pokemon,
  isFavorite,
  onToggleFavorite,
  isCompareSelected,
  compareDisabled,
  onToggleCompare,
}: PokemonCardProps) {
  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const typeColor = getTypeColor(primaryType);
  const artwork = getArtwork(pokemon);
  const hpStat = pokemon.stats.find(s => s.stat.name === 'hp');

  return (
    <Link
      to={`/pokemon/${pokemon.name}`}
      className="pokemon-card"
      style={{ '--card-type-color': typeColor } as React.CSSProperties}
    >
      {/* Background Pokédex ID */}
      <span className="pokemon-card__bg-id">{formatPokemonId(pokemon.id)}</span>

      {/* Top bar */}
      <div className="pokemon-card__top">
        <span className="pokemon-card__id">{formatPokemonId(pokemon.id)}</span>
        <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
      </div>

      {/* Artwork */}
      <div className="pokemon-card__artwork-wrap">
        <div className="pokemon-card__glow" />
        <img
          className="pokemon-card__artwork"
          src={artwork}
          alt={pokemon.name}
          loading="lazy"
          width="160"
          height="160"
        />
      </div>

      {/* Info */}
      <div className="pokemon-card__info">
        <h3 className="pokemon-card__name">{formatPokemonName(pokemon.name)}</h3>
        <div className="pokemon-card__types">
          {pokemon.types.map(t => (
            <span
              key={t.type.name}
              className="pokemon-card__type-badge"
              style={{ background: getTypeColor(t.type.name) }}
            >
              {formatPokemonName(t.type.name)}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pokemon-card__footer">
        {hpStat && (
          <span className="pokemon-card__stat">
            HP <strong>{hpStat.base_stat}</strong>
          </span>
        )}
        <CompareButton
          isSelected={isCompareSelected}
          disabled={compareDisabled}
          onToggle={onToggleCompare}
        />
      </div>
    </Link>
  );
}
