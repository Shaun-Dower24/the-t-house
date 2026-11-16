# Homepage glass redesign plan

Scope: homepage only (`/`). Supporting pages, contact form, SEO pass and the other brief phases are out of scope for this round.

Source brief: "System prompt: The T-House website" (Dower Digital), pasted 16 November 2026.

## What stays

| Element | Why |
| --- | --- |
| "Enter the house" gate, YouTube arrival morph, Warp carousel, reel-through-windows backdrop | Approved and live. The brief bans forced scroll-jacking; the morph uses native scroll, so it complies. |
| Signature red `#C83838`, canvas `#0B0B0B`, Hurricane + Barlow | The brief says its palette (lime `#D9FF43`, orange `#FF583E`) is provisional and verified brand colours take priority. The red comes from the supplied mark. |
| Verified content only | The official channel still lists one public upload (`9adqs1vgcMA`, Fifa In The T EP 1), re-checked 16 November 2026. |

## What changes

Section order after the hero:

1. **Hero actions** – a smoked-glass strip under the carousel once the morph lands, with two actions: *Watch the podcast* (`/watch/fifa-in-the-t-ep-1`) and *Explore the studio* (`/inside-the-house`). Nothing overlays the full-screen video, keeping the earlier "no buttons on the video" decision.
2. **Featured episode** – replace "Watch the latest" with a cinematic split: large thumbnail, glass info panel (series, episode, guest Kojo Funds, duration, date), working watch link plus YouTube link.
3. **Episode discovery** – editorial grid fed from `content/studio.ts`. With one verified episode it shows that episode plus a glass "Subscribe on YouTube" tile; new records added to `videos` appear automatically.
4. **Inside The T-House** – keep the image accordion, add the reel/house imagery and a glass caption panel. Artwork stays labelled as concept art until studio photos arrive.
5. **About the brand** – short verified copy: Leyton studio, associated with SV on the Beat, links to YouTube and Instagram.
6. **Studio enquiry CTA** – glass CTA with subtle shimmer linking to `/connect` (official channels). No form: no delivery endpoint or consent policy exists yet.

## Design system additions

- Reusable `GlassPanel`, `GlassCTA`, `GlassEpisodeCard` in `components/glass/`, using the brief's treatment (`rgba(20,22,26,.72)`, 16px blur, 12% white hairline) tuned per background.
- Fallbacks: `@supports not (backdrop-filter)` uses near-opaque `#171717`; `prefers-reduced-transparency` and forced colours use solid surfaces; reduced motion removes shimmer and reveals.
- Restrained motion: one-shot section reveals and glass hover/focus lift using CSS and IntersectionObserver. No new animation libraries.

## 21st.dev references

The registry returns 403 without login, so the components serve as visual references only; implementations are original. Most relevant: Glass Video Hero (hero actions), Glass Blog Card (episode cards), Glassmorphism CTA (enquiry), Frosted Card (studio). Liquid Glass Navbar and Distorted Glass are skipped (WebGL / full-screen refraction cost).

## Checks

Lint, TypeScript, production build; Chrome at 390/768/1280/1920; keyboard and focus order; reduced motion, reduced transparency, no backdrop-filter, no JS, missing thumbnail; no console or hydration errors; Netlify preview alias before production.

## Open questions

1. Hero actions: glass strip under the landed carousel (recommended), or overlaid on the full-screen video?
2. Episode grid: only the verified T-House episode plus a subscribe tile (recommended), or also include SV's music videos (e.g. 8 Bar Riddim) labelled as music?
3. Enquiry CTA: link to Connect (recommended), or should I build a working form (needs a delivery address and a Netlify Forms / email service decision)?
