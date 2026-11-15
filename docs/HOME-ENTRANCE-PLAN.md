# Homepage entrance animation: plan

Status: approved for implementation. Concept A “Lights on”, once per browser session using sessionStorage, with the Hurricane title and HouseElevation rather than a raster logo; about 1.5 seconds, capped at 1.6 seconds. It builds on the video arrival from [PR #2](https://github.com/Shaun-Dower24/the-t-house/pull/2).

## 1. Constraints

- **The master plan says visitors reach the video immediately.** An entrance can therefore be short brand theatre (at most ~1.6s, skippable, once per visit), but not a blocking "wait until loaded" screen.
- **The page underneath must stay usable.** The server HTML (header, carousel, Explore link) is rendered and focusable under the intro.
  - The intro is added by JS only, so no-JS visitors never see it.
  - Reduced motion and forced colours skip it entirely.
- **Native scroll and history are untouched.**
  - Nothing calls `preventDefault` on wheel or touch.
  - The intro never plays on a restored history entry (`history.state.tHouseArrivalSettled`) or when the page loads with a scroll offset.
- **It must hand off to the existing arrival.** The intro ends on exactly the first frame the user already sees: the full-bleed video under the header. No second "reveal" follows it.
- **Only our own assets are used:**
  - `HouseElevation` (`components/house-elevation.tsx`, viewBox 1000×540; the outline paths already have `pathLength="1"`)
  - `HouseOutline`
  - the studio mark
  - the tokens canvas `#0B0B0B`, sign white `#F5F5F5`, signature red `#C83838`, and the Hurricane and Barlow fonts

  The 21st.dev pieces below are references for technique only; no code is copied (several have no licence).

## 2. Concepts

### A. "Lights on" — house draws, door opens into the video (recommended)
1. **0–100ms:** canvas black. The header is present but dimmed to 0.4.
2. **100–800ms:** `HouseElevation`'s outline strokes draw in white, from 0 to 1 dash offset, with a slight stagger: roof, then walls, then detail.
3. **650–950ms:** the door or front window gets a signature-red neon flicker, two quick 60ms blinks then steady. "The T-House" fades up in Hurricane beneath it.
4. **950–1550ms:** the lit door becomes a clip-path aperture.
   - It expands from the door's rect to the full stage rect. Through it you see the already-playing arrival video (or the poster).
   - The house lines scale up slightly and fade as the aperture passes them.
   - The header returns to full opacity.
5. **1550ms:** the overlay is removed. The page is now in the exact state the arrival already starts from.

This works well because it is the reverse of the scroll morph: the video grows *out of* the house, then scrolling shrinks it back *into* the Watch card. Both house motifs bookend the experience.

### B. Red counter loader
A Hurricane `0 → 100` counter in signature red sits bottom-right, echoing the carousel counter. It is tied to real readiness (poster decoded, and video `canplay` or failure), with a 1.8s ceiling. At 100, two charcoal panels split horizontally, like studio doors, to reveal the video.
- Pro: honest loading feedback.
- Con: on fast connections it's either instant (pointless) or faked. Counters read "agency template".

### C. Neon sign switch-on
On black, the studio mark (white house lines and red handwriting) switches on like a neon sign: flicker, buzz-glow, steady. The whole frame then cross-fades to the video.
- Pro: very on-brand and cheap to build.
- Con: the mark is a 150×150 raster, so it's soft at large sizes. It needs a vector logo from the studio to look premium.

### D. Studio curtain / slat wipe
Eight vertical charcoal slats retract left and right (as in Swiss Poster Counter Preloader), with the wordmark revealed via vertical cut text.
- Pro: crisp and fast.
- Con: generic. It doesn't use the house motif.

**Recommendation:** A, borrowing B's readiness logic invisibly. The aperture opens when the poster is decoded or at 950ms, whichever is later, with a hard cap at 1.6s. C is a fallback if you supply a vector logo and want something simpler.

## 3. Behaviour rules (all concepts)

| Situation | Intro? |
|---|---|
| First homepage load in a tab (sessionStorage `tHouseIntroSeen` unset) | Yes |
| Reload / later homepage visits in the same session | No |
| Back/forward to a settled entry, or load with a scroll offset or hash | No |
| Internal navigation to `/` from another page | No (the arrival only) |
| `prefers-reduced-motion`, site "reduced" setting, forced colours | No |
| No JS | No (the intro is never rendered) |
| Any key, click, tap, wheel or scroll during the intro | Jump to the end state within 150ms; the scroll still happens natively |
| Video blocked or failed | The aperture reveals the poster; same timing |
| Tab hidden during the intro | Finish instantly on `visibilitychange` |

## 4. Implementation sketch

- **`components/ui/home-intro.tsx`** (client, smallest boundary), with styles in `home-intro.module.css`.
  - A fixed overlay, `aria-hidden="true"`, `pointer-events: none`, so input reaches the page and native scroll is unaffected.
  - Input listeners are `passive` and only trigger `finish()`.
- **No flash before hydration.** A tiny inline script in `app/layout.tsx` `<head>` runs before first paint. If the conditions in §3 hold, it sets `<html data-intro="pending">`.
  - CSS for `[data-intro=pending]` paints the black canvas only, and never hides the DOM from assistive tech.
  - A 2.5s CSS-animation failsafe clears it even if JS dies.
- **Animation:** GSAP timeline (already a dependency, dynamically imported like the arrival).
  - Stroke-dash draw on `HouseElevation` paths.
  - Clip-path `inset()` from the measured door rect to the stage rect.
  - Elements are mutated directly, with no React state per frame.
- **Handshake with `scroll-expansion-hero.tsx`:**
  - The intro dispatches `t-house:intro-done` and sets `data-intro="done"`.
  - The hero defers *starting* playback until the aperture begins (t ≈ 950ms), so the clip isn't 1s in when revealed.
  - The hero ignores the intro entirely when it restores a settled entry.
- **Focus:** the overlay is never focusable, and focus order is unchanged. The skip is implicit: the first Tab press ends the intro and lands on the header as today.
- **Performance:**
  - Preload the poster (`<link rel="preload" as="image">`) so the aperture usually reveals a real frame.
  - No extra media: the intro uses only existing SVGs, at roughly 3–5 KB of JS on top of GSAP.

## 5. Verification

- Phone (390), tablet (768), desktop (1280/1440) and short landscape (844×390): first frame, mid-draw, aperture, handoff. The handoff frame must be pixel-identical to the current arrival's first frame.
- Skip by key, click, wheel, touch and Tab.
- The §3 table: reload, Back, internal nav, hash, reduced motion, forced colours, no JS, blocked/failed video, hidden tab.
- No layout shift (CLS 0), no horizontal overflow, no console errors.
- Lint, typecheck and build. Record the results in `docs/IMPLEMENTATION-STATUS.md`, and add the sequence to `docs/ANIMATION-SPEC.md` and `docs/DESIGN-SYSTEM.md`.

## 6. Open questions

1. Concept A, or another?
2. Frequency: once per browser session (proposed), once ever (localStorage), or every homepage load?
3. Should the "The T-House" Hurricane title appear in the intro, or only the house and red light?
4. Do you have a vector version of the studio mark? It's needed for concept C and would improve A.
5. Is ~1.5s right, or should it be snappier (~1s)?

## 7. 21st.dev references (technique only)

I couldn't search 21st.dev through the CLI because it isn't logged in, so these come from the public catalogue. None will be installed.
- Handwriting SVG (@pulkitxm): stroke draw-on, used for A's line draw. No licence listed.
- Dual Wipe Reveal (@soralabs): curtain panels, used for B's split. MIT.
- Swiss Poster Counter Preloader (@kedhareswer): slat counter, used for B and D. MIT.
- Preloader (@kevingirelli): readiness-gated overlay with unmount, used for the handshake pattern. MIT.
- Preloader (@info-mdshakeeb): SVG curtain exit with a completion callback. Licence unknown.
- Vertical Cut Reveal (@cnippet-dev): wordmark reveal. No licence listed.
