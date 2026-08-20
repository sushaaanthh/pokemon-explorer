import { useState, useEffect, useCallback } from 'react';
import { useAppState } from '../context/AppStateContext';
import { useVaultNavigation } from '../components/VaultTransitionContext';
import './ComparisonFullModal.css';

export function ComparisonFullModal() {
  const { comparisonNotice, clearComparisonNotice } = useAppState();
  const { navigateWithVault } = useVaultNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (comparisonNotice) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [comparisonNotice]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    if (isClosing) {
      setIsVisible(false);
      setIsClosing(false);
    }
  }, [isClosing]);

  const handleOkay = useCallback(() => {
    clearComparisonNotice();
    handleClose();
  }, [clearComparisonNotice, handleClose]);

  const handleGoToComparisons = useCallback(() => {
    clearComparisonNotice();
    handleClose();
    setTimeout(() => {
      navigateWithVault('/compare');
    }, 150);
  }, [clearComparisonNotice, handleClose, navigateWithVault]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      clearComparisonNotice();
      handleClose();
    }
  }, [clearComparisonNotice, handleClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      clearComparisonNotice();
      handleClose();
    }
  }, [clearComparisonNotice, handleClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`modal-backdrop ${isClosing ? 'modal-backdrop--closing' : ''}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-full-title"
    >
      <div
        className={`modal ${isClosing ? 'modal--closing' : ''}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="modal__corner modal__corner--tl" aria-hidden="true" />
        <div className="modal__corner modal__corner--tr" aria-hidden="true" />
        <div className="modal__corner modal__corner--bl" aria-hidden="true" />
        <div className="modal__corner modal__corner--br" aria-hidden="true" />

        <h2 className="modal__title" id="comparison-full-title">COMPARISON FULL</h2>
        <p className="modal__message">Remove one Pokémon to add another.</p>

        <div className="modal__actions">
          <button
            className="modal__btn modal__btn--secondary"
            onClick={handleOkay}
            type="button"
          >
            OKAY
          </button>
          <button
            className="modal__btn modal__btn--primary"
            onClick={handleGoToComparisons}
            type="button"
          >
            GO TO COMPARISONS
          </button>
        </div>
      </div>
    </div>
  );
}
