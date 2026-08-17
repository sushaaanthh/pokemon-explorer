import { useEffect, useState, useCallback, useRef } from 'react';
import type { PokemonTypeName, SortOption, Pokemon } from '../types/pokemon';
import { SearchBar } from '../components/SearchBar';
import { TypeFilter } from '../components/TypeFilter';
import { SortSelect } from '../components/SortSelect';
import { PokemonGrid } from '../components/PokemonGrid';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { getPokemonList, getPokemonDetailsBatch } from '../services/pokemonApi';
import pokeballImage from '../assets/branding/pokeball.png';
import './pages.css';

interface Props {
  favorites: string[];
  comparison: string[];
  onToggleFavorite: (name: string) => void;
  onToggleComparison: (name: string) => void;
}

export function Home(props: Props) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // States to keep the UI controls rendering correctly
  const [query, setQuery] = useState('');
  const [type, setType] = useState<PokemonTypeName | null>(null);
  const [sort, setSort] = useState<SortOption>('id');

  // Silence unused variable warning by referencing them for Phase 2 implementation
  useEffect(() => {
    const activeFilters = { query, type, sort };
    if (activeFilters.query || activeFilters.type || activeFilters.sort) {
      // Intended for Phase 2 filters
    }
  }, [query, type, sort]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;
    
    async function load() {
      setIsLoading(true);
      setError(false);
      try {
        const listResponse = await getPokemonList(20, 0);
        if (!active) return;
        
        const detailResponses = await getPokemonDetailsBatch(
          listResponse.results.map(item => item.name)
        );
        if (!active) return;

        setPokemon(detailResponses);
        setOffset(20);
        setHasMore(!!listResponse.next);
        setTotalCount(listResponse.count);
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

    load();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const handleInitialRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Load more
  const loadMoreData = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setLoadMoreError(false);
    try {
      const listResponse = await getPokemonList(20, offset);
      if (!isMounted.current) return;

      const detailResponses = await getPokemonDetailsBatch(
        listResponse.results.map(item => item.name)
      );
      if (!isMounted.current) return;

      setPokemon(prev => [...prev, ...detailResponses]);
      setOffset(prev => prev + 20);
      setHasMore(!!listResponse.next);
    } catch (e) {
      if (!isMounted.current) return;
      console.error(e);
      setLoadMoreError(true);
    } finally {
      if (isMounted.current) {
        setIsLoadingMore(false);
      }
    }
  }, [offset, isLoadingMore, hasMore]);

  const handleLoadMoreRetry = useCallback(() => {
    loadMoreData();
  }, [loadMoreData]);

  return (
    <main className="page">
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
          <SearchBar onSearch={setQuery} onClear={() => setQuery('')} />
        </div>

        <div className="hero__feature">
          <div className="hero-pokeball">
            <span className="hero-pokeball__glow" aria-hidden="true" />
            <img src={pokeballImage} alt="Poké Ball" className="hero-pokeball__image" />
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
        <TypeFilter selected={type} onSelect={setType} />
        
        <div className="grid-wrap">
          {isLoading && <LoadingSkeleton />}
          
          {!isLoading && error && (
            <ErrorState onRetry={handleInitialRetry} />
          )}
          
          {!isLoading && !error && pokemon.length === 0 && (
            <EmptyState />
          )}
          
          {!isLoading && !error && pokemon.length > 0 && (
            <PokemonGrid pokemon={pokemon} {...props} />
          )}
        </div>

        {/* Load More / Loading / Error footer */}
        {!isLoading && !error && pokemon.length > 0 && (
          <div className="browse__load-more-container" style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {isLoadingMore && <LoadingSkeleton />}
            
            {loadMoreError && (
              <div className="load-more-error" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--color-accent)', fontWeight: 'var(--fw-bold)', fontSize: '0.9rem', marginBottom: '12px' }}>
                  Couldn't load more Pokémon.
                </p>
                <button className="state__action" onClick={handleLoadMoreRetry} style={{ margin: 0 }}>
                  Retry
                </button>
              </div>
            )}
            
            {!isLoadingMore && !loadMoreError && hasMore && (
              <button className="load-more" onClick={loadMoreData} style={{ margin: 0 }}>
                Load More
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

