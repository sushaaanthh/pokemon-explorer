import type { ReactNode, CSSProperties, MouseEvent } from 'react';
import { useVaultNavigation } from './VaultTransitionContext';
import { useLocation } from 'react-router-dom';

interface VaultLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  'aria-label'?: string;
}

export function VaultLink({ to, children, className, onClick, ...props }: VaultLinkProps) {
  const { navigateWithVault } = useVaultNavigation();
  const location = useLocation();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick();
    if (location.pathname !== to) {
      navigateWithVault(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
