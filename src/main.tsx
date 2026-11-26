import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/500.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';

import './styles/tokens.css';
import './styles/typography.css';
import './styles/global.css';
import './components/ui/ui.css';
import './components/layout/layout.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
