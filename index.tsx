import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global error listener to catch runtime crashes before React mounts
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error Caught: ", message, error);
  // Optional: In a real production app, you might show a "Something went wrong" UI here
  // if the root element is still empty.
  return false;
};

window.onunhandledrejection = function(event) {
  console.error("Unhandled Promise Rejection: ", event.reason);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  const msg = "Could not find root element to mount to";
  console.error(msg);
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>System Error</h1><p>${msg}</p></div>`;
  throw new Error(msg);
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  console.error("React Mounting Error: ", e);
  rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>Application Error</h1><p>The app failed to start. Please refresh.</p></div>`;
}