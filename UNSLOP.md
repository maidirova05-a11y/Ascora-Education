# UI audit (unslop) — proposal for owner approval

Mode: **polish only**. The site has a real brand (navy + gold, Cormorant Garamond / Manrope), so no redesign was done. Applied now: removed looping glow/shimmer/pulse animations (`hotPulse`, `hotCtaGlow`, `goldShimmer`), bouncy spring easing, 1.10 hover scale on the gold CTAs, and the "!" in the hot-offer CTA. Nothing else changed.

## Signs still present (not changed, need your call)
- Emoji as UI: 🔥 in hero badge, camp cards, `card.*.sub`; ✕ / ✓ as icons in modals and form success; ⭐ in program names (this one is content/SEO text, keep).
- Orange-to-red gradient "hot" CTA and badge (`.hsc-hot-cta`, `.camp-hot-badge`): a second accent next to the gold. Heavy colored shadows on gold buttons (`rgba(201,168,76,.5-.8)`).
- Gold multi-stop gradient on `.faction-big-cta`; gradient avatars; gold/navy card gradients (`.fbc-*`).
- Glass form card (`backdrop-filter: blur(32px)`) with a radial-glow pseudo-element.
- ~54 uppercase / tracked-letter declarations; weights 700 on buttons.
- Spacing is not on a 4px scale in places (e.g. 15px, 18px, 5px paddings).
- Several `!important` overrides in CSS (maintenance risk).

## Proposed direction (if approved)
- Product: summer and study camps abroad for Kazakhstani children, sold to parents.
- Character: trustworthy, warm, precise.
- World: printed brochures, passports, map paper, hotel and campus photography.
- Moment: the real camp photography in the hero and cards carries the colour; chrome stays navy plus one gold accent.
- Signature: a thin route line (Astana to destination) on the program cards and process steps.
- Steps: replace emoji with a line icon set (lucide); one solid gold primary button, no glow; "hot offer" becomes quiet text with a gold dot; sentence case labels; snap spacing to 4px; keep the Cormorant headings, drop weight 700.
