import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Pokemon } from '../types/pokemon';
import { getPokemon } from '../services/pokemonApi';
import { getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonId } from '../utils/formatPokemonId';
import { formatPokemonName } from '../utils/formatPokemonName';
import { ErrorState } from '../components/ErrorState';
import { FavoriteButton } from '../components/FavoriteButton';
import { CompareButton } from '../components/CompareButton';
import { CryButton } from '../components/CryButton';
import { createFallbackArt } from '../components/FeaturedPokemon';
import { useAppState } from '../context/AppStateContext';
import './pages.css';
import './PokemonDetails.css';

const INITIAL_MOVES_COUNT = 12;

export function PokemonDetails() {
  const { name: identifier } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAllMoves, setShowAllMoves] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const fallbackArt = useMemo(() => createFallbackArt(pokemon), [pokemon]);
  const { isFavorite, toggleFavorite, isCompareSelected, toggleComparison } = useAppState();
  const backFromCompare = (location.state as { from?: string } | null)?.from === '/compare';
  const backTo = backFromCompare ? '/compare' : '/';
  const backLabel = backFromCompare ? 'Back to Compare' : 'Back to Dex';

  // Left/Right arrow keyboard navigation for Details page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || error || !pokemon) return;

      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (isInput) return;

      if (e.key === 'ArrowLeft' && pokemon.id > 1) {
        e.preventDefault();
        navigate(`/pokemon/${pokemon.id - 1}`);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(`/pokemon/${pokemon.id + 1}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pokemon, loading, error, navigate]);

  const fetchPokemon = useCallback(async () => {
    if (!identifier) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
    setPokemon(null);
    try {
      const param = /^\d+$/.test(identifier) ? Number(identifier) : identifier.toLowerCase();
      const result = await getPokemon(param);
      setPokemon(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    fetchPokemon();
    window.scrollTo(0, 0);
  }, [fetchPokemon]);

  // Animate stat bars when the page loads
  useEffect(() => {
    if (pokemon) {
      const timer = setTimeout(() => setStatsAnimated(true), 300);
      return () => clearTimeout(timer);
    }
    setStatsAnimated(false);
  }, [pokemon]);

  // Dynamic document title
  useEffect(() => {
    if (pokemon) {
      document.title = `Pokémon Explorer — ${formatPokemonName(pokemon.name)}`;
    } else {
      document.title = 'Pokémon Explorer';
    }
    return () => {
      document.title = 'Pokémon Explorer';
    };
  }, [pokemon]);

  // Loading skeleton
  if (loading) {
    return (
      <main className="detail-page" id="main-content">
        <Link to={backTo} className="detail-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {backLabel}
        </Link>
        <div className="detail-layout">
          <section className="detail-artwork-panel detail-skeleton-artwork skeleton" />
          <section className="detail-info">
            <div className="detail-skeleton-eyebrow skeleton" />
            <div className="detail-skeleton-name skeleton" />
            <div className="detail-skeleton-types">
              <div className="detail-skeleton-badge skeleton" />
              <div className="detail-skeleton-badge skeleton" />
            </div>
            <div className="detail-meta-grid">
              <div className="detail-meta-card skeleton detail-skeleton-meta" />
              <div className="detail-meta-card skeleton detail-skeleton-meta" />
              <div className="detail-meta-card skeleton detail-skeleton-meta" />
            </div>
            <div className="detail-stats">
              <div className="detail-skeleton-section-title skeleton" />
              {Array.from({ length: 6 }, (_, i) => (
                <div className="stat-row" key={i}>
                  <div className="detail-skeleton-stat-label skeleton" />
                  <div className="stat-bar-container skeleton" />
                  <div className="detail-skeleton-stat-value skeleton" />
                </div>
              ))}
            </div>
            <div className="detail-moves">
              <div className="detail-skeleton-section-title skeleton" />
              <div className="detail-moves-grid">
                {Array.from({ length: 8 }, (_, i) => (
                  <div className="detail-skeleton-chip skeleton" key={i} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Error or not found
  if (error || !pokemon) {
    return (
      <main className="detail-page" id="main-content">
        <Link to={backTo} className="detail-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {backLabel}
        </Link>
        <div className="detail-error-wrap">
          <ErrorState onRetry={fetchPokemon} />
        </div>
      </main>
    );
  }

  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const primaryColor = getTypeColor(primaryType);

  const artworkUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default ??
    '';

  const imgSrc = artworkUrl && !imageError ? artworkUrl : fallbackArt;

  const heightMeters = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);
  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  const visibleMoves = showAllMoves
    ? pokemon.moves
    : pokemon.moves.slice(0, INITIAL_MOVES_COUNT);
  const remainingMoves = pokemon.moves.length - INITIAL_MOVES_COUNT;

  return (
    <main className="detail-page" style={{ '--card-type-color': primaryColor } as React.CSSProperties} id="main-content">
      <Link to={backTo} className="detail-back" state={location.state}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {backLabel}
      </Link>

      <nav className="detail-nav" aria-label="Pokémon navigation">
        <Link to={`/pokemon/${pokemon.id + 1}`} className="detail-nav__btn detail-nav__btn--next">
          Next →
        </Link>
      </nav>

      <div className="detail-layout">
        {/* Left: Artwork Panel */}
        <section className="detail-artwork-panel">
          <span className="detail-artwork-glow" aria-hidden="true" />
          <span className="detail-artwork-panel__scan" aria-hidden="true" />
          <span className="detail-artwork-id">{formatPokemonId(pokemon.id)}</span>
          <img
            src={imgSrc}
            alt={`${formatPokemonName(pokemon.name)} artwork`}
            className="detail-artwork-image"
            decoding="async"
            loading="eager"
            width="450"
            height="450"
            onError={() => setImageError(true)}
          />
        </section>

        {/* Right: Info Panel */}
        <section className="detail-info">
          <p className="detail-eyebrow">
            Pokédex Entry
            <span className="hud-status" aria-hidden="true">Specimen Active</span>
          </p>
          <div className="detail-title-row">
            <h1 className="detail-name">{formatPokemonName(pokemon.name)}</h1>
            <FavoriteButton isFavorite={isFavorite(pokemon.id)} onToggle={() => toggleFavorite(pokemon.id)} size={24} />
          </div>

          <div className="detail-types">
            {pokemon.types.map((t) => (
              <span
                key={t.type.name}
                className="detail-type-badge"
                style={{ backgroundColor: getTypeColor(t.type.name) }}
              >
                {formatPokemonName(t.type.name)}
              </span>
            ))}
            <CryButton cryUrl={pokemon.cryUrl} size={20} />
          </div>

          <div className="detail-actions">
            <div className="detail-actions-row">
              <CompareButton
                isSelected={isCompareSelected(pokemon.id)}
                disabled={false}
                onToggle={() => toggleComparison(pokemon.id)}
              />
            </div>
          </div>

          <div className="detail-meta-grid">
            <div className="detail-meta-card">
              <span className="detail-meta-label">Height</span>
              <span className="detail-meta-value">{heightMeters} m</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-label">Weight</span>
              <span className="detail-meta-value">{weightKg} kg</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-label">Abilities</span>
              <span className="detail-meta-value detail-abilities-value">
                {pokemon.abilities.map((a, i) => (
                  <span key={a.ability.name} className="detail-ability-item">
                    {formatPokemonName(a.ability.name)}
                    {a.is_hidden && <span className="detail-hidden-badge">Hidden</span>}
                    {i < pokemon.abilities.length - 1 && ', '}
                  </span>
                ))}
              </span>
            </div>
          </div>

          {/* Base Stats */}
          <div className="detail-stats">
            <p className="detail-section-title">
              <span className="hud-tech-label">Base Stats</span>
            </p>
            {pokemon.stats.map((s, index) => {
              const maxStat = 255;
              const percentage = Math.min((s.base_stat / maxStat) * 100, 100);

              return (
                <div className="stat-row" key={s.stat.name}>
                  <span className="stat-name">{formatPokemonName(s.stat.name)}</span>
                  <div className="stat-bar-container" role="progressbar" aria-valuenow={s.base_stat} aria-valuemin={0} aria-valuemax={maxStat} aria-label={`${formatPokemonName(s.stat.name)}: ${s.base_stat}`}>
                    <div
                      className="stat-bar-fill"
                      style={{
                        width: statsAnimated ? `${percentage}%` : '0%',
                        transitionDelay: `${index * 0.1}s`
                      }}
                    />
                  </div>
                  <span className="stat-value">{s.base_stat}</span>
                </div>
              );
            })}
            <div className="stat-row stat-row--total">
              <span className="stat-name">Total</span>
              <div className="stat-bar-container">
                <div
                  className="stat-bar-fill stat-bar-fill--total"
                  style={{
                    width: statsAnimated ? `${Math.min((totalStats / (255 * 6)) * 100, 100)}%` : '0%',
                    transitionDelay: `${pokemon.stats.length * 0.1}s`
                  }}
                />
              </div>
              <span className="stat-value">{totalStats}</span>
            </div>
          </div>

          {/* Moves */}
          <div className="detail-moves">
            <p className="detail-section-title">
              <span className="hud-tech-label">Moves</span>
              <span className="detail-moves-count">{pokemon.moves.length}</span>
            </p>
            <div className="detail-moves-grid">
              {visibleMoves.map((m) => (
                <span className="move-chip" key={m.move.name}>
                  {formatPokemonName(m.move.name)}
                </span>
              ))}
            </div>
            {!showAllMoves && remainingMoves > 0 && (
              <button
                className="detail-moves-expand"
                onClick={() => setShowAllMoves(true)}
              >
                +{remainingMoves} more
              </button>
            )}
            {showAllMoves && pokemon.moves.length > INITIAL_MOVES_COUNT && (
              <button
                className="detail-moves-expand"
                onClick={() => setShowAllMoves(false)}
              >
                Show less
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
