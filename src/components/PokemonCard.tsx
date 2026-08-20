import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Pokemon } from '../types/pokemon';
import { getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonId } from '../utils/formatPokemonId';
import { formatPokemonName } from '../utils/formatPokemonName';
import { FavoriteButton } from './FavoriteButton';
import { CompareButton } from './CompareButton';
import { CryButton } from './CryButton';
import { useAppState } from '../context/AppStateContext';
import { useInView } from '../hooks/useInView';
import './PokemonCard.css';

interface PokemonCardProps {
  pokemon: Pokemon;
  /** Optional override for the compare action when rendered inside /compare */
  onSelect?: (id: number) => void;
  /** Optional router state passed to the navigation Link (e.g. to remember origin) */
  linkState?: object;
}

function getArtwork(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default ??
    ''
  );
}

export const PokemonCard = memo(function PokemonCard({ pokemon, onSelect, linkState }: PokemonCardProps) {
  const { isFavorite, toggleFavorite, isCompareSelected, toggleComparison } = useAppState();
  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const typeColor = getTypeColor(primaryType);
  const artwork = getArtwork(pokemon);
  const hpStat = pokemon.stats.find(s => s.stat.name === 'hp');
  const { ref, isInView } = useInView();

  const favorite = isFavorite(pokemon.id);
  const compareSelected = isCompareSelected(pokemon.id);
  const compareDisabled = false;

  const handleCompare = () => {
    if (onSelect) {
      onSelect(pokemon.id);
    } else {
      toggleComparison(pokemon.id);
    }
  };

  return (
    <Link
      ref={ref as any}
      to={`/pokemon/${pokemon.name}`}
      state={linkState}
      className={`pokemon-card ${isInView ? 'pokemon-card--visible' : ''} ${favorite ? 'pokemon-card--favorite' : ''} ${compareSelected ? 'pokemon-card--compare' : ''}`}
      style={{ '--card-type-color': typeColor } as React.CSSProperties}
      data-cry-url={pokemon.cryUrl ?? undefined}
    >
      <span className="pokemon-card__bg-id">{formatPokemonId(pokemon.id)}</span>
      <span className="pokemon-card__type-bar" aria-hidden="true" />

      <div className="pokemon-card__top">
        <span className="pokemon-card__id">{formatPokemonId(pokemon.id)}</span>
        <div className="pokemon-card__actions">
          <CryButton cryUrl={pokemon.cryUrl} />
          <FavoriteButton isFavorite={favorite} onToggle={() => toggleFavorite(pokemon.id)} />
        </div>
      </div>

      <div className="pokemon-card__artwork-wrap">
        <div className="pokemon-card__glow" />
        <img
          className="pokemon-card__artwork"
          src={artwork}
          alt={pokemon.name}
          loading="lazy"
          decoding="async"
          width="165"
          height="165"
        />
      </div>

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

      <div className="pokemon-card__footer">
        {hpStat && (
          <span className="pokemon-card__stat">
            <strong>{hpStat.base_stat}</strong>
          </span>
        )}
        <CompareButton
          isSelected={compareSelected}
          disabled={compareDisabled}
          onToggle={handleCompare}
        />
      </div>
    </Link>
  );
});