import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('Service worker registered successfully:', registration);
  },
  onUpdate: (registration) => {
    console.log('Service worker updated:', registration);
    // You can show an update notification here
  },
  onError: (error) => {
    console.error('Service worker registration failed:', error);
  }
});