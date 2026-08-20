import type { Pokemon, PokemonListResponse } from '../types/pokemon';

const API_BASE = 'https://pokeapi.co/api/v2';
const CRY_BASE = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest';

const pokemonCache: Record<string, Pokemon> = {};
const inFlightRequests: Record<string, Promise<Pokemon> | undefined> = {};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function withCryUrl(pokemon: Pokemon): Pokemon {
  return {
    ...pokemon,
    cryUrl: `${CRY_BASE}/${pokemon.id}.ogg`,
  };
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
  const cacheKey = nameOrId.toString().toLowerCase();
  if (pokemonCache[cacheKey]) {
    return pokemonCache[cacheKey];
  }
  const existing = inFlightRequests[cacheKey];
  if (existing) {
    return existing;
  }

  const promise: Promise<Pokemon> = fetchJson<Pokemon>(`${API_BASE}/pokemon/${nameOrId}`).then(pokemon => {
    delete inFlightRequests[cacheKey];
    const enriched = withCryUrl(pokemon);
    pokemonCache[pokemon.name.toLowerCase()] = enriched;
    pokemonCache[pokemon.id.toString()] = enriched;
    return enriched;
  }).catch(err => {
    delete inFlightRequests[cacheKey];
    throw err;
  });

  inFlightRequests[cacheKey] = promise;
  return promise;
}

export async function getPokemonDetailsBatch(names: string[]): Promise<Pokemon[]> {
  const promises = names.map(name => getPokemon(name));
  return Promise.all(promises);
}

export async function getPokemonNamesByType(type: string): Promise<string[]> {
  const data = await fetchJson<{
    pokemon: { pokemon: { name: string; url: string } }[];
  }>(`${API_BASE}/type/${type}`);
  return data.pokemon.map(entry => entry.pokemon.name);
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
