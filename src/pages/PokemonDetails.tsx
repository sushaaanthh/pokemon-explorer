import { useParams } from 'react-router-dom';
import { MOCK_POKEMON } from '../mock/pokemonMockData';
import { getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonId } from '../utils/formatPokemonId';
import { formatPokemonName } from '../utils/formatPokemonName';
import { EmptyState } from '../components/EmptyState';
import './pages.css';
import './PokemonDetails.css';

export function PokemonDetails() {
  const { name } = useParams();
  const pokemon = MOCK_POKEMON.find((item) => item.name === name);

  if (!pokemon) {
    return (
      <main className="page subpage">
        <EmptyState />
      </main>
    );
  }

  const primaryType = pokemon.types[0].type.name;
  const primaryColor = getTypeColor(primaryType);

  const artworkUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default ??
    '';

  return (
    <main className="detail-page" style={{ '--card-type-color': primaryColor } as React.CSSProperties}>
      <div className="detail-layout">
        
        {/* Left: Artwork Panel */}
        <section className="detail-artwork-panel">
          <span className="detail-artwork-glow" aria-hidden="true" />
          <span className="detail-artwork-id">{formatPokemonId(pokemon.id)}</span>
          {artworkUrl && (
            <img
              src={artworkUrl}
              alt={`${formatPokemonName(pokemon.name)} artwork`}
              className="detail-artwork-image"
            />
          )}
        </section>

        {/* Right: Info Panel */}
        <section className="detail-info">
          <p className="detail-eyebrow">Pokédex Entry</p>
          <h1 className="detail-name">{formatPokemonName(pokemon.name)}</h1>
          
          <div className="detail-types">
            {pokemon.types.map((t) => (
              <span
                key={t.type.name}
                className="detail-type-badge"
                style={{ backgroundColor: getTypeColor(t.type.name) }}
              >
                {formatPokemonName(t.type.name)}
              </span>
            ))}
          </div>

          <div className="detail-meta-grid">
            <div className="detail-meta-card">
              <span className="detail-meta-label">Height</span>
              <span className="detail-meta-value">{(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-label">Weight</span>
              <span className="detail-meta-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-label">Abilities</span>
              <span className="detail-meta-value">
                {pokemon.abilities
                  .map((a) => formatPokemonName(a.ability.name) + (a.is_hidden ? ' · Hidden' : ''))
                  .join(', ')}
              </span>
            </div>
          </div>

          <div className="detail-stats">
            <p className="detail-section-title">Base Stats</p>
            {pokemon.stats.map((s) => {
              const maxStat = 255;
              const percentage = Math.min((s.base_stat / maxStat) * 100, 100);
              
              return (
                <div className="stat-row" key={s.stat.name}>
                  <span className="stat-name">{formatPokemonName(s.stat.name)}</span>
                  <div className="stat-bar-container">
                    <div 
                      className="stat-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="stat-value">{s.base_stat}</span>
                </div>
              );
            })}
          </div>

          <div className="detail-moves">
            <p className="detail-section-title">Moves</p>
            <div className="detail-moves-grid">
              {pokemon.moves.slice(0, 12).map((m) => (
                <span className="move-chip" key={m.move.name}>
                  {formatPokemonName(m.move.name)}
                </span>
              ))}
            </div>
          </div>
          
        </section>
      </div>
    </main>
  );
}
