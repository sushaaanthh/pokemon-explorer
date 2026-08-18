import { useEffect, useState, useCallback } from 'react';
import type { Pokemon } from '../types/pokemon';
import { getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonId } from '../utils/formatPokemonId';
import { formatPokemonName } from '../utils/formatPokemonName';
import { getPokemon } from '../services/pokemonApi';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useAppState } from '../context/AppStateContext';
import './pages.css';
import './Comparison.css';

const COMPARE_STATS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

export function Comparison() {
  const { comparison, removeFromComparison } = useAppState();
  const [pokemonList, setPokemonList] = useState<(Pokemon | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    if (comparison.length === 0) {
      setPokemonList([null, null]);
      setIsLoading(false);
      setError(false);
      return;
    }

    async function fetchComparisonData() {
      setIsLoading(true);
      setError(false);
      try {
        const promises = comparison.map(id => getPokemon(id));
        const results = await Promise.all(promises);
        if (!active) return;

        setPokemonList([
          results[0] ?? null,
          results[1] ?? null
        ]);
      } catch (e) {
        if (!active) return;
        console.error(e);
        setError(true);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchComparisonData();

    return () => {
      active = false;
    };
  }, [comparison, retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  if (isLoading) {
    return (
      <main className="compare-page">
        <p className="compare-eyebrow">Retrieving data</p>
        <h1 className="compare-title">Loading Comparison...</h1>
        <section className="compare-stage">
          <div className="compare-panel skeleton" style={{ height: '380px' }} />
          <div className="compare-vs-badge">VS</div>
          <div className="compare-panel skeleton" style={{ height: '380px' }} />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="compare-page">
        <p className="compare-eyebrow">Connection Error</p>
        <h1 className="compare-title">Failed to Load</h1>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ErrorState onRetry={handleRetry} />
        </div>
      </main>
    );
  }

  if (comparison.length === 0) {
    return (
      <main className="compare-page">
        <p className="compare-eyebrow">Compare Pokémon</p>
        <h1 className="compare-title">No Pokémon Selected</h1>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <EmptyState 
            title="Comparison stage is empty." 
            text="Go to the Pokédex and click 'Compare' on any two Pokémon to see their stats side-by-side." 
            action={true}
          />
        </div>
      </main>
    );
  }

  const [leftPokemon, rightPokemon] = pokemonList;
  const leftColor = leftPokemon ? getTypeColor(leftPokemon.types[0].type.name) : 'var(--color-border)';
  const rightColor = rightPokemon ? getTypeColor(rightPokemon.types[0].type.name) : 'var(--color-border)';

  return (
    <main className="compare-page">
      <p className="compare-eyebrow">Choose your champions</p>
      <h1 className="compare-title">Compare Pokémon</h1>

      {/* Comparison Stage */}
      <section className="compare-stage">
        
        {/* Left Pokemon / Empty Slot */}
        {leftPokemon ? (
          <article className="compare-panel" style={{ '--card-type-color': leftColor } as React.CSSProperties}>
            <span className="compare-glow" aria-hidden="true" />
            <span className="compare-id">{formatPokemonId(leftPokemon.id)}</span>
            <button
              className="compare-remove"
              onClick={() => removeFromComparison(leftPokemon.id)}
              aria-label={`Remove ${formatPokemonName(leftPokemon.name)} from comparison`}
              title="Remove from comparison"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="compare-image-container">
              <img
                className="compare-image"
                src={leftPokemon.sprites.other?.['official-artwork']?.front_default ?? leftPokemon.sprites.front_default ?? ''}
                alt={formatPokemonName(leftPokemon.name)}
              />
            </div>
            <h2 className="compare-name">{formatPokemonName(leftPokemon.name)}</h2>
            <span 
              className="compare-type-badge"
              style={{ backgroundColor: leftColor }}
            >
              {formatPokemonName(leftPokemon.types[0].type.name)}
            </span>
          </article>
        ) : (
          <div className="compare-panel compare-panel--empty">
            <span className="compare-id">#???</span>
            <div className="compare-image-container">
              <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                <span style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.2)' }}>?</span>
              </div>
            </div>
            <h2 className="compare-name" style={{ color: 'var(--color-text-tertiary)' }}>Empty Slot</h2>
            <span className="compare-type-badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text-tertiary)' }}>
              No Selection
            </span>
          </div>
        )}

        {/* VS Badge */}
        <div className="compare-vs-badge">VS</div>

        {/* Right Pokemon / Empty Slot */}
        {rightPokemon ? (
          <article className="compare-panel" style={{ '--card-type-color': rightColor } as React.CSSProperties}>
            <span className="compare-glow" aria-hidden="true" />
            <span className="compare-id">{formatPokemonId(rightPokemon.id)}</span>
            <button
              className="compare-remove"
              onClick={() => removeFromComparison(rightPokemon.id)}
              aria-label={`Remove ${formatPokemonName(rightPokemon.name)} from comparison`}
              title="Remove from comparison"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="compare-image-container">
              <img
                className="compare-image"
                src={rightPokemon.sprites.other?.['official-artwork']?.front_default ?? rightPokemon.sprites.front_default ?? ''}
                alt={formatPokemonName(rightPokemon.name)}
              />
            </div>
            <h2 className="compare-name">{formatPokemonName(rightPokemon.name)}</h2>
            <span 
              className="compare-type-badge"
              style={{ backgroundColor: rightColor }}
            >
              {formatPokemonName(rightPokemon.types[0].type.name)}
            </span>
          </article>
        ) : (
          <div className="compare-panel compare-panel--empty">
            <span className="compare-id">#???</span>
            <div className="compare-image-container">
              <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                <span style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.2)' }}>?</span>
              </div>
            </div>
            <h2 className="compare-name" style={{ color: 'var(--color-text-tertiary)' }}>Empty Slot</h2>
            <span className="compare-type-badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text-tertiary)' }}>
              No Selection
            </span>
          </div>
        )}

      </section>

      {/* Comparison Statistics */}
      {leftPokemon && rightPokemon ? (
        <section className="compare-stats-section">
          <p className="compare-section-title">Head to Head</p>
          <h2 className="compare-section-heading">Statistics</h2>

          <div className="compare-stats-list">
            {COMPARE_STATS.map((stat) => {
              const leftVal = leftPokemon.stats.find((s) => s.stat.name === stat)?.base_stat ?? 0;
              const rightVal = rightPokemon.stats.find((s) => s.stat.name === stat)?.base_stat ?? 0;
              const maxStat = 255;
              const leftPct = Math.min((leftVal / maxStat) * 100, 100);
              const rightPct = Math.min((rightVal / maxStat) * 100, 100);

              return (
                <div className="compare-stat-row" key={stat}>
                  <p className="compare-stat-name">{formatPokemonName(stat)}</p>
                  <div className="compare-stat-bar-container">
                    <span className="compare-stat-value">{leftVal}</span>
                    <div className="compare-stat-bar-wrapper">
                      <div
                        className="compare-stat-bar-left"
                        style={{ width: `${leftPct}%`, backgroundColor: leftColor }}
                      />
                      <div
                        className="compare-stat-bar-right"
                        style={{ width: `${rightPct}%`, backgroundColor: rightColor }}
                      />
                    </div>
                    <span className="compare-stat-value">{rightVal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="compare-stats-section" style={{ textAlign: 'center', padding: '48px' }}>
          <p className="compare-section-title">Awaiting Contenders</p>
          <h2 className="compare-section-heading" style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Select another Pokémon</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            Add a second Pokémon from the Pokédex to activate the head-to-head comparison bar.
          </p>
        </section>
      )}

    </main>
  );
}
