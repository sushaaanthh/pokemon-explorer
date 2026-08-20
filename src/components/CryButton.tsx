import { useState, useEffect, useCallback } from 'react';
import { useCry, stopCurrentCry } from '../hooks/useCry';
import './CryButton.css';

interface CryButtonProps {
  cryUrl: string | null | undefined;
  size?: number;
}

export function CryButton({ cryUrl, size = 18 }: CryButtonProps) {
  const { play, stop, isPlaying } = useCry();
  const [justStopped, setJustStopped] = useState(false);

  useEffect(() => {
    if (!isPlaying) {
      const timer = setTimeout(() => setJustStopped(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isPlaying]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      stop();
      setJustStopped(true);
    } else if (cryUrl) {
      stopCurrentCry();
      play(cryUrl);
    }
  }, [isPlaying, stop, play, cryUrl]);

  if (!cryUrl) {
    return null;
  }

  return (
    <button
      className={`cry-btn ${isPlaying ? 'cry-btn--playing' : ''} ${justStopped ? 'cry-btn--stopped' : ''}`}
      onClick={handleClick}
      aria-label={isPlaying ? 'Stop Pokémon cry' : 'Play Pokémon cry'}
      aria-pressed={isPlaying}
      type="button"
      title={isPlaying ? 'Stop cry' : 'Play cry'}
    >
      {isPlaying ? (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className="cry-btn__icon cry-btn__icon--wave"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className="cry-btn__icon"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
      {isPlaying && (
        <span className="cry-btn__wave" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      )}
    </button>
  );
}
