/**
 * Entry point of the FocusGuardian application.
 * This file handles the initial mounting of the React application and
 * sets up global error listeners to prevent silent failures.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Renders a fallback UI when a critical system error occurs.
 * This ensures the user sees a meaningful message instead of a blank screen.
 */
const showErrorUI = (error: any) => {
  const shield = document.getElementById('crash-shield');
  const details = document.getElementById('error-details');
  if (shield && details) {
    shield.style.display = 'block';
    details.innerText = error?.message || String(error);
  }
};

/**
 * Global Error Handling:
 * Intercepts unhandled JavaScript errors and promise rejections to surface them
 * via the Crash Shield UI, aiding in debugging and improving reliability.
 */
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Critical Runtime Error:", message, error);
  showErrorUI(error || message);
  return false;
};

window.onunhandledrejection = (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
  showErrorUI(event.reason);
};

// Find the mounting point in the DOM
const rootElement = document.getElementById('root');

if (!rootElement) {
  // If the root element is missing, the app cannot start.
  const msg = "System Error: Missing root element.";
  console.error(msg);
  document.body.innerHTML = `<div style="padding: 2rem; color: #b91c1c;">${msg}</div>`;
} else {
  try {
    // Standard React 18 initialization
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    // Catch errors occurring during the initial render/mount phase
    console.error("React Mounting Failure:", e);
    showErrorUI(e);
  }
}