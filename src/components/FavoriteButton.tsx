import { useState, useEffect } from 'react';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}

export function FavoriteButton({ isFavorite, onToggle, size = 20 }: FavoriteButtonProps) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isFavorite) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 450);
      return () => clearTimeout(timer);
    }
  }, [isFavorite]);

  return (
    <button
      className={`fav-btn ${isFavorite ? 'fav-btn--active' : ''} ${animating ? 'fav-btn--animate' : ''}`}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
