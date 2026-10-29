import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { App } from './App';
import './index.css';

const isNativePlatform = Capacitor.isNativePlatform()
  || new URLSearchParams(window.location.search).get('native') === '1';

if (isNativePlatform) {
  document.documentElement.classList.add('native-app');
} else {
  const updateViewport = () => {
    const viewport = window.visualViewport;
    const height = viewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${height}px`);
    document.documentElement.classList.toggle(
      'keyboard-open',
      Boolean(viewport && window.innerHeight - viewport.height - viewport.offsetTop > 120)
    );
  };

  updateViewport();
  window.addEventListener('resize', updateViewport);
  window.visualViewport?.addEventListener('resize', updateViewport);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
