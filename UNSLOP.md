# Unslop pass (applied, owner-approved)

Mode: polish, keeping the navy and gold brand, Cormorant/Fraunces headings, Manrope body, all content and features. Before/after screenshots (Playwright, 1440 and 390 wide) are in `docs/unslop/` (`before-*.png`, `after-*.png`: home, full page, camps, contact form, Antalya page, mobile).

## Direction
- Product: summer and study camps abroad for Kazakhstani children, sold to parents.
- Character: trustworthy, warm, precise.
- World: printed brochures, passports, map paper; the real camp photography carries the colour.
- Moment: photography in the hero and cards. Chrome stays navy plus one gold accent.
- Signature (not built, see "Left for later"): a thin route line from Astana to the destination.

## What changed
- Spacing: every padding, margin and gap snapped to the 4px grid (values under 4px kept).
- Colour: orange-to-red "hot" CTA and badge removed. Hot offer is now a gold dot plus quiet gold text on a hairline pill; the hot CTA is solid gold. Gold multi-stop gradient on the big CTA, gradient avatars, gold/brown and navy gradient active cards, gold glow shadows, the glass form card (blur plus radial glow) and nav/modal backdrop blur are all gone; surfaces are solid navy steps with hairlines. Image scrims were kept (they serve legibility).
- Icons: emoji (fire, check, close) replaced with inline line SVGs (1.5 stroke) or the gold dot. Star in program names left as is (content/SEO text).
- Copy: exclamation marks removed from success messages; the fire emoji and close glyph removed from i18n strings (ru/kz/en).
- Type: no uppercase tracked labels (about 30 rules now sentence case, 12px minimum); weights 700-900 became 600; italic gold emphasis in h1/h2 now upright gold; tiny negative tracking removed on small text. Quotes keep their italic.
- Details: the form consent note and labels raised to readable contrast; consent link no longer default browser blue; no hover scale on buttons, cards and the active program card.
- Motion: earlier commit removed looping glow, shimmer and pulse; this pass also removed the remaining hover scale and gap shifts.

## Left for later (need a design decision)
- Route-line signature on program cards and process steps; replacing the Fraunces/Cormorant mix with a single display family.
- Roughly 40 `!important` overrides in `index.css` (maintenance risk, not visual).
- Admin screen got the same global rules (weights, labels, spacing) but was not redesigned.
