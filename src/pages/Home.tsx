import { useMemo, useState } from 'react';
import type { PokemonTypeName, SortOption } from '../types/pokemon';
import { MOCK_POKEMON } from '../mock/pokemonMockData';
import { SearchBar } from '../components/SearchBar';
import { TypeFilter } from '../components/TypeFilter';
import { SortSelect } from '../components/SortSelect';
import { PokemonGrid } from '../components/PokemonGrid';
import { EmptyState } from '../components/EmptyState';
import pokeballImage from '../assets/branding/pokeball.png';
import './pages.css';

interface Props {
  favorites: string[];
  comparison: string[];
  onToggleFavorite: (name: string) => void;
  onToggleComparison: (name: string) => void;
}

export function Home(props: Props) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<PokemonTypeName | null>(null);
  const [sort, setSort] = useState<SortOption>('id');
  const [shown, setShown] = useState(8);

  const pokemon = useMemo(() => {
    return MOCK_POKEMON
      .filter(p => (!type || p.types.some(t => t.type.name === type)) && p.name.includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'id') return a.id - b.id;
        return (b.stats.find(s => s.stat.name === sort)?.base_stat ?? 0) - (a.stats.find(s => s.stat.name === sort)?.base_stat ?? 0);
      });
  }, [query, type, sort]);

  const featuredPokemon = MOCK_POKEMON.find(p => p.name === 'pikachu') ?? MOCK_POKEMON[0];

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
            <span>{pokemon.length.toLocaleString()} results</span>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>
        <TypeFilter selected={type} onSelect={setType} />
        <div className="grid-wrap">
          {pokemon.length ? <PokemonGrid pokemon={pokemon.slice(0, shown)} {...props} /> : <EmptyState />}
        </div>
        {shown < pokemon.length && (
          <button className="load-more" onClick={() => setShown(value => value + 4)}>
            Load More
          </button>
        )}
      </section>
    </main>
  );
}
