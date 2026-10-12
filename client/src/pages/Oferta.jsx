import { useLang } from '../context/LangContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';
import { routeFor, graphFor } from '../seo/pages';
import { OFERTA } from '../content/oferta';

/*
 * Public offer of AZ GROUP LLC — the same document the AZ GROUP olympiad sites
 * publish. The text is in src/content/oferta.js, per language; the <head> and
 * the schema.org graph come from src/seo/pages.js like every other route.
 */
const ROUTE = routeFor('/oferta');
const JSON_LD = graphFor(ROUTE);

export default function Oferta() {
  const { t, lang } = useLang();
  const doc = OFERTA[lang] || OFERTA.ru;

  return (
    <>
      <SeoHead title={ROUTE.title} description={ROUTE.description} path="/oferta" jsonLd={JSON_LD} />
      <Navbar />
      <main>
        <section className="seo-hero">
          <div className="seo-breadcrumb">
            <a href="/">{t('seo.breadcrumb.home')}</a><span>／</span>
            <span>{doc.title}</span>
          </div>
          <h1>{doc.title}</h1>
          <p className="seo-hero-desc">{doc.updated}</p>
        </section>

        <section className="seo-section">
          <div className="container legal-doc">
            {doc.sections.map((section) => (
              <div key={section.title} className="legal-block">
                <h2>{section.title}</h2>
                {section.blocks.map((block) =>
                  typeof block === 'string' ? (
                    <p key={block.slice(0, 32)}>{block}</p>
                  ) : (
                    <ul key={block[0]}>
                      {block.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )
                )}
              </div>
            ))}

            <div className="legal-details">
              <h2>{doc.details.title}</h2>
              <dl>
                {doc.details.rows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>
                      {row.href ? (
                        <a
                          href={row.href}
                          {...(row.href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
                        >
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
