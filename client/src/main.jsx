import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { captureAttribution } from './utils/attribution';

// First-touch utm/referrer for the inquiry forms — before anything else runs.
captureAttribution();

const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// The public sub-pages arrive with their body already rendered at build time
// (scripts/prerender-meta.mjs + src/entry-server.jsx): attach to that markup
// instead of throwing it away. Everything else — the home page, /admin, the
// 404 fallback — ships an empty #root and renders from scratch as before.
const root = document.getElementById('root');
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, tree);
else ReactDOM.createRoot(root).render(tree);
