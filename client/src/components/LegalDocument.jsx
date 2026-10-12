import { useLang } from '../context/LangContext';
import Navbar from './Navbar';
import Footer from './Footer';
import SeoHead from './SeoHead';

/*
 * Shared layout for the legal pages (/oferta, /privacy). `content` is keyed by
 * language like i18n.js: { title, updated, sections: [{ title, blocks }],
 * details: { title, rows } }. A block is a paragraph (string) or a bulleted
 * list (array of strings). The <head> and schema.org graph come from
 * src/seo/pages.js, like every other route.
 */
export default function LegalDocument({ route, jsonLd, content }) {
  const { t, lang } = useLang();
  const doc = content[lang] || content.ru;

  return (
    <>
      <SeoHead title={route.title} description={route.description} path={route.path} jsonLd={jsonLd} />
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
