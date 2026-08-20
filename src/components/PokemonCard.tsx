import { memo, useState, useCallback } from 'react';
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
  /** Grid index used for stagger delay on initial load animation */
  index?: number;
  /** Grid render generation so cards can distinguish initial load from later refreshes */
  generation?: number;
}

function getArtwork(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default ??
    ''
  );
}

export const PokemonCard = memo(function PokemonCard({ pokemon, onSelect, linkState, index = 0, generation }: PokemonCardProps) {
  const isFirstGridRender = generation === 1;
  const { isFavorite, toggleFavorite, isCompareSelected, toggleComparison } = useAppState();
  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const typeColor = getTypeColor(primaryType);
  const artwork = getArtwork(pokemon);
  const hpStat = pokemon.stats.find(s => s.stat.name === 'hp');
  const [isLoadAnimating, setIsLoadAnimating] = useState(true);

  const handleAnimationEnd = useCallback(() => {
    setIsLoadAnimating(false);
  }, []);

  const { ref, isInView } = useInView(
    !isFirstGridRender && isLoadAnimating ? { rootMargin: '0px 0px 9999px 0px' } : undefined
  );

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

  const shouldScanAnimate = isFirstGridRender && isInView;
  const shouldLoadAnimate = !isFirstGridRender && isLoadAnimating;

  return (
    <Link
      ref={ref as any}
      to={`/pokemon/${pokemon.name}`}
      state={linkState}
      className={`pokemon-card ${shouldScanAnimate ? 'pokemon-card--visible' : ''} ${shouldLoadAnimate ? 'pokemon-card--load-enter' : ''} ${favorite ? 'pokemon-card--favorite' : ''} ${compareSelected ? 'pokemon-card--compare' : ''}`}
      style={{ '--card-type-color': typeColor, '--card-index': index } as React.CSSProperties}
      data-cry-url={pokemon.cryUrl ?? undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      <span className="pokemon-card__bg-id" data-id={formatPokemonId(pokemon.id)}>{formatPokemonId(pokemon.id)}</span>
      <span className="pokemon-card__type-bar" aria-hidden="true" />

      <div className="pokemon-card__top">
        <span className="pokemon-card__id">{formatPokemonId(pokemon.id)}</span>
        <span className="pokemon-card__status" aria-hidden="true" />
        <div className="pokemon-card__actions">
          <CryButton cryUrl={pokemon.cryUrl} />
          <FavoriteButton isFavorite={favorite} onToggle={() => toggleFavorite(pokemon.id)} />
        </div>
      </div>

      <div className="pokemon-card__artwork-wrap">
        <div className="pokemon-card__glow" />
        <span className="pokemon-card__scan-line" aria-hidden="true" />
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