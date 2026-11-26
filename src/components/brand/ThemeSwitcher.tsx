import { Monitor, Moon, Sun } from 'lucide-react';
import { useI18n } from '../../app/providers/I18nProvider';
import { useTheme, type ThemePreference } from '../../app/providers/ThemeProvider';

const OPTIONS: Array<{ value: ThemePreference; labelKey: string; Icon: typeof Sun }> = [
  { value: 'light', labelKey: 'theme.light', Icon: Sun },
  { value: 'dark', labelKey: 'theme.dark', Icon: Moon },
  { value: 'system', labelKey: 'theme.system', Icon: Monitor },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <div className="theme-switcher" role="group" aria-label={t('a11y.themeSelection')}>
      {OPTIONS.map(({ value, labelKey, Icon }) => {
        const isActive = theme === value;
        const label = t(labelKey);
        return (
          <button
            key={value}
            type="button"
            className={`theme-switcher__btn ${isActive ? 'theme-switcher__btn--active' : ''}`}
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
          >
            <Icon size={15} aria-hidden="true" />
            <span className="theme-switcher__text">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
