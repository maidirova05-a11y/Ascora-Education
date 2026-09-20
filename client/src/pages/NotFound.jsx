import { useLang } from '../context/LangContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';

/**
 * 404.
 *
 * The router used to answer every unknown URL with <Navigate to="/" replace>.
 * That reads well to a person and badly to a crawler: the server already
 * returns 200 for any path (Vercel rewrites everything to index.html), so a
 * mistyped or dead URL became a second address serving the home page's exact
 * content. Google calls that a soft 404 — it reports the URL as an error,
 * and until it does, the duplicate competes with the real home page.
 *
 * A page that says "not found" and marks itself `noindex` cannot be mistaken
 * for content. The status code is still 200, which is a hosting limitation
 * rather than something the client can fix, but the meta tag is the signal
 * that actually keeps the URL out of the index.
 *
 * `window.location.href` rather than a router <Link>: an unknown URL usually
 * means stale state somewhere, and a full load is the cheapest way to be
 * certain the visitor lands on a clean home page.
 */
export default function NotFound() {
  const { t } = useLang();

  return (
    <>
      <SeoHead
        title={t('nf.meta.title')}
        description={t('nf.desc')}
        path="/404"
        noindex
      />
      <Navbar />
      <main>
        <section className="seo-hero">
          <h1>{t('nf.title')}</h1>
          <p className="seo-hero-desc">{t('nf.desc')}</p>
          <a href="/" className="btn-primary seo-hero-cta">
            {t('nf.cta')}
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
