import { Link } from 'react-router-dom';
import type { Pokemon } from '../types/pokemon';
import { getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonId } from '../utils/formatPokemonId';
import { formatPokemonName } from '../utils/formatPokemonName';
import './PokemonCard.css';
export function FeaturedPokemon({ pokemon }: { pokemon: Pokemon }) { const type = pokemon.types[0].type.name; const art = pokemon.sprites.other?.['official-artwork']?.front_default; return <Link to={`/pokemon/${pokemon.name}`} className="featured" style={{ '--card-type-color': getTypeColor(type) } as React.CSSProperties}><span className="featured__id">{formatPokemonId(pokemon.id)}</span><span className="featured__label">Featured Pokémon</span><img src={art ?? ''} alt={pokemon.name} /><div><span className="featured__type">{formatPokemonName(type)}</span><h2>{formatPokemonName(pokemon.name)}</h2></div></Link>; }
