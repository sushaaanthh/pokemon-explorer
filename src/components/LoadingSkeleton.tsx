import './States.css';

export function LoadingSkeleton() {
  return (
    <div className="pokemon-grid" role="status" aria-label="Loading Pokémon">
      {Array.from({ length: 4 }, (_, i) => (
        <div className="card-skeleton skeleton" key={i} />
      ))}
    </div>
  );
}
