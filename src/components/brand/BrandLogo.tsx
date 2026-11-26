import { useI18n } from '../../app/providers/I18nProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { BRAND_CONFIG } from '../../config/brand';

export interface BrandLogoProps {
  variant?: 'horizontal' | 'icon';
  surface?: 'auto' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({
  variant = 'horizontal',
  surface = 'auto',
  size = 'md',
  className = '',
}: BrandLogoProps) {
  const { locale } = useI18n();
  const { resolvedTheme } = useTheme();
  const isDarkSurface = surface === 'dark' || (surface === 'auto' && resolvedTheme === 'dark');

  const altText = BRAND_CONFIG.alt[locale];

  if (variant === 'icon') {
    return (
      <span className={`brand-logo brand-logo--icon brand-logo--${size} ${className}`.trim()}>
        <img
          src={BRAND_CONFIG.assets.appIcon}
          alt={altText}
          className="brand-logo__img brand-logo__img--icon"
        />
      </span>
    );
  }

  return (
    <span
      className={`brand-logo brand-logo--horizontal brand-logo--${size} ${
        isDarkSurface ? 'brand-logo--on-dark' : ''
      } ${className}`.trim()}
    >
      <img
        src={BRAND_CONFIG.assets.primaryLogo}
        alt={altText}
        className="brand-logo__img brand-logo__img--horizontal"
      />
    </span>
  );
}
