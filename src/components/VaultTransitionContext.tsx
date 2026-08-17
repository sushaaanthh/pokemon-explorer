import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import vaultUpper from '../assets/vault/vault-upper.png';
import vaultLower from '../assets/vault/vault-lower.png';
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
  // initial load starts 'closed'
  const [vaultState, setVaultState] = useState<VaultState>('closed');
  const navigateReactRouter = useNavigate();
  const location = useLocation();
  const initialized = useRef(false);
  const pendingNav = useRef<string | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // Initial opening sequence
    setTimeout(() => {
      setVaultState('opening');
    }, 500); // 500ms hold on start

    // Deliberately not clearing timeout on unmount to ensure 
    // StrictMode double-invocations don't permanently break the initialization
  }, []);

  const navigateWithVault = useCallback((to: string) => {
    if (vaultState !== 'idle') return; // block duplicate navigations
    
    // Check if it's the exact same route
    if (location.pathname === to) return; 

    pendingNav.current = to;
    // Start transition
    setVaultState('closing');
  }, [vaultState, location.pathname]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLImageElement>) => {
    // Only react to the primary transition property
    if (e.propertyName !== 'transform' && e.propertyName !== 'opacity') return;

    if (vaultState === 'closing') {
      setVaultState('closed');
      
      // Perform route change
      if (pendingNav.current) {
        navigateReactRouter(pendingNav.current);
        pendingNav.current = null;
        window.scrollTo(0, 0); // Reset scroll position during closed state
      }

      // Hold closed for 500ms, then open
      setTimeout(() => {
        setVaultState('opening');
      }, 500);

    } else if (vaultState === 'opening') {
      // Vault has finished opening, hide it
      setVaultState('idle');
    }
  };

  const isActive = vaultState !== 'idle';

  return (
    <VaultContext.Provider value={{ navigateWithVault, vaultState }}>
      {children}
      <div 
        className={`vault-overlay ${isActive ? 'vault-active' : ''} vault-${vaultState}`}
        aria-hidden="true"
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
