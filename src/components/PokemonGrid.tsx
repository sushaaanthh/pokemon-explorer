import type { Pokemon } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import './PokemonCard.css';

interface Props {
  pokemon: Pokemon[];
  /** Optional override for the compare action when rendered inside /compare */
  onSelect?: (id: number) => void;
}

export function PokemonGrid({ pokemon, onSelect }: Props) {
  return (
    <div className="pokemon-grid">
      {pokemon.map(item => (
        <PokemonCard key={item.name} pokemon={item} onSelect={onSelect} />
      ))}
    </div>
  );
}