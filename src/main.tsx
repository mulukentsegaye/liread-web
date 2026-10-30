import React from 'react';
import ReactDOM from 'react-dom/client';
import JSZip from 'jszip';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './index.css';

// Ensure JSZip is globally accessible for epub.js UMD runtime across both dev and production
if (typeof window !== 'undefined') {
  (window as unknown as { JSZip: typeof JSZip }).JSZip = JSZip;
}

// Register offline Service Worker for zero-latency offline reading
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration info:', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
