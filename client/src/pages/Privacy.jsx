import LegalDocument from '../components/LegalDocument';
import { routeFor, graphFor } from '../seo/pages';
import { PRIVACY } from '../content/privacy';

/*
 * Privacy policy. Text in src/content/privacy.js — written against what the
 * site actually collects and where it sends it; layout in
 * components/LegalDocument.
 */
const ROUTE = routeFor('/privacy');
const JSON_LD = graphFor(ROUTE);

export default function Privacy() {
  return <LegalDocument route={ROUTE} jsonLd={JSON_LD} content={PRIVACY} />;
}
