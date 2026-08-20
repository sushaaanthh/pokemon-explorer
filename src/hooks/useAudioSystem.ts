import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'nav' | 'favorite' | 'compare' | 'confirm' | 'vault';

interface AudioSystemState {
  play: (type: SoundType) => void;
  playVault: () => void;
  stopAll: () => void;
}

let audioCtx: AudioContext | null = null;
let currentVaultAudio: HTMLAudioElement | null = null;
let vaultPlaying = false;
const uiSoundVolume = 0.04;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playUiTone(freq: number, duration: number, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(uiSoundVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silently fail if audio is unavailable
  }
}

function playNavSound() {
  playUiTone(600, 0.08, 'sine');
}

function playFavoriteSound() {
  playUiTone(523, 0.06, 'sine');
  setTimeout(() => playUiTone(659, 0.08, 'sine'), 60);
}

function playCompareSound() {
  playUiTone(440, 0.05, 'sine');
  setTimeout(() => playUiTone(554, 0.05, 'sine'), 50);
  setTimeout(() => playUiTone(659, 0.07, 'sine'), 100);
}

function playConfirmSound() {
  playUiTone(784, 0.06, 'sine');
  setTimeout(() => playUiTone(988, 0.08, 'sine'), 60);
}

export function useAudioSystem(): AudioSystemState {
  const reducedMotion = useRef<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { reducedMotion.current = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const play = useCallback((type: SoundType) => {
    if (reducedMotion.current) return;
    switch (type) {
      case 'nav':
        playNavSound();
        break;
      case 'favorite':
        playFavoriteSound();
        break;
      case 'compare':
        playCompareSound();
        break;
      case 'confirm':
        playConfirmSound();
        break;
    }
  }, []);

  const playVault = useCallback(() => {
    if (reducedMotion.current) return;
    if (vaultPlaying) return;
    vaultPlaying = true;
    try {
      const audio = new Audio('/assets/vault/door-sound.mpeg');
      currentVaultAudio = audio;
      audio.currentTime = 0.75;
      audio.playbackRate = 2;
      const onEnded = () => {
        vaultPlaying = false;
        currentVaultAudio = null;
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
      };
      const onError = () => {
        vaultPlaying = false;
        currentVaultAudio = null;
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
      };
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      audio.play().catch(() => {
        vaultPlaying = false;
        currentVaultAudio = null;
      });
    } catch {
      vaultPlaying = false;
    }
  }, []);

  const stopAll = useCallback(() => {
    if (currentVaultAudio) {
      currentVaultAudio.pause();
      currentVaultAudio.currentTime = 0.75;
      currentVaultAudio.playbackRate = 2;
      currentVaultAudio = null;
    }
    vaultPlaying = false;
  }, []);

  return { play, playVault, stopAll };
}
