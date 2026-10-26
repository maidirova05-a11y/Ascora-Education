/**
 * Build-time renderer for scripts/prerender-meta.mjs (built with
 * `vite build --ssr`, never shipped to the browser).
 *
 * Renders the same tree as main.jsx, minus BrowserRouter, for one URL and
 * resolves once every lazy route has loaded, so the HTML holds the page
 * itself and not the Suspense fallback. Language is always the default
 * (Russian) — exactly what the client renders on first paint, which is what
 * hydration requires.
 */
import React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Writable } from 'node:stream';
import App from './App';

const tree = (url) => (
  <React.StrictMode>
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  </React.StrictMode>
);

/**
 * Two passes. The streaming renderer is only used to wait until every lazy
 * route chunk on this URL has loaded (onAllReady); its output is discarded.
 * The HTML itself comes from renderToString, which then finds every lazy
 * component already resolved. Taking the streamed bytes directly is not
 * safe in React 18: its UTF-8 chunking can drop NUL bytes into the middle
 * of a Cyrillic word where a character straddles an internal buffer.
 */
export async function render(url) {
  await new Promise((resolve, reject) => {
    const stream = renderToPipeableStream(tree(url), {
      onAllReady() { stream.pipe(new Writable({ write: (_c, _e, cb) => cb(), final: (cb) => { resolve(); cb(); } })); },
      onShellError: reject,
      onError: reject,
    });
  });
  return renderToString(tree(url));
}
