import { Globe } from 'lucide-react';
import { useI18n } from '../../app/providers/I18nProvider';

export function LanguageSwitcher() {
  const { toggleLocale, t } = useI18n();

  return (
    <button
      type="button"
      className="control-pill"
      onClick={toggleLocale}
      aria-label={t('a11y.languageSwitch')}
      title={t('a11y.languageSwitch')}
    >
      <Globe size={16} aria-hidden="true" />
      <span>{t('language.switchLabel')}</span>
    </button>
  );
}
