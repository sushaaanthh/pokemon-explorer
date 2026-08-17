import type { SortOption } from '../types/pokemon';
import './SortSelect.css';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'id', label: 'Pokédex ID' },
  { value: 'name', label: 'Name' },
  { value: 'attack', label: 'Attack' },
  { value: 'speed', label: 'Speed' },
  { value: 'hp', label: 'HP' },
];

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="sort-select">
      <label htmlFor="sort-select" className="sort-select__label">
        Sort by
      </label>
      <div className="sort-select__wrapper">
        <select
          id="sort-select"
          className="sort-select__input"
          value={value}
          onChange={e => onChange(e.target.value as SortOption)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="sort-select__chevron">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    </div>
  );
}
