import type { Pokemon } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import './PokemonCard.css';

interface Props {
  pokemon: Pokemon[];
}

export function PokemonGrid({ pokemon }: Props) {
  return (
    <div className="pokemon-grid">
      {pokemon.map(item => (
        <PokemonCard key={item.name} pokemon={item} />
      ))}
    </div>
  );
}