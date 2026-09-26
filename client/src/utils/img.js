/**
 * Unsplash photo URLs at a given width.
 *
 * Unsplash resizes on the fly, so the sharpness of every photo on the site is
 * decided by the `w` and `q` we ask for. Ask for roughly twice the CSS width a
 * photo is shown at, so it stays crisp on phones and Retina screens;
 * `auto=format` lets supporting browsers get AVIF/WebP at the same quality.
 */
const BASE = 'https://images.unsplash.com/';

export function unsplash(id, w, q = 80) {
  return `${BASE}${id}?w=${w}&q=${q}&fit=crop&auto=format`;
}

unsplash.srcSet = (id, widths, q = 80) => widths.map((w) => `${unsplash(id, w, q)} ${w}w`).join(', ');
