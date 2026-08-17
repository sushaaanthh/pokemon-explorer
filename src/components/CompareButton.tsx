import './CompareButton.css';

interface CompareButtonProps {
  isSelected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function CompareButton({ isSelected, disabled = false, onToggle }: CompareButtonProps) {
  return (
    <button
      className={`compare-btn ${isSelected ? 'compare-btn--active' : ''}`}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      aria-label={isSelected ? 'Remove from comparison' : 'Add to comparison'}
      aria-pressed={isSelected}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
      <span>{isSelected ? 'Added' : 'Compare'}</span>
    </button>
  );
}
