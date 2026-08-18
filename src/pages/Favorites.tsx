import { useEffect, useState, useCallback } from 'react';
import type { Pokemon } from '../types/pokemon';
import { getPokemon } from '../services/pokemonApi';
import { PokemonGrid } from '../components/PokemonGrid';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { useAppState } from '../context/AppStateContext';
import './pages.css';

export function Favorites() {
  const { favorites } = useAppState();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (favorites.length === 0) {
      setPokemon([]);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const results = await Promise.all(
        favorites.map((id) => getPokemon(id))
      );
      setPokemon(results);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  if (loading) {
    return (
      <main className="page subpage">
        <p className="eyebrow">Your collection</p>
        <h1>Your Favorites</h1>
        <p className="subpage__lead">Loading your collection…</p>
        <div className="grid-wrap"><LoadingSkeleton /></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page subpage">
        <p className="eyebrow">Your collection</p>
        <h1>Your Favorites</h1>
        <p className="subpage__lead">Something went wrong.</p>
        <ErrorState onRetry={loadFavorites} />
      </main>
    );
  }

  return (
    <main className="page subpage">
      <p className="eyebrow">Your collection</p>
      <h1>Your Favorites</h1>
      {pokemon.length > 0 ? (
        <>
          <p className="subpage__lead">{pokemon.length} Pokémon collected</p>
          <div className="grid-wrap"><PokemonGrid pokemon={pokemon} /></div>
        </>
      ) : (
        <EmptyState
          title="No Favorites Yet"
          text="Start building your collection by saving Pokémon you love."
          action
        />
      )}
    </main>
  );
}
