// Main application entry point — Static HTML Architecture
import React from 'react';
import { createRoot } from 'react-dom/client';
import HeroFuturistic from '../components/ui/hero-futuristic';

console.log('ZephyrDevs engine initialized.');

const heroRoot = document.getElementById('hero-root');
if (heroRoot) {
  const root = createRoot(heroRoot);
  root.render(React.createElement(HeroFuturistic));
}
