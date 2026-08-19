import { useEffect, useState, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { Pokemon, PokemonTypeName } from '../types/pokemon';
import { getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonId } from '../utils/formatPokemonId';
import { formatPokemonName } from '../utils/formatPokemonName';
import { getPokemon, getPokemonList, getPokemonDetailsBatch, getPokemonNamesByType } from '../services/pokemonApi';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SearchBar } from '../components/SearchBar';
import { TypeFilter } from '../components/TypeFilter';
import { PokemonGrid } from '../components/PokemonGrid';
import { useAppState } from '../context/AppStateContext';
import './pages.css';
import './Comparison.css';

const COMPARE_STATS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const SELECTION_PAGE_SIZE = 20;

export function Comparison() {
  const { comparison, removeFromComparison, setComparisonSlot, clearComparison } = useAppState();
  const [pokemonList, setPokemonList] = useState<(Pokemon | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // In-page selection state: 'free' for explore mode, 0|1 for slot replacement
  const [selectionMode, setSelectionMode] = useState<'free' | 0 | 1 | null>(null);
  const [selectionPokemon, setSelectionPokemon] = useState<Pokemon[]>([]);
  const [selectionOffset, setSelectionOffset] = useState(0);
  const [selectionHasMore, setSelectionHasMore] = useState(true);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [selectionLoadingMore, setSelectionLoadingMore] = useState(false);
  const [selectionError, setSelectionError] = useState(false);
  const [selectionSearchResults, setSelectionSearchResults] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PokemonTypeName | null>(null);

  // Type-filtered selection state — reuses the same API approach as the Dex (Home)
  const [typePokemonDetailed, setTypePokemonDetailed] = useState<Pokemon[]>([]);
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const [typeOffset, setTypeOffset] = useState(0);
  const [typeHasMore, setTypeHasMore] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);
  const [typeError, setTypeError] = useState(false);
  const [typeLoadingMore, setTypeLoadingMore] = useState(false);
  const [typeLoadMoreError, setTypeLoadMoreError] = useState(false);
  const [selectionLoadMoreError, setSelectionLoadMoreError] = useState(false);

  // Fetch comparison data when slots change
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
      } catch {
        if (!active) return;
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

  // Fetch all Pokémon of a selected type — same API approach as the Dex (Home)
  const fetchTypeData = useCallback(() => {
    if (!selectedType) return;

    setTypeLoading(true);
    setTypeError(false);
    setTypePokemonDetailed([]);
    setTypeNames([]);
    setTypeOffset(0);
    setTypeHasMore(false);

    getPokemonNamesByType(selectedType)
      .then(async names => {
        setTypeNames(names);
        const initialNames = names.slice(0, SELECTION_PAGE_SIZE);
        const details = await getPokemonDetailsBatch(initialNames);
        setTypePokemonDetailed(details);
        setTypeOffset(SELECTION_PAGE_SIZE);
        setTypeHasMore(names.length > SELECTION_PAGE_SIZE);
      })
      .catch(() => {
        setTypeError(true);
      })
      .finally(() => {
        setTypeLoading(false);
      });
  }, [selectedType]);

  // Re-fetch type data when the selected type changes
  useEffect(() => {
    if (!selectedType) {
      setTypePokemonDetailed([]);
      setTypeNames([]);
      return;
    }
    fetchTypeData();
  }, [selectedType, fetchTypeData]);

  // Shared preload logic for the selection interface
  const preloadSelection = useCallback(() => {
    setSearchQuery('');
    setSelectionSearchResults([]);
    setTypeLoadMoreError(false);
    setSelectionLoadMoreError(false);
    // Preload the first page if not yet loaded
    if (selectionPokemon.length === 0 && !selectionLoading) {
      setSelectionLoading(true);
      setSelectionError(false);
      getPokemonList(SELECTION_PAGE_SIZE, 0)
        .then(async listResponse => {
          const detailResponses = await getPokemonDetailsBatch(
            listResponse.results.map(item => item.name)
          );
          setSelectionPokemon(detailResponses);
          setSelectionOffset(SELECTION_PAGE_SIZE);
          setSelectionHasMore(!!listResponse.next);
        })
        .catch(() => {
          setSelectionError(true);
        })
        .finally(() => {
          setSelectionLoading(false);
        });
    }
  }, [selectionPokemon.length, selectionLoading]);

  // Open the selection interface for a specific slot (replace flow)
  const openSelection = useCallback((slot: 0 | 1) => {
    setSelectionMode(slot);
    preloadSelection();
  }, [preloadSelection]);

  // Open the selection interface in free-selection mode (explore flow)
  const openFreeSelection = useCallback(() => {
    setSelectionMode('free');
    preloadSelection();
  }, [preloadSelection]);

  // Load more selection pokemon
  const loadMoreSelection = useCallback(async () => {
    setTypeLoadMoreError(false);
    setSelectionLoadMoreError(false);

    // Type-filtered mode: load more from the type's name list (same as the Dex)
    if (selectedType && !searchQuery) {
      if (typeLoadingMore || !typeHasMore) return;
      setTypeLoadingMore(true);
      try {
        const nextBatchNames = typeNames.slice(typeOffset, typeOffset + SELECTION_PAGE_SIZE);
        const detailResponses = await getPokemonDetailsBatch(nextBatchNames);
        setTypePokemonDetailed(prev => [...prev, ...detailResponses]);
        setTypeOffset(prev => prev + SELECTION_PAGE_SIZE);
        setTypeHasMore(typeNames.length > typeOffset + SELECTION_PAGE_SIZE);
      } catch {
        setTypeLoadMoreError(true);
      } finally {
        setTypeLoadingMore(false);
      }
      return;
    }

    // General list mode: load more from the paginated list endpoint
    if (selectionLoadingMore || !selectionHasMore) return;
    setSelectionLoadingMore(true);
    try {
      const listResponse = await getPokemonList(SELECTION_PAGE_SIZE, selectionOffset);
      const detailResponses = await getPokemonDetailsBatch(
        listResponse.results.map(item => item.name)
      );
      setSelectionPokemon(prev => [...prev, ...detailResponses]);
      setSelectionOffset(prev => prev + SELECTION_PAGE_SIZE);
      setSelectionHasMore(!!listResponse.next);
    } catch {
      setSelectionLoadMoreError(true);
    } finally {
      setSelectionLoadingMore(false);
    }
  }, [selectionOffset, selectionHasMore, selectionLoadingMore, selectedType, searchQuery, typeNames, typeOffset, typeHasMore, typeLoadingMore]);

  // Search within comparison selection
  const handleSelectionSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    setSearchQuery(trimmed);
    if (!trimmed) {
      setSelectionSearchResults([]);
      return;
    }

    setSelectionLoading(true);
    setSelectionError(false);
    try {
      const searchParam = isNaN(Number(trimmed)) ? trimmed.toLowerCase() : Number(trimmed);
      const result = await getPokemon(searchParam);
      setSelectionSearchResults([result]);
    } catch {
      setSelectionSearchResults([]);
      setSelectionError(true);
    } finally {
      setSelectionLoading(false);
    }
  }, []);

  // Select a pokemon for the active slot (slot-replacement mode only)
  const handleSelectPokemon = useCallback((id: number) => {
    if (selectionMode === null || selectionMode === 'free') return;
    setComparisonSlot(selectionMode, id);
    setSelectionMode(null);
  }, [selectionMode, setComparisonSlot]);

  // Remove a pokemon from comparison by slot
  const handleRemoveSlot = useCallback((slotIndex: 0 | 1) => {
    const pokemon = pokemonList[slotIndex];
    if (pokemon) {
      removeFromComparison(pokemon.id);
    }
  }, [pokemonList, removeFromComparison]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Compute active data source and loading/error/hasMore states
  const isSearching = searchQuery !== '';
  const isListLoading = isSearching
    ? selectionLoading
    : selectedType
      ? typeLoading
      : selectionLoading;
  const isListError = isSearching
    ? selectionError
    : selectedType
      ? typeError
      : selectionError;
  const hasMore = isSearching
    ? false
    : selectedType
      ? typeHasMore
      : selectionHasMore;
  const isLoadingMore = isSearching
    ? false
    : selectedType
      ? typeLoadingMore
      : selectionLoadingMore;

  const displayedSelection = useMemo(() => {
    // When searching, use search results (optionally filter by type)
    if (searchQuery !== '') {
      if (!selectedType) return selectionSearchResults;
      return selectionSearchResults.filter(p =>
        p.types.some(t => t.type.name === selectedType)
      );
    }

    // When a type is selected (no search), use type-filtered API results
    if (selectedType) {
      return typePokemonDetailed;
    }

    // Otherwise, use the general list
    return selectionPokemon;
  }, [searchQuery, selectionSearchResults, selectedType, typePokemonDetailed, selectionPokemon]);

  // -------- Selection interface view --------
  if (selectionMode !== null) {
    const isFreeMode = selectionMode === 'free';
    const slotLabel = isFreeMode
      ? null
      : selectionMode === 0 ? 'Pokémon A' : 'Pokémon B';
    const eyebrow = isFreeMode ? 'Explore Pokémon' : `Choose ${slotLabel}`;

    return (
      <main className="compare-page">
        <p className="compare-eyebrow">{eyebrow}</p>
        <h1 className="compare-title">Select Pokémon</h1>

        <div className="compare-selection">
          <div className="compare-selection__search">
            <SearchBar onSearch={handleSelectionSearch} onClear={() => handleSelectionSearch('')} />
          </div>

          <div className="compare-selection__filters">
            <TypeFilter selected={selectedType} onSelect={setSelectedType} />
          </div>

          {isListLoading && !displayedSelection.length && <LoadingSkeleton />}

          {!isListLoading && isListError && displayedSelection.length === 0 && (
            <div className="compare-selection__state">
              <ErrorState
                onRetry={() => {
                  if (selectedType && !searchQuery) {
                    fetchTypeData();
                  } else {
                    if (selectionMode === 'free') openFreeSelection();
                    else if (selectionMode !== null) openSelection(selectionMode);
                  }
                }}
              />
            </div>
          )}

          {!isListLoading && !isListError && displayedSelection.length === 0 && (
            <div className="compare-selection__state">
              <EmptyState
                title="No Pokémon found."
                text="Try adjusting your search query or type filter."
                action={false}
              />
            </div>
          )}

          {!isListLoading && !isListError && displayedSelection.length > 0 && (
            <>
              <PokemonGrid
                pokemon={displayedSelection}
                onSelect={isFreeMode ? undefined : handleSelectPokemon}
                linkState={{ from: '/compare' }}
              />
              {!searchQuery && hasMore && (
                <div className="compare-selection__load-more">
                  {(selectedType && typeLoadMoreError) || (!selectedType && selectionLoadMoreError) ? (
                    <div className="compare-page-center">
                      <p className="load-more-error__text">
                        Couldn't load more Pokémon.
                      </p>
                      <button className="state__action" onClick={loadMoreSelection}>
                        Retry
                      </button>
                    </div>
                  ) : (
                    <button
                      className="load-more"
                      onClick={loadMoreSelection}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? 'Loading…' : 'Load More'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          <div className="compare-selection__popover">
            <button
              className="compare-selection__cancel"
              onClick={() => {
                clearComparison();
                setSelectionMode(null);
              }}
            >
              ← Cancel
            </button>
            {isFreeMode && comparison.length === 2 && (
              <button
                className="state__action"
                onClick={() => setSelectionMode(null)}
              >
                COMPARE
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // -------- Loading state --------
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

  // -------- Error state --------
  if (error) {
    return (
      <main className="compare-page">
        <p className="compare-eyebrow">Connection Error</p>
        <h1 className="compare-title">Failed to Load</h1>
        <div className="compare-page-center">
          <ErrorState onRetry={handleRetry} />
        </div>
      </main>
    );
  }

  const [leftPokemon, rightPokemon] = pokemonList;
  const leftColor = leftPokemon ? getTypeColor(leftPokemon.types[0].type.name) : 'var(--color-border)';
  const rightColor = rightPokemon ? getTypeColor(rightPokemon.types[0].type.name) : 'var(--color-border)';

  // -------- Empty state (no comparison selections) --------
  if (comparison.length === 0) {
    return (
      <main className="compare-page">
        <p className="compare-eyebrow">Compare Pokémon</p>
        <h1 className="compare-title">No Pokémon Selected</h1>
        <div className="compare-page-center">
          <EmptyState
            title="Comparison stage is empty."
            text="Choose two Pokémon to see their stats side-by-side."
            action={true}
            onAction={() => openFreeSelection()}
          />
        </div>
      </main>
    );
  }

  // -------- Comparison view with slots --------
  return (
    <main className="compare-page">
      <p className="compare-eyebrow">Choose your champions</p>
      <h1 className="compare-title">Compare Pokémon</h1>

      {/* Comparison Stage */}
      <section className="compare-stage">
        <div className="compare-stage__header">
          <h2 className="compare-stage__heading">Comparison Stage</h2>
          <button className="compare-clear" onClick={() => { clearComparison(); }} disabled={comparison.length === 0}>
            Clear Comparison
          </button>
        </div>

        {/* Left Pokemon / Empty Slot */}
        {leftPokemon ? (
          <article
            className="compare-panel"
            style={{ '--card-type-color': leftColor } as CSSProperties}
            role="button"
            tabIndex={0}
            onClick={() => openSelection(0)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openSelection(0);
              }
            }}
          >
            <span className="compare-glow" aria-hidden="true" />
            <span className="compare-id">{formatPokemonId(leftPokemon.id)}</span>
            <button
              className="compare-remove"
              onClick={e => {
                e.stopPropagation();
                handleRemoveSlot(0);
              }}
              aria-label={`Remove ${formatPokemonName(leftPokemon.name)} from comparison`}
              title="Remove from comparison"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <button className="compare-replace" aria-label={`Replace ${formatPokemonName(leftPokemon.name)}`} title="Change Pokémon" onClick={() => openSelection(0)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
            <div className="compare-image-container">
              <img
                className="compare-image"
                src={leftPokemon.sprites.other?.['official-artwork']?.front_default ?? leftPokemon.sprites.front_default ?? ''}
                alt={formatPokemonName(leftPokemon.name)}
                decoding="async"
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
          <article
            className="compare-panel compare-panel--empty"
            role="button"
            tabIndex={0}
            onClick={() => openSelection(0)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openSelection(0);
              }
            }}
            title="Choose Pokémon A"
          >
            <span className="compare-id">#???</span>
            <div className="compare-image-container">
              <div className="compare-empty-slot-placeholder">
                <span className="compare-empty-slot-placeholder__icon">?</span>
              </div>
            </div>
            <h2 className="compare-name compare-empty-slot-name">Choose Pokémon</h2>
            <span className="compare-type-badge compare-empty-slot-badge">
              Tap to select
            </span>
          </article>
        )}

        {/* VS Badge */}
        <div className="compare-vs-badge">VS</div>

        {/* Right Pokemon / Empty Slot */}
        {rightPokemon ? (
          <article
            className="compare-panel"
            style={{ '--card-type-color': rightColor } as CSSProperties}
            role="button"
            tabIndex={0}
            onClick={() => openSelection(1)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openSelection(1);
              }
            }}
          >
            <span className="compare-glow" aria-hidden="true" />
            <span className="compare-id">{formatPokemonId(rightPokemon.id)}</span>
            <button
              className="compare-remove"
              onClick={e => {
                e.stopPropagation();
                handleRemoveSlot(1);
              }}
              aria-label={`Remove ${formatPokemonName(rightPokemon.name)} from comparison`}
              title="Remove from comparison"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <button className="compare-replace" aria-label={`Replace ${formatPokemonName(rightPokemon.name)}`} title="Change Pokémon" onClick={() => openSelection(1)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
            <div className="compare-image-container">
              <img
                className="compare-image"
                src={rightPokemon.sprites.other?.['official-artwork']?.front_default ?? rightPokemon.sprites.front_default ?? ''}
                alt={formatPokemonName(rightPokemon.name)}
                decoding="async"
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
          <article
            className="compare-panel compare-panel--empty"
            role="button"
            tabIndex={0}
            onClick={() => openSelection(1)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openSelection(1);
              }
            }}
            title="Choose Pokémon B"
          >
            <span className="compare-id">#???</span>
            <div className="compare-image-container">
              <div className="compare-empty-slot-placeholder">
                <span className="compare-empty-slot-placeholder__icon">?</span>
              </div>
            </div>
            <h2 className="compare-name compare-empty-slot-name">Choose Pokémon</h2>
            <span className="compare-type-badge compare-empty-slot-badge">
              Tap to select
            </span>
          </article>
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

              let leftClass = 'compare-stat-value';
              let rightClass = 'compare-stat-value';
              let leftBarClass = 'compare-stat-bar-left';
              let rightBarClass = 'compare-stat-bar-right';

              if (leftVal > rightVal) {
                leftClass += ' compare-stat-value--higher';
                rightClass += ' compare-stat-value--lower';
                leftBarClass += ' compare-stat-bar--higher';
              } else if (rightVal > leftVal) {
                rightClass += ' compare-stat-value--higher';
                leftClass += ' compare-stat-value--lower';
                rightBarClass += ' compare-stat-bar--higher';
              } else {
                leftClass += ' compare-stat-value--equal';
                rightClass += ' compare-stat-value--equal';
              }

              return (
                <div className="compare-stat-row" key={stat}>
                  <p className="compare-stat-name">{formatPokemonName(stat)}</p>
                  <div className="compare-stat-bar-container">
                    <span className={leftClass}>{leftVal}</span>
                    <div className="compare-stat-bar-wrapper">
                      <div
                        className={leftBarClass}
                        style={{ width: `${leftPct}%`, backgroundColor: leftColor }}
                      />
                      <div
                        className={rightBarClass}
                        style={{ width: `${rightPct}%`, backgroundColor: rightColor }}
                      />
                    </div>
                    <span className={rightClass}>{rightVal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="compare-stats-section compare-stats-awaiting">
          <p className="compare-section-title">Awaiting Contenders</p>
          <h2 className="compare-section-heading compare-stats-awaiting-heading">Select another Pokémon</h2>
          <button
            className="state__action"
            onClick={() => openFreeSelection()}
          >
            Choose Pokémon
          </button>
          <p className="compare-stats-awaiting-text">
            Select a Pokémon to activate the head-to-head comparison.
          </p>
        </section>
      )}

    </main>
  );
}