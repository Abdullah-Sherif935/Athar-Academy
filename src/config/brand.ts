import primaryLogo from '../../logo and prand/Athar Academy_ Learn, Grow, Impact.png';
import appIcon from '../../logo and prand/Athar Academy Icon Logo.png';

export const BRAND_CONFIG = {
  name: {
    en: 'ATHAR ACADEMY',
    ar: 'أكاديمية أثر',
  },
  tagline: {
    en: 'LEARN · GROW · MAKE AN IMPACT',
    ar: 'تعلّم · تطوّر · اصنع أثرًا',
  },
  promise: {
    en: 'Learning should create a lasting, positive impact.',
    ar: 'التعلّم يجب أن يصنع أثرًا إيجابيًا مستدامًا.',
  },
  assets: {
    primaryLogo,
    appIcon,
  },
  alt: {
    en: 'ATHAR ACADEMY logo',
    ar: 'شعار أكاديمية أثر',
  },
  supportEmail: 'support@atharacademy.example',
} as const;
