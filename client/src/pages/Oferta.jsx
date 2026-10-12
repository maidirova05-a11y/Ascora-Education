import LegalDocument from '../components/LegalDocument';
import { routeFor, graphFor } from '../seo/pages';
import { OFERTA } from '../content/oferta';

/*
 * Public offer of AZ GROUP LLC — the same document the AZ GROUP olympiad sites
 * publish. Text in src/content/oferta.js, layout in components/LegalDocument.
 */
const ROUTE = routeFor('/oferta');
const JSON_LD = graphFor(ROUTE);

export default function Oferta() {
  return <LegalDocument route={ROUTE} jsonLd={JSON_LD} content={OFERTA} />;
}
