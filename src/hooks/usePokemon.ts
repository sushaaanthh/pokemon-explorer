import { useState, useEffect, useCallback, useRef } from 'react';
import type { Pokemon, SortOption, PokemonTypeName } from '../types/pokemon';
import { getPokemonList, getPokemon, getPokemonByType } from '../services/pokemonApi';

const PAGE_SIZE = 20;

export function usePokemon() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<SortOption>('id');
  const [typeFilter, setTypeFilter] = useState<PokemonTypeName | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Pokemon | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const offsetRef = useRef(0);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeFilter) {
        const results = await getPokemonByType(typeFilter);
        setPokemon(results);
        setHasMore(false);
      } else {
        offsetRef.current = 0;
        const list = await getPokemonList(PAGE_SIZE, 0);
        const details = await Promise.all(
          list.results.map(item => getPokemon(item.name))
        );
        setPokemon(details);
        offsetRef.current = PAGE_SIZE;
        setHasMore(list.next !== null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Pokémon');
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || typeFilter) return;
    setLoadingMore(true);
    try {
      const list = await getPokemonList(PAGE_SIZE, offsetRef.current);
      const details = await Promise.all(
        list.results.map(item => getPokemon(item.name))
      );
      setPokemon(prev => [...prev, ...details]);
      offsetRef.current += PAGE_SIZE;
      setHasMore(list.next !== null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, typeFilter]);

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim().toLowerCase();
    setSearchQuery(trimmed);
    if (!trimmed) {
      setSearchResult(null);
      setSearchError(null);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const result = await getPokemon(trimmed);
      setSearchResult(result);
    } catch {
      setSearchResult(null);
      setSearchError('No Pokémon found.');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResult(null);
    setSearchError(null);
  }, []);

  const sortPokemon = useCallback(
    (list: Pokemon[]): Pokemon[] => {
      const sorted = [...list];
      switch (sort) {
        case 'name':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'attack':
          sorted.sort(
            (a, b) =>
              (b.stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0) -
              (a.stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0)
          );
          break;
        case 'speed':
          sorted.sort(
            (a, b) =>
              (b.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0) -
              (a.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0)
          );
          break;
        case 'hp':
          sorted.sort(
            (a, b) =>
              (b.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0) -
              (a.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0)
          );
          break;
        case 'id':
        default:
          sorted.sort((a, b) => a.id - b.id);
      }
      return sorted;
    },
    [sort]
  );

  const displayPokemon = sortPokemon(pokemon);

  return {
    pokemon: displayPokemon,
    loading,
    loadingMore,
    error,
    hasMore,
    sort,
    setSort,
    typeFilter,
    setTypeFilter,
    searchQuery,
    searchResult,
    searchLoading,
    searchError,
    search,
    clearSearch,
    loadMore,
    retry: fetchInitial,
  };
}
