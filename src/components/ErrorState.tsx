import './States.css'; export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <section className="state">
      <span aria-hidden="true">!</span>
      <h2>Something went wrong.</h2>
      <p>We couldn't load the Pokémon right now.</p>
      {onRetry && <button className="state__action" onClick={onRetry}>Try Again</button>}
    </section>
  );
}
