import { MOCK_POKEMON } from '../mock/pokemonMockData';
import { getTypeColor } from '../utils/pokemonTypeColors';
import { formatPokemonId } from '../utils/formatPokemonId';
import { formatPokemonName } from '../utils/formatPokemonName';
import './pages.css';
import './Comparison.css';

const COMPARE_STATS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

export function Comparison({ comparison }: { comparison: string[] }) {
  // Use selected comparison array, or fallback to pikachu and charizard
  const picks = (comparison.length === 2 ? comparison : ['pikachu', 'charizard'])
    .map((n) => MOCK_POKEMON.find((p) => p.name === n)!)
    .filter(Boolean);

  if (picks.length < 2) {
    return (
      <main className="compare-page">
        <p className="compare-eyebrow">Not enough data</p>
        <h1 className="compare-title">Select two Pokémon</h1>
      </main>
    );
  }

  const [leftPokemon, rightPokemon] = picks;
  const leftColor = getTypeColor(leftPokemon.types[0].type.name);
  const rightColor = getTypeColor(rightPokemon.types[0].type.name);

  return (
    <main className="compare-page">
      <p className="compare-eyebrow">Choose your champions</p>
      <h1 className="compare-title">Compare Pokémon</h1>

      {/* Comparison Stage */}
      <section className="compare-stage">
        
        {/* Left Pokemon */}
        <article className="compare-panel" style={{ '--card-type-color': leftColor } as React.CSSProperties}>
          <span className="compare-glow" aria-hidden="true" />
          <span className="compare-id">{formatPokemonId(leftPokemon.id)}</span>
          <div className="compare-image-container">
            <img
              className="compare-image"
              src={leftPokemon.sprites.other?.['official-artwork']?.front_default ?? leftPokemon.sprites.front_default ?? ''}
              alt={formatPokemonName(leftPokemon.name)}
            />
          </div>
          <h2 className="compare-name">{formatPokemonName(leftPokemon.name)}</h2>
          <span 
            className="compare-type-badge"
            style={{ backgroundColor: leftColor }}
          >
            {formatPokemonName(leftPokemon.types[0].type.name)}
          </span>
        </article>

        {/* VS Badge */}
        <div className="compare-vs-badge">VS</div>

        {/* Right Pokemon */}
        <article className="compare-panel" style={{ '--card-type-color': rightColor } as React.CSSProperties}>
          <span className="compare-glow" aria-hidden="true" />
          <span className="compare-id">{formatPokemonId(rightPokemon.id)}</span>
          <div className="compare-image-container">
            <img
              className="compare-image"
              src={rightPokemon.sprites.other?.['official-artwork']?.front_default ?? rightPokemon.sprites.front_default ?? ''}
              alt={formatPokemonName(rightPokemon.name)}
            />
          </div>
          <h2 className="compare-name">{formatPokemonName(rightPokemon.name)}</h2>
          <span 
            className="compare-type-badge"
            style={{ backgroundColor: rightColor }}
          >
            {formatPokemonName(rightPokemon.types[0].type.name)}
          </span>
        </article>

      </section>

      {/* Comparison Statistics */}
      <section className="compare-stats-section">
        <p className="compare-section-title">Head to Head</p>
        <h2 className="compare-section-heading">Statistics</h2>

        <div className="compare-stats-list">
          {COMPARE_STATS.map((stat) => {
            const leftVal = leftPokemon.stats.find((s) => s.stat.name === stat)?.base_stat ?? 0;
            const rightVal = rightPokemon.stats.find((s) => s.stat.name === stat)?.base_stat ?? 0;
            const maxStat = 255;
            const leftPct = Math.min((leftVal / maxStat) * 100, 100);
            const rightPct = Math.min((rightVal / maxStat) * 100, 100);

            return (
              <div className="compare-stat-row" key={stat}>
                <p className="compare-stat-name">{formatPokemonName(stat)}</p>
                <div className="compare-stat-bar-container">
                  <span className="compare-stat-value">{leftVal}</span>
                  <div className="compare-stat-bar-wrapper">
                    <div
                      className="compare-stat-bar-left"
                      style={{ width: `${leftPct}%`, backgroundColor: leftColor }}
                    />
                    <div
                      className="compare-stat-bar-right"
                      style={{ width: `${rightPct}%`, backgroundColor: rightColor }}
                    />
                  </div>
                  <span className="compare-stat-value">{rightVal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
}
