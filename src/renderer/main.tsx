import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize dark mode before React renders
// Ensure light mode is default (dark class should not be present initially)
if (document.documentElement.classList.contains('dark')) {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

