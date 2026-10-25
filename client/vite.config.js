import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React, ReactDOM and the router change far less often than the site's own
// code: a separate chunk stays cached across deploys that only touch copy or
// styles. GSAP and Swiper are not listed — only the home page's hero uses
// them, so they belong to that route's chunk (see App.jsx).
const VENDOR = /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|cookie|set-cookie-parser)[\\/]/;

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: isSsrBuild
    ? { outDir: 'dist-ssr', emptyOutDir: true, ssrEmitAssets: false }
    : {
        // Read by scripts/prerender-meta.mjs to find each route's chunk, then
        // deleted from dist/ — it is a build artefact, not something to serve.
        manifest: true,
        rollupOptions: {
          output: { manualChunks: (id) => (VENDOR.test(id) ? 'vendor' : undefined) },
        },
      },
  server: {
    port: 5175,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
}));
