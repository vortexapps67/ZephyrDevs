import React from 'react';
import ReactDOM from 'react-dom/client';
import Html from '../components/ui/hero-futuristic';

const rootElement = document.getElementById('hero-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Html />
    </React.StrictMode>
  );
}
