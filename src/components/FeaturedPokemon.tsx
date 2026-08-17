import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { Pokemon } from '../types/pokemon';
import { getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonId } from '../utils/formatPokemonId';
import { formatPokemonName } from '../utils/formatPokemonName';
import './PokemonCard.css';

function createFallbackArt(pokemon: Pokemon) {
  const label = formatPokemonName(pokemon.name).toUpperCase();
  const id = formatPokemonId(pokemon.id);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="${label}">
      <defs>
        <radialGradient id="g" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stop-color="#FFD21C" stop-opacity="0.9" />
          <stop offset="60%" stop-color="#FFD21C" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#0A0B0D" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="800" rx="80" fill="none"/>
      <circle cx="400" cy="360" r="250" fill="url(#g)"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#F4F4F0" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="700">${label}</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#FFD21C" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600">${id}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function FeaturedPokemon({ pokemon }: { pokemon: Pokemon }) {
  const type = pokemon.types[0].type.name;
  const art = pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default;
  const [imageError, setImageError] = useState(false);
  const fallbackArt = useMemo(() => createFallbackArt(pokemon), [pokemon]);

  return (
    <Link
      to={`/pokemon/${pokemon.name}`}
      className="featured"
      style={{ '--card-type-color': getTypeColor(type) } as CSSProperties}
    >
      <span className="featured__label">Featured Pokémon</span>
      <span className="featured__id">{formatPokemonId(pokemon.id)}</span>
      <span className="featured__glow" aria-hidden="true" />
      <div className="featured__artwrap" aria-hidden="true">
        <img
          className="featured__art"
          src={imageError ? fallbackArt : (art ?? fallbackArt)}
          alt=""
          onError={() => setImageError(true)}
        />
      </div>
      <div className="featured__content">
        <span className="featured__type">{formatPokemonName(type)}</span>
        <h2>{formatPokemonName(pokemon.name)}</h2>
      </div>
    </Link>
  );
}
