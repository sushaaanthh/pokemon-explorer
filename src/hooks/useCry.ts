import { useState, useCallback, useEffect } from 'react';

let activeAudio: { audio: HTMLAudioElement; setIsPlaying: (v: boolean) => void } | null = null;

export function stopCurrentCry() {
  if (activeAudio) {
    activeAudio.audio.pause();
    activeAudio.audio.currentTime = 0;
    activeAudio.setIsPlaying(false);
    activeAudio = null;
  }
}

export function useCry() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (activeAudio && activeAudio.setIsPlaying === setIsPlaying) {
        activeAudio.audio.pause();
        activeAudio.audio.currentTime = 0;
        activeAudio = null;
      }
    };
  }, [setIsPlaying]);

  const stop = useCallback(() => {
    if (activeAudio && activeAudio.setIsPlaying === setIsPlaying) {
      activeAudio.audio.pause();
      activeAudio.audio.currentTime = 0;
      activeAudio = null;
    }
    setIsPlaying(false);
  }, [setIsPlaying]);

  const play = useCallback((url: string) => {
    stopCurrentCry();

    if (!url) return;

    const audio = new Audio(url);
    setIsPlaying(true);

    const endCry = () => {
      audio.removeEventListener('ended', endCry);
      audio.removeEventListener('error', endCry);
      if (activeAudio && activeAudio.audio === audio) {
        activeAudio = null;
      }
      setIsPlaying(false);
    };

    activeAudio = { audio, setIsPlaying };

    audio.addEventListener('ended', endCry);
    audio.addEventListener('error', endCry);

    audio.play().catch(() => {
      audio.removeEventListener('ended', endCry);
      audio.removeEventListener('error', endCry);
      if (activeAudio && activeAudio.audio === audio) {
        activeAudio = null;
      }
      setIsPlaying(false);
    });
  }, []);

  return { play, stop, isPlaying };
}
