import './States.css';

interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 4 }: LoadingSkeletonProps) {
  return (
    <div className="pokemon-grid" role="status" aria-label="Loading Pokémon">
      {Array.from({ length: count }, (_, i) => (
        <div className="card-skeleton skeleton" key={i} />
      ))}
    </div>
  );
}
