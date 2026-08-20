import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import vaultUpper from '../assets/vault/vault-upper.png';
import vaultLower from '../assets/vault/vault-lower.png';
import { useAudioSystem } from '../hooks/useAudioSystem';
import './VaultTransition.css';

type VaultState = 'idle' | 'closing' | 'closed' | 'opening';

interface VaultContextType {
  navigateWithVault: (to: string) => void;
  vaultState: VaultState;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function useVaultNavigation() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVaultNavigation must be used within a VaultTransitionProvider');
  }
  return context;
}

export function VaultTransitionProvider({ children }: { children: ReactNode }) {
  const [vaultState, setVaultState] = useState<VaultState>('closed');
  const navigateReactRouter = useNavigate();
  const location = useLocation();
  const pendingNav = useRef<string | null>(null);
  const openTimeoutRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<number | null>(null);
  const { playVault } = useAudioSystem();

  const vaultStateRef = useRef(vaultState);
  vaultStateRef.current = vaultState;

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        window.clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }
      if (safetyTimeoutRef.current) {
        window.clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    void window.setTimeout(() => {
      setVaultState('opening');
    }, 500);
  }, []);

  useEffect(() => {
    if (vaultState === 'idle') return;

    if (safetyTimeoutRef.current) {
      window.clearTimeout(safetyTimeoutRef.current);
    }

    safetyTimeoutRef.current = window.setTimeout(() => {
      setVaultState('idle');
      safetyTimeoutRef.current = null;
    }, 4000);

    return () => {
      if (safetyTimeoutRef.current) {
        window.clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, [vaultState]);

  const navigateWithVault = useCallback((to: string) => {
    if (vaultStateRef.current !== 'idle') return;
    if (location.pathname === to) return;

    pendingNav.current = to;
    setVaultState('closing');
    playVault();
  }, [location.pathname, playVault]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLImageElement>) => {
    if (e.propertyName !== 'transform' && e.propertyName !== 'opacity') return;

    const currentState = vaultStateRef.current;

    if (currentState === 'closing') {
      setVaultState('closed');

      if (pendingNav.current) {
        navigateReactRouter(pendingNav.current);
        pendingNav.current = null;
        window.scrollTo(0, 0);
      }

      if (openTimeoutRef.current) {
        window.clearTimeout(openTimeoutRef.current);
      }
      openTimeoutRef.current = window.setTimeout(() => {
        setVaultState('opening');
        openTimeoutRef.current = null;
      }, 500);

    } else if (currentState === 'opening') {
      setVaultState('idle');
    }
  };

  const handleVaultInteraction = useCallback(() => {
    const currentState = vaultStateRef.current;
    if (currentState === 'closed') {
      setVaultState('opening');
    } else if (currentState === 'opening') {
      setVaultState('idle');
    }
  }, []);

  const handleVaultKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleVaultInteraction();
    }
  }, [handleVaultInteraction]);

  const isActive = vaultState !== 'idle';

  return (
    <VaultContext.Provider value={{ navigateWithVault, vaultState }}>
      {children}
      <div
        className={`vault-overlay ${isActive ? 'vault-active' : ''} vault-${vaultState}`}
        aria-hidden="true"
        onClick={handleVaultInteraction}
        onKeyDown={handleVaultKeyDown}
        tabIndex={isActive ? 0 : -1}
        role={isActive ? 'button' : undefined}
      >
        <img
          className="vault-panel vault-upper"
          src={vaultUpper}
          alt=""
          onTransitionEnd={handleTransitionEnd}
        />
        <img className="vault-panel vault-lower" src={vaultLower} alt="" />
      </div>
    </VaultContext.Provider>
  );
}
