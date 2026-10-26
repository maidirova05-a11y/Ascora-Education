import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext';

/*
 * Every route is its own chunk. The home page carries GSAP and Swiper (the
 * hero), the legal pages carry their full text in three languages, the admin
 * panel carries a whole app — a visitor needs exactly one of these. The shared
 * pieces (React, the router, i18n, Navbar/Footer) land in the entry and vendor
 * chunks; see vite.config.js.
 *
 * No waterfall: scripts/prerender-meta.mjs adds a <link rel="modulepreload">
 * for each route's chunk to that route's HTML, so the browser fetches it in
 * parallel with the entry. The public sub-pages are also server-rendered at
 * build time; hydrateRoot keeps that HTML on screen while the chunk loads
 * (the Suspense boundary below is what lets it wait), so the null fallback is
 * never painted over prerendered content.
 */
const Landing = lazy(() => import('./pages/Landing'));
const LagerAntalya = lazy(() => import('./pages/LagerAntalya'));
const LagerZaRubezhom = lazy(() => import('./pages/LagerZaRubezhom'));
const Oferta = lazy(() => import('./pages/Oferta'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <LangProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/leto-lager-v-turcii" element={<LagerAntalya />} />
          <Route path="/letnie-lagerya-za-rubezhom" element={<LagerZaRubezhom />} />
          <Route path="/oferta" element={<Oferta />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={<Admin />} />
          {/*
            A real 404 rather than <Navigate to="/">. The host answers 200 for
            every path, so redirecting made each dead URL a duplicate of the home
            page — a soft 404 that competes with the page it copies. See
            pages/NotFound.jsx.
          */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </LangProvider>
  );
}
