import type { Pokemon } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import './PokemonCard.css';

interface Props { pokemon: Pokemon[]; favorites: string[]; comparison: string[]; onToggleFavorite: (name: string) => void; onToggleComparison: (name: string) => void; }
export function PokemonGrid({ pokemon, favorites, comparison, onToggleFavorite, onToggleComparison }: Props) {
  return <div className="pokemon-grid">{pokemon.map(item => <PokemonCard key={item.name} pokemon={item} isFavorite={favorites.includes(item.name)} onToggleFavorite={() => onToggleFavorite(item.name)} isCompareSelected={comparison.includes(item.name)} compareDisabled={!comparison.includes(item.name) && comparison.length >= 2} onToggleCompare={() => onToggleComparison(item.name)} />)}</div>;
}
