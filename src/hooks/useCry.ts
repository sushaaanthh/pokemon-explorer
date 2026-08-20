import { useState, useCallback } from 'react';

let currentAudio: HTMLAudioElement | null = null;

export function stopCurrentCry() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function useCry() {
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback((url: string) => {
    stopCurrentCry();

    if (!url) return;

    const audio = new Audio(url);
    currentAudio = audio;
    setIsPlaying(true);

    audio.play().catch(() => {
      setIsPlaying(false);
      currentAudio = null;
    });

    const onEnded = () => {
      setIsPlaying(false);
      currentAudio = null;
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };

    const onError = () => {
      setIsPlaying(false);
      currentAudio = null;
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
  }, []);

  const stop = useCallback(() => {
    stopCurrentCry();
    setIsPlaying(false);
  }, []);

  return { play, stop, isPlaying };
}
