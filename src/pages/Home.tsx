import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { PokemonTypeName, SortOption, Pokemon } from '../types/pokemon';
import { SearchBar } from '../components/SearchBar';
import { TypeFilter } from '../components/TypeFilter';
import { SortSelect } from '../components/SortSelect';
import { PokemonGrid } from '../components/PokemonGrid';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { getPokemonList, getPokemonDetailsBatch, getPokemon, getPokemonNamesByType } from '../services/pokemonApi';
import pokeballImage from '../assets/branding/pokeball.png';
import './pages.css';

export function Home() {
  const location = useLocation();
  const [mode, setMode] = useState<'all' | 'search' | 'type'>('all');

  // 'all' mode state
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [allOffset, setAllOffset] = useState(0);
  const [allHasMore, setAllHasMore] = useState(true);
  const [allTotalCount, setAllTotalCount] = useState(0);

  // 'search' mode state
  const [searchPokemon, setSearchPokemon] = useState<Pokemon[]>([]);

  // 'type' mode state
  const [selectedType, setSelectedType] = useState<PokemonTypeName | null>(null);
  const [typePokemonNames, setTypePokemonNames] = useState<string[]>([]);
  const [typePokemonDetailed, setTypePokemonDetailed] = useState<Pokemon[]>([]);
  const [typeOffset, setTypeOffset] = useState(0);

  // UI controller values
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('id');

  // Restore search/filter state from URL param or location.state
  // Preserves state when navigating to Details and returning
  useEffect(() => {
    // Priority 1: restore from location.state (Details → Home back navigation)
    if (location.state?.query && location.state?.mode === 'search') {
      setQuery(location.state.query);
      setMode('search');
    }
    // Priority 2: restore from URL ?q= param (reload, bookmark, etc.)
    else if (location.search && mode === 'all') {
      const urlParams = new URLSearchParams(location.search);
      const savedQuery = urlParams.get('q') ?? '';
      if (savedQuery && savedQuery !== query) {
        setQuery(savedQuery);
        setMode('search');
      }
    }
  }, [location.state, location.search, query, mode]);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);

  const isMounted = useRef(true);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, []);

  // Fetch initial 'all' list
  const fetchAllInitial = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const listResponse = await getPokemonList(20, 0);
      if (!isMounted.current) return;

      const detailResponses = await getPokemonDetailsBatch(
        listResponse.results.map(item => item.name)
      );
      if (!isMounted.current) return;

      setAllPokemon(detailResponses);
      setAllOffset(20);
      setAllHasMore(!!listResponse.next);
      setAllTotalCount(listResponse.count);
      setMode('all');
    } catch {
      if (!isMounted.current) return;
      setError(true);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch type list and its initial batch
  const fetchTypeInitial = useCallback(async (type: PokemonTypeName) => {
    setIsLoading(true);
    setError(false);
    try {
      const names = await getPokemonNamesByType(type);
      if (!isMounted.current) return;

      setTypePokemonNames(names);

      // Fetch first 20 details
      const initialNames = names.slice(0, 20);
      const detailResponses = await getPokemonDetailsBatch(initialNames);
      if (!isMounted.current) return;

      setTypePokemonDetailed(detailResponses);
      setTypeOffset(20);
      setMode('type');
    } catch {
      if (!isMounted.current) return;
      setError(true);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const fetchAllInitialRef = useRef(fetchAllInitial);
  fetchAllInitialRef.current = fetchAllInitial;

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!isMounted.current) return;

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setMode('all');
      setAllPokemon(prev => prev.length === 0 ? [] : prev);
      return;
    }

    setIsLoading(true);
    setError(false);
    setSelectedType(null);
    try {
      const searchParam = isNaN(Number(trimmed)) ? trimmed.toLowerCase() : Number(trimmed);
      const result = await getPokemon(searchParam);

      setSearchPokemon([result]);
      setMode('search');
    } catch {
      setSearchPokemon([]);
      setError(true);
      setMode('search');
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        const url = new URL(window.location.href);
        const currentQuery = query.trim();
        if (currentQuery) {
          url.searchParams.set('q', currentQuery);
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, document.title, url);
      }
    }
  }, [query]);

  // Load first page of 'all' on mount
  useEffect(() => {
    fetchAllInitial();
  }, [fetchAllInitial]);

  // Handle Search Input submissions (debounced)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    if (query !== '') {
      searchTimeoutRef.current = window.setTimeout(() => {
        searchTimeoutRef.current = null;
        performSearch(query);
      }, 300);
    } else {
      setMode('all');
    }
    // Cleanup timeout on unmount or when query changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [query, performSearch]);

  // Handle Type Filter clicks
  const handleTypeSelect = useCallback((type: PokemonTypeName | null) => {
    setSelectedType(type);
    setQuery('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    if (type === null) {
      setMode('all');
    } else {
      fetchTypeInitial(type);
    }
  }, [fetchTypeInitial]);

  // Load More logic
  const loadMoreData = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreError(false);

    try {
      if (mode === 'all') {
        const listResponse = await getPokemonList(20, allOffset);
        if (!isMounted.current) return;

        const detailResponses = await getPokemonDetailsBatch(
          listResponse.results.map(item => item.name)
        );
        if (!isMounted.current) return;

        setAllPokemon(prev => [...prev, ...detailResponses]);
        setAllOffset(prev => prev + 20);
        setAllHasMore(!!listResponse.next);
      } else if (mode === 'type') {
        const nextBatchNames = typePokemonNames.slice(typeOffset, typeOffset + 20);
        const detailResponses = await getPokemonDetailsBatch(nextBatchNames);
        if (!isMounted.current) return;

        setTypePokemonDetailed(prev => [...prev, ...detailResponses]);
        setTypeOffset(prev => prev + 20);
      }
    } catch {
      if (!isMounted.current) return;
      setLoadMoreError(true);
    } finally {
      if (isMounted.current) {
        setIsLoadingMore(false);
      }
    }
  }, [mode, allOffset, typeOffset, typePokemonNames, isLoadingMore]);

  // Retry handlers
  const handleInitialRetry = useCallback(() => {
    if (mode === 'all') {
      fetchAllInitial();
    } else if (mode === 'type' && selectedType) {
      fetchTypeInitial(selectedType);
    } else if (mode === 'search' && query) {
      performSearch(query);
    }
  }, [mode, selectedType, query, fetchAllInitial, fetchTypeInitial, performSearch]);

  const handleLoadMoreRetry = useCallback(() => {
    loadMoreData();
  }, [loadMoreData]);

  // Reset function to clear query/type and restore all listing
  const handleClearAllFilters = useCallback(() => {
    setQuery('');
    setSelectedType(null);
    setMode('all');
    setSearchPokemon([]);
  }, []);

  // Derived state: Total Count & hasMore
  const totalCount = useMemo(() => {
    if (mode === 'all') return allTotalCount;
    if (mode === 'type') return typePokemonNames.length;
    if (mode === 'search') return searchPokemon.length;
    return 0;
  }, [mode, allTotalCount, typePokemonNames.length, searchPokemon.length]);

  const hasMore = useMemo(() => {
    if (mode === 'all') return allHasMore;
    if (mode === 'type') return typeOffset < typePokemonNames.length;
    return false; // Search has no load more
  }, [mode, allHasMore, typeOffset, typePokemonNames.length]);

  // Derived state: sorted/filtered dataset to display
  const displayedPokemon = useMemo(() => {
    let list: Pokemon[] = [];
    if (mode === 'all') {
      list = allPokemon;
    } else if (mode === 'type') {
      list = typePokemonDetailed;
    } else if (mode === 'search') {
      list = searchPokemon;
    }

    return [...list].sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
      if (sort === 'id') {
        return a.id - b.id;
      }
      // For stats (hp, attack, speed, etc.)
      const aStat = a.stats.find(s => s.stat.name === sort)?.base_stat ?? 0;
      const bStat = b.stats.find(s => s.stat.name === sort)?.base_stat ?? 0;
      return bStat - aStat; // Descending for stats
    });
  }, [mode, allPokemon, typePokemonDetailed, searchPokemon, sort]);

  return (
    <main className="page" id="main-content">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Your digital Pokédex</p>
          <h1 className="hero__title">
            <span>Pokémon</span>
            <span>Explorer</span>
          </h1>
          <p className="hero__text">
            Explore Pokémon, inspect their stats, filter by type, and build your own collection.
          </p>
          <SearchBar onSearch={setQuery} onClear={handleClearAllFilters} />
        </div>
          <div className="hero__feature">
            <div className="hero-pokeball">
              <span className="hero-pokeball__glow" aria-hidden="true" />
              <img src={pokeballImage} alt="Poké Ball" className="hero-pokeball__image" decoding="async" fetchPriority="high" width="450" height="450" />
            </div>
          </div>
      </section>

      <section className="browse">
        <div className="section-head">
          <div>
            <p className="eyebrow">Explore the Pokédex</p>
            <h2>Discover Pokémon</h2>
          </div>
          <div className="browse__controls">
            <span>{totalCount.toLocaleString()} results</span>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>
        <TypeFilter selected={selectedType} onSelect={handleTypeSelect} />
        
        <div className="grid-wrap">
          {isLoading && <LoadingSkeleton />}
          
          {!isLoading && error && (
            <div className="browse-error-container">
              {mode === 'search' ? (
                <EmptyState
                  title="No Pokémon found."
                  text={`We couldn't find any Pokémon matching "${query}".`}
                  action={false}
                />
              ) : (
                <ErrorState onRetry={handleInitialRetry} />
              )}
              <div className="state-action-center">
                <button className="state__action" onClick={handleClearAllFilters} type="button">
                  Back to Pokédex
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && displayedPokemon.length === 0 && (
            <div className="browse-empty-container">
              <EmptyState title="No Pokémon found." text="Try adjusting your filters or search query." action={false} />
              <div className="state-action-center">
                <button className="state__action" onClick={handleClearAllFilters} type="button">
                  Reset Filters
                </button>
              </div>
            </div>
          )}
          
          {!isLoading && !error && displayedPokemon.length > 0 && (
            <PokemonGrid
              pokemon={displayedPokemon}
              linkState={{
                query,
                mode,
                selectedType: selectedType,
              }}
            />
          )}
        </div>

        {/* Load More / Loading / Error footer */}
        {!isLoading && !error && displayedPokemon.length > 0 && (
          <div className="browse__load-more-container">
            {isLoadingMore && <LoadingSkeleton />}

            {loadMoreError && (
              <div className="load-more-error">
                <p className="load-more-error__text">
                  Couldn't load more Pokémon.
                </p>
                <button className="state__action" onClick={handleLoadMoreRetry} type="button">
                  Retry
                </button>
              </div>
            )}

            {!isLoadingMore && !loadMoreError && hasMore && (
              <button className="load-more" onClick={loadMoreData} type="button">
                Load More
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
