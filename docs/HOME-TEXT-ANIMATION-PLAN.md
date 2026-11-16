# Homepage text animation plan

Status: all five effects are live on https://the-t-house.netlify.app since 16 November 2026, after owner approval of the preview at https://text-motion--the-t-house.netlify.app. Checks are recorded in [Implementation status](IMPLEMENTATION-STATUS.md). Nothing goes live and nothing is merged without your say-so.

## 1. What we're adding

Five text effects for the graffiti homepage. They're our own versions of effects on React Bits, written for this site with GSAP, which the site already uses. No code is copied from React Bits or 21st.dev.

| # | Effect | Where | What you'll see |
|---|---|---|---|
| 1 | **Stroke Text** | The red tags "Watch the latest" and "Inside the house" | When a tag scrolls into view, thin white outlines trace each letter left to right, like the house lines on the entrance. Red paint then fills each letter and the outline fades, leaving the same red tag as now. It takes about 2 seconds and plays once per visit. |
| 2 | **Split Text** | The sticker labels on the carousel cards ("Watch", "Inside the House", "About", "Connect") | When a card comes to the front, its label's letters drop onto the sticker one by one with a slight random tilt, then straighten with a small bounce. It takes about half a second. |
| 3 | **Echo Text** | "The T-House" on the entrance gate | As the name is sprayed on, three faint, soft red copies trail behind it. They slide into the word and fade as the spray finishes, like overspray settling. The button still appears at exactly the same moment, and the door and zoom are unchanged. |
| 4 | **Shuffle** | Nav links, sticker labels and the "1 / 4" counter | On mouse hover or keyboard focus, letters roll quickly through a few random letters and land back on the word (about 0.4 seconds). The counter rolls to the new number when the card changes: up for next, down for previous. |
| 5 | **Circular Text** | Around the red spray-painted play button on the video | "WATCH • THE T-HOUSE •" runs in a ring of small white capitals round the button and turns slowly, one full turn about every 20 seconds. It speeds up a little while you point at or focus the video and stops when it's off screen. |

## 2. What stays the same

- All words, links, page order and layout. No text moves other text around while it animates.
- The entrance gate's timing: the drawing, spray, button, door and zoom happen at the same moments as now.
- The carousel's movement, the hero video, the house mask and the reel backdrop.

## 3. Accessibility promises

- **Screen readers** read the normal words, never letter by letter. The moving copies are hidden from them.
- **Reduced motion** (your phone or computer setting, or the site's own "Reduce motion" button): none of the five play, and the text just shows normally. Switching it on halfway through an effect finishes it straight away.
- **No JavaScript:** all text shows normally, and the ring around the play button stays still.
- **High-contrast mode** (forced colours): effects are off, and the text uses the existing high-contrast styles.
- **Keyboard:** the hover effects also play on keyboard focus, so keyboard and mouse users get the same feedback.
- **Phones:** the hover-only effects don't fire on taps, so a tap just opens the link.

## 4. Judgment calls (easy to change)

1. **Stroke Text colours:** white outline, then a red fill, to match the white house lines. The alternative is a red outline.
2. **Which "sticker labels" shuffle:** the Menu and Close buttons, the YouTube and Instagram stickers in the footer, and the "3:43" duration sticker (it shuffles when you point at the video). The carousel stickers get Split Text instead, so one label never has two effects.
3. **Which "nav links" shuffle:** the header links, the full-screen menu links and the footer links. The header and footer are on every page, so the shuffle works site-wide, just like the graffiti header and footer.
4. **Ring text style:** the condensed label font (Barlow Condensed) in white capitals, so it reads as a stencil around the red paint.

## 5. Build order

1. Shared helpers: one check for "is motion allowed?", and one safe way to split text into letters and put it back exactly as it was.
2. Stroke Text on the two tags.
3. Split Text on the carousel labels.
4. Echo Text on the entrance.
5. Shuffle on nav links, stickers and the counter.
6. Circular Text round the play button.
7. Checks (below), docs, then a preview link for you.

## 6. Checks before you see it

- Lint, TypeScript and a production build.
- Phone, tablet, laptop and large-screen widths (390, 768, 1280 and 1920 px): each effect plays, nothing overflows or jumps, and there are no console errors.
- With reduced motion (system and site button), no JavaScript and high-contrast mode, all text is plain and readable.
- Keyboard focus is visible, and the effects play on focus.
- The entrance gate's timing is unchanged, measured against the current live version.
- The carousel still turns, drags and opens cards as before.

## 7. Preview and approval

- **Branch:** `claude/nice-keller-e6x36c`. It's built on top of the version that's live now, Devin's graffiti homepage ([pull request #8](https://github.com/Shaun-Dower24/the-t-house/pull/8), commit `1f6d9fc`). Pull request #8 is still open, so this branch carries the graffiti work plus the text effects. Approving this branch later covers both.
- **Preview:** a separate Netlify preview address. The live site stays as it is.
- **Going live:** only after you approve the preview.

## 8. Developer notes

- **Gating:** every effect runs only when `.prototype[data-motion="full"]` is set and neither `prefers-reduced-motion: reduce` nor `forced-colors: active` matches. Effects watch both and settle instantly when either changes. GSAP is loaded with dynamic `import()` after hydration, as elsewhere.
- **Text splitting** (`lib/text-motion.ts`): this is a temporary split. It detaches the original React-owned text node, inserts an `aria-hidden` letter layer plus an `sr-only` copy, and on finish re-inserts the same text node. React's references stay valid and the resting DOM is exactly what React rendered.
- **Stroke Text** (`components/ui/stroke-tag.tsx`): this client component renders the heading, so server HTML and no-JS show the plain tag. When the tag sits below the viewport and its font has loaded, it measures each character with `Range` rects, with the tag's rotation briefly neutralised, and draws per-glyph SVG `<text>` outlines with dash offsets. Red fills fade in per glyph, then it hands back to the real text. Resizing during play finishes immediately.
- **Split Text:** in `hero-carousel.tsx`, on `active` changes after the first settle, the label is split, letters land with a stagger and random tilt, and it reverts. A pending landing finishes before a card's route transition clones it.
- **Echo Text:** in `home-intro.tsx`, three decorative `<text>` copies sit inside the existing spray mask, behind the title. They're hidden by default, so the six-second failsafe and the static state show no echoes. Their tweens sit inside the existing timeline and end at 5.15 s, so `ready()` keeps its time. The fast-forward hides them.
- **Shuffle:** one delegated listener in `HomeScenes` handles hover (mouse and pen) and `:focus-visible` on `[data-shuffle]`. Each letter cell keeps its own width and clips its rolling strip, so nothing reflows. The counter rolls the changed digit.
- **Circular Text** (`components/ui/circular-text.tsx`): an SVG `textPath` ring. A GSAP rotation pauses off screen and in hidden tabs, and its speed eases up on hover or focus of the video link.
