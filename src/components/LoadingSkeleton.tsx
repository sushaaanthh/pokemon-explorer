import './States.css'; export function LoadingSkeleton() { return <div className="pokemon-grid">{Array.from({ length: 4 }, (_, i) => <div className="card-skeleton skeleton" key={i} />)}</div>; }
