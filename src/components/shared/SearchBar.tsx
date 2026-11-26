import { Search, X } from 'lucide-react';
import { useI18n } from '../../app/providers/I18nProvider';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel?: string;
}

export function SearchBar({ value, onChange, placeholder, ariaLabel }: SearchBarProps) {
  const { t } = useI18n();

  return (
    <div className="search-bar">
      <Search size={18} className="search-bar__icon" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="search-bar__input"
      />
      {value ? (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label={t('a11y.clearSearch')}
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
