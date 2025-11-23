import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// index.css is removed because we are using Tailwind CDN and the file does not exist, causing crash.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Ensure the root element takes full height for mobile
rootElement.style.height = '100%';
rootElement.style.width = '100%';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker with relative path
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use ./sw.js to work in subdirectories like /nova-learn/
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}