import { Link } from 'react-router-dom';
import './States.css';

interface EmptyStateProps {
  title?: string;
  text?: string;
  action?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No Pokémon found.',
  text = 'Try searching for another Pokémon.',
  action = false,
  actionLabel = 'Explore Pokémon',
  onAction,
}: EmptyStateProps) {
  return (
    <section className="state">
      <span>◇</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action &&
        (onAction ? (
          <button className="state__action" onClick={onAction}>
            {actionLabel}
          </button>
        ) : (
          <Link to="/" className="state__action">
            {actionLabel}
          </Link>
        ))}
    </section>
  );
}