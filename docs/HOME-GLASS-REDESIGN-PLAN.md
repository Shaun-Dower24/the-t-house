# Homepage glass treatment — revised scope

The earlier extra strips, sections and React glass components were rejected. Restore `app/page.tsx` exactly to `origin/feature/immersive-homepage`: the existing arrival/carousel, **Watch the latest** feature, then **Inside the house**. Keep all original markup, copy, links and artwork labels.

Apply smoked-glass CSS only to selected existing surfaces: carousel labels/controls, feature frame/caption and duration badge, studio copy/caption, and shared header/menu button/footer. Use shared custom properties in `globals.css`: approximately `rgba(20,22,26,.72)`, 16px blur with WebKit support, 12% white hairlines and soft shadow. Keep signature red, canvas, Hurricane and Barlow. Shared header/menu-button/footer styling also applies on other routes.

Do not change layout, card sizes, gate, morph, mask or media behaviour. Use inset strokes or decorative pseudo-elements where a border would change geometry. Add no components, sections, copy, interactions, reveals or shimmer. Unsupported backdrop filtering, reduced transparency and forced colours use solid surfaces; existing reduced-motion behaviour remains.

Verify the homepage source diff against the feature branch is empty, lint/TypeScript/build, gate/morph/mask and native-touch regressions, and responsive/fallback checks. Review full-page and landed screenshots at 390/1440 plus Watch detail. Push to PR #7 and deploy only the `glass-home` draft alias.
