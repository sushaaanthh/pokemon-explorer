import type { Pokemon, PokemonListResponse } from '../types/pokemon';

const API_BASE = 'https://pokeapi.co/api/v2';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function getPokemonList(
  limit = 20,
  offset = 0
): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(
    `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`
  );
}

export async function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  return fetchJson<Pokemon>(`${API_BASE}/pokemon/${nameOrId}`);
}

export async function getPokemonByType(type: string): Promise<Pokemon[]> {
  const data = await fetchJson<{
    pokemon: { pokemon: { name: string; url: string } }[];
  }>(`${API_BASE}/type/${type}`);

  const promises = data.pokemon.slice(0, 40).map(entry =>
    getPokemon(entry.pokemon.name)
  );
  return Promise.all(promises);
}
