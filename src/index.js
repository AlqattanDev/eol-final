import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.js';
import dbCli from './utils/dbCli.js';
import * as serviceWorker from './utils/serviceWorker.js';

// Make dbCli globally available in browser console
window.dbCli = dbCli;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Register service worker for offline functionality
serviceWorker.register({
  onUpdate: (registration) => {
    // Notify user of updates
    if (window.confirm('New version available! Reload to update?')) {
      registration.waiting.postMessage({ action: 'skipWaiting' });
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log('App is ready for offline use!');
  }
});