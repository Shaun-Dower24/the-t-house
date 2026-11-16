# Homepage graffiti redesign plan

Status: step 1 built — fonts, shared styling primitives and site-wide header/footer. Gate, carousel and homepage section restyles remain planned. Scope: the homepage `/` first, except the approved shared header/footer treatment.

## 1. Brief

Restyle the existing homepage components into a hand-drawn graffiti look inspired by The T-House logo (`public/images/t-house-neon-mark.jpg`). The logo has two parts:

- **The house:** a white, loose, single-weight line drawing. It is sketchy, with overshooting corners, doubled strokes and hand-wobbled lines.
- **The tag:** a red handstyle "T-House" signature beneath it.

Keep:

- the components and the page structure and order
- the copy and links
- the native-scroll behaviour, accessibility, verified content and the arrival mechanics

Change the visual language: type, fonts, line work, surfaces, buttons, cards, textures and micro-details.

This replaces the glass direction in [PR #7](https://github.com/Shaun-Dower24/the-t-house/pull/7). The plan is built from `feature/immersive-homepage` on a new branch, so none of the glass styling carries over.

## 2. Visual language: "marker on a black wall"

| Element | Now | Graffiti direction |
|---|---|---|
| Ground | Flat `#0B0B0B` | Black wall: `#0B0B0B` with a faint concrete/grain noise (CSS/SVG noise, about 3–4% opacity) and occasional overspray haze |
| Line work | Precise architectural SVG (`HouseElevation`, `HouseOutline`) | Same geometry, drawn like the logo: wobbly paths, overshooting corners, a second offset "ghost" stroke, round caps. A shared SVG roughen filter (`feTurbulence` + `feDisplacementMap`) is applied to the existing paths, so the geometry, mask and morph stay identical |
| Accent | Signature red `#C83838` | Keep the red as the spray/tag colour. Add sign white `#F5F5F5` as chalk/marker white. Add no new hues except an optional drip shadow (`#7A1F1F`) |
| Edges | Hairline 1px rectangles | Hand-drawn borders: SVG marker frames with slightly uneven corners, a tape/sticker feel on cards, and the odd drip off the bottom edge |
| Decoration | Minimal | Sparse original doodles in the logo's line style (arrows, crowns, stars, underlines, "X" marks, a small house tag). Never more than one or two per viewport, and always `aria-hidden` |

All artwork will be drawn as original SVG in the project. Nothing is copied from third-party graffiti or reference sites.

## 3. Typography

All fonts are open-licence and self-hosted via `@fontsource`, matching the current setup:

| Role | Now | Proposed | Licence |
|---|---|---|---|
| Display tags (section titles: "Watch the latest", "Inside the house", the gate title) | Hurricane (script) | **Sedgwick Ave Display**: a real graffiti handstyle, closest to the logo's red tag | OFL-1.1 |
| Big impact words / counters (1/4, card titles, the "ENTER THE HOUSE" button) | Barlow 700 | **Permanent Marker**: a chunky marker, readable at small sizes | Apache-2.0 |
| Labels, nav, meta | Barlow 500–600 uppercase | **Barlow Condensed** 600 uppercase, stencil-like and tight | OFL-1.1 |
| Body copy, long episode titles | Barlow | **Barlow** (unchanged, for legibility) | OFL-1.1 |

Rules:

- Graffiti fonts are for short display text only (8 words or fewer), never for body copy or long episode titles.
- Tags sit slightly rotated (−2° to 2°) with a red spray-shadow, applied as a CSS `text-shadow` stack.
- Forced colours and reduced transparency drop to Barlow with no shadow, as the current `script-title` fallback already does.
- Hurricane is removed from the homepage. It stays on other pages until they're redesigned, then it's retired.

Alternatives to show you: Rubik Spray Paint (OFL) for a more sprayed display face, and Rock Salt (Apache-2.0) for a scrawlier label face.

## 4. Component-by-component restyle (homepage)

No component is added or removed, and the markup only gets className hooks.

1. **Site header** (`site-header.tsx`):
   - Logo stays.
   - Nav links become Barlow Condensed with a hand-drawn marker underline on hover/active (the existing `draw-random-underline` component).
   - Menu button becomes a taped sticker with a marker border.
   - The header background is a black strip with a rough bottom edge (SVG mask).
2. **Entrance gate** (`home-intro.tsx`):
   - The house still draws line by line, now with the roughen filter and a ghost stroke, so it looks hand-drawn.
   - "The T-House" spray uses Sedgwick Ave Display, with drips running down after the spray.
   - The "ENTER THE HOUSE" button becomes a painted marker block: red fill, uneven edges, Permanent Marker.
   - Timing and door zoom are unchanged.
3. **Hero video / morph** (`scroll-expansion-hero.tsx`):
   - No change to geometry or behaviour.
   - Only the landed Watch card's frame gets a marker border.
4. **Carousel** (`hero-carousel.tsx`):
   - The cards keep their size and positions.
   - Labels become torn-paper/sticker plates in Permanent Marker, with a slight tilt.
   - The arrows already use `GraffitiArrow`; it gets a spray dot on hover/focus.
   - The `1 / 4` counter becomes a red tag numeral.
   - The house drawing behind gets the roughen filter. The window/door reel mask still uses the unfiltered geometry, so the mask doesn't shift.
5. **Watch the latest:**
   - The title becomes a tag.
   - The video frame is a hand-drawn marker frame with taped corners.
   - The play button is a spray-painted circle.
   - The duration badge is a sticker.
   - "Watch episode" and "View all videos" become marker links with arrow doodles.
6. **Inside the house:**
   - The title becomes a tag.
   - The copy block sits on a pasted-poster panel: off-black paper texture, rough edges, tape.
   - The accordion images get marker frames.
   - The "Studio concept artwork" caption becomes a stencil label.
7. **Footer** (`site-footer.tsx`):
   - A rough top edge.
   - A small house tag and marker links.
   - YouTube and Instagram become stickers.
   - The header and footer are shared, so these styles reach other pages too. I can scope them to the homepage until the rest is redesigned.

## 5. Shared building blocks (styles, not new page components)

- `--font-tag`, `--font-marker` and `--font-label` tokens in `globals.css`.
- `.tag-title`, `.marker-frame`, `.sticker`, `.drip` and `.marker-link` utility classes.
- One `<RoughFilters />` SVG `<defs>` block in the layout (roughen, spray grain and drip), referenced with `filter: url(#…)`.
- Optional small decorative SVG doodles in `components/doodles/`, all `aria-hidden` and server-rendered.

These are styling primitives, so the page's components stay the same.

## 6. Motion

The existing approach stays (CSS plus small client boundaries, no scroll-jacking). Additions:

- Tags "spray on" once when they enter view: a mask wipe plus overspray fade, under 600ms.
- Marker underlines draw on hover/focus, with equal emphasis for both.
- Drips run once.
- Reduced motion (system or the site toggle): everything is static and fully drawn. No-JS: everything is visible.

## 7. Accessibility and performance

- Text contrast is at least 4.5:1. Red tags are display-size only, and body text stays sign white or Barlow.
- Focus rings stay clearly visible: a white marker outline plus the existing ring.
- Roughen filters only go on decorative SVG, never on text, so legibility and paint cost stay under control. They're disabled for forced colours.
- Fonts: subsets with `font-display: swap`, and only the weights used. That adds about 3 font files and about 60–90KB total.
- No layout shift: font fallback metrics are matched, and the media boxes keep their reserved sizes.

## 8. Delivery

1. Branch `devin/…-graffiti-homepage` from `feature/immersive-homepage` (this plan).
2. Tokens, fonts, filters and utilities.
3. Restyle in this order: the header, the gate, the carousel, Watch, Inside, then the footer.
4. Checks: lint, tsc and build; the gate handoff, `check-handoff.cjs`, fling and mask regressions; screenshots at 390, 768, 1280 and 1920; no-JS, reduced motion and forced colours.
5. A preview at `graffiti-home--the-t-house.netlify.app`, then your review. Nothing goes live or is merged without your say-so.

## 9. Decisions needed

1. **Fonts:** Sedgwick Ave Display + Permanent Marker + Barlow Condensed (recommended), or the Rubik Spray Paint / Rock Salt alternatives?
2. **Intensity:** "clean street" (recommended: roughened lines, tags on titles only, sparse doodles), or "full wall" (heavier textures, overspray, more doodles and stickers)?
3. **Header/footer:** restyle them site-wide now, or homepage only until the other pages are done (recommended: site-wide, since they're shared)?
4. **[PR #7](https://github.com/Shaun-Dower24/the-t-house/pull/7)** (glass): close it as superseded (recommended), or keep it?
5. **Vector logo:** is there an SVG/vector of the logo? With one, the house tag and drips can match it exactly; without one, I'll redraw the lines in the same style.
