import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [hasStarted, setHasStarted] = useState(false);
  const navigateReactRouter = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (hasStarted) return;
    setHasStarted(true);
    
    // Initial opening sequence
    const holdTimer = setTimeout(() => {
      setVaultState('opening');
      setTimeout(() => {
        setVaultState('idle');
      }, 600); // Wait for open animation to finish
    }, 500); // 500ms hold on start

    return () => {
      clearTimeout(holdTimer);
    };
  }, [hasStarted]);

  const navigateWithVault = useCallback((to: string) => {
    if (vaultState !== 'idle') return; // block duplicate navigations
    
    // Check if it's the exact same route. Note: location.pathname handles query params differently,
    // but for simple routes this is enough.
    if (location.pathname === to) return; 

    // Start transition
    setVaultState('closing');

    // Wait for close animation (~550ms)
    setTimeout(() => {
      setVaultState('closed');
      
      // Perform route change
      navigateReactRouter(to);
      window.scrollTo(0, 0); // Reset scroll position during closed state

      // Hold closed for 500ms, then open
      setTimeout(() => {
        setVaultState('opening');
        
        // Wait for open animation (~550ms), then idle
        setTimeout(() => {
          setVaultState('idle');
        }, 600);
      }, 500);

    }, 550);
  }, [vaultState, location.pathname, navigateReactRouter]);

  const isActive = vaultState !== 'idle';

  return (
    <VaultContext.Provider value={{ navigateWithVault, vaultState }}>
      {children}
      <div 
        className={`vault-overlay ${isActive ? 'vault-active' : ''} vault-${vaultState}`}
        aria-hidden="true"
      >
        <img className="vault-panel vault-upper" src={vaultUpper} alt="" />
        <img className="vault-panel vault-lower" src={vaultLower} alt="" />
      </div>
    </VaultContext.Provider>
  );
}
