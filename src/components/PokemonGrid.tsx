import type { Pokemon } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';

interface Props {
  pokemon: Pokemon[];
  /** Optional override for the compare action when rendered inside /compare */
  onSelect?: (id: number) => void;
  /** Optional router state passed to the navigation Link (e.g. to remember origin) */
  linkState?: object;
}

export function PokemonGrid({ pokemon, onSelect, linkState }: Props) {
  return (
    <div className="pokemon-grid">
      {pokemon.map(item => (
        <PokemonCard key={item.name} pokemon={item} onSelect={onSelect} linkState={linkState} />
      ))}
    </div>
  );
}