import { I18nProvider, useI18n } from './providers/I18nProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { LandingPage } from '../features/public/LandingPage';

function AppShell() {
  const { t } = useI18n();

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t('a11y.skipToContent')}
      </a>
      <Navbar />
      <LandingPage />
      <Footer />
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppShell />
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
