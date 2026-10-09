import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/tokens.css';
import './styles/base.css';
import { AppRoutes } from './routes';
import { AppStateProvider } from './store/AppStateProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppStateProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppStateProvider>
  </React.StrictMode>,
);
