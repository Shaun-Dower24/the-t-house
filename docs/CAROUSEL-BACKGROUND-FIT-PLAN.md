# Carousel background fit — diagnosis and proposed fix

Status: **approved and implemented**. At 48rem and up, the single video and static poster use centred contain over a blurred, overscanned poster fill; phones retain cover. Baseline diagnosis: `773af81`, branch `devin/1794833551-youtube-hero`. Verification results are recorded in `IMPLEMENTATION-STATUS.md`.

## Observed problem

Chromium, Node 24, existing local Webpack dev server on port 3001. All six requested sizes were captured with the local WebM **playing**, around 30.2 seconds; the gate was session-skipped. The unrelated YouTube API was blocked to isolate this backdrop (Watch therefore shows its poster). Screenshots were visually reviewed.

The backdrop already fills the viewport/sticky stage, without CSS gaps, bands, exposed video edges, horizontal overflow or incorrect stacking. The desktop problem reproduced is **excessively enlarged/cropped portrait content**, not an undersized background box: a person's head and the reel's baked-in text are cut off, and the enlargement looks soft. The user's exact browser/frame is unknown; a separate browser-specific gap is not established by this check.

### Measurements (CSS pixels)

At landing, stage, background container and video all have `getBoundingClientRect()` **(0, 0, viewport width, viewport height)**. The scrim is `::after`, not a DOM element: it has no callable `getBoundingClientRect()`. Its measured computed width/height equal the viewport and its absolute insets are all zero, establishing the same box. Colour: `rgba(11,11,11,.72)`.

| Viewport / stage / video / scrim | Arrival section rect `(x,y,w,h)` | Carousel content rect `(x,y,w,h)` |
| --- | --- | --- |
| 1280×800 | 0, −800, 1280, 1600 | 0, 226.41, 1280, 395.19 |
| 1440×900 | 0, −900, 1440, 1800 | 0, 256.41, 1440, 435.19 |
| 1920×1080 | 0, −1080, 1920, 2160 | 0, 334.41, 1920, 459.19 |
| 2560×1440 | 0, −1440, 2560, 2880 | 0, 514.41, 2560, 459.19 |
| 768×1024 | 0, −1024, 768, 2048 | 0, 354.41, 768, 363.19 |
| 390×844 | 0, −422, 390, 1266 | 0, 231.81, 390, 428.36 |

The section is deliberately taller than the visible sticky stage: 200svh, or 150svh on phones. The video is not meant to span that entire scroll runway simultaneously.

All sizes compute `object-fit: cover`, `object-position: 50% 50%`, source 540×960. Scale is `max(box width / 540, box height / 960)`; rendered media below is the intrinsic image after scaling, not the video's DOM box.

| Viewport | Scale | Rendered media | Visible source region | Cropping |
| --- | ---: | --- | --- | --- |
| 1280×800 | 2.370× | 1280×2275.56 | 540×337.5 | 64.84% of height removed |
| 1440×900 | 2.667× | 1440×2560 | 540×337.5 | 64.84% of height removed |
| 1920×1080 | 3.556× | 1920×3413.33 | 540×303.75 | 68.36% of height removed |
| 2560×1440 | 4.741× | 2560×4551.11 | 540×303.75 | 68.36% of height removed |
| 768×1024 | 1.422× | 768×1365.33 | 540×720 | 25% of height removed |
| 390×844 | 0.879× | 474.75×844 | 443.6×960 | 17.85% of width removed |

1440 mid-morph (progress .5): stage/background/video/scrim remain 1440×900 at (0,0), section is (0,−450,1440,1800); background opacity is .85 rather than landed 1. No background displacement. At all sizes: background z-index −2, transparent house −1, isolated/clipped stage; overflow 0 and page errors `[]`.

## Root cause and reachability

- `components/ui/scroll-expansion-hero.tsx:189–199` renders the portrait sources directly inside the full-stage background, below the house. The playing browser element reports the expected 540×960 source, so this path actually executes.
- `components/ui/scroll-expansion-hero.module.css:11–20` stretches the background/video box to the stage and applies centred `cover` to both video and poster. `:24–30` makes that stage viewport-sized. A 9:16 image covering a landscape viewport necessarily discards roughly two thirds of its height; no responsive framing alternative is provided. The 540px encode magnifies the softness.
- Counter-check against a sizing/stacking bug: the measured boxes and screenshots show complete stage coverage, no overflow, and the intended transparent house above the video. Merely adding `inset:0`, `width/height:100%`, `display:block` or `object-fit:cover` will not solve this; those conditions already hold.

## Recommended fix — approved

**Desktop: full-stage soft fill plus a centred, uncropped portrait video.** Keep the existing background wrapper and scrim. Use a blurred, cover-fitted version of the poster as a separate underlay, then fit the one existing video with `contain` inside that wrapper. Centre it; keep the full-stage 72% scrim above both. Slightly overscan/clip only the blurred underlay to prevent blur-edge halos. No second video decoder or synchronisation is needed. Use the same contained-poster composition before playing or on error so framing does not jump. Leave the phone's current cover treatment unchanged; initially apply the alternate composition at the existing 48rem breakpoint, then review tablet framing explicitly.

This preserves the whole reel on desktop without black side bars; the soft side fill is intentional, not stretched sharp footage. At 1440×900 the portrait becomes approximately 506×900 instead of 1440×2560. At 2560×1440 it becomes 810×1440 (1.5× enlargement), so a higher-resolution portrait encode from the retained 1080×1920 original can improve sharpness if needed. Do not upscale the current encode or pre-crop it to landscape: neither restores detail or lost composition. Re-encoding is optional pending visual review and an agreed download budget; no new media files in this task.

### Alternatives

1. **Keep edge-to-edge cover**, introduce a shared video/poster focal-position token, and encode a higher-resolution portrait rendition. Smallest change, but still loses 65–68% vertically on desktop. One position cannot preserve heads/captions across every moving shot; review the entire loop. Choose only if cropped, atmospheric footage is intended.
2. **Use owner-approved landscape footage/editorial reframing** on desktop, keeping portrait on phones. Best natural full-bleed framing; requires suitable original media and approval. A landscape export made from this same narrow crop alone does not fix composition or add detail. A baked blurred-fill export is possible but downloads duplicated fill pixels unnecessarily.

## Morph, fallbacks and verification after approval

- Change only background presentation (scoped CSS, and a decorative underlay if needed); do not resize/reparent the stage, carousel or `[data-arrival-media]`. Preserve `draw()` geometry, reveal, sticky heights, gate, history and native touch scrolling (`scroll-expansion-hero.tsx:116–156`). The background stays pointer-inert and aria-hidden; no visible controls.
- Preserve existing eligibility/lazy-source loading and offscreen/hidden-tab/gate pause. Reduced motion, site-reduced motion, no JS and autoplay/media failure use the matching static composition without source loading where currently required. Forced colours omit the whole backdrop, including any new underlay.
- Repeat this six-viewport measurement/screenshot matrix and 1440 mid-morph; review the full loop for framing, legibility, halos/seams and portrait boundaries. Assert playback, coverage, stacking, zero horizontal overflow/page errors, pause/resume, and all static/error fallbacks.
- Run `check-handoff.cjs`, gate poster pixel comparisons, mobile touch/resize/fling checks, then lint, typecheck and build. Check real YouTube playback separately; this diagnosis intentionally isolated it. Include Firefox/WebKit checks before calling a future fix cross-browser verified.

## Evidence and decisions needed

Evidence directory: `/home/ubuntu/shots/bg-fit/`. Landed screenshots: `1280x800-landed.png`, `1440x900-landed.png`, `1920x1080-landed.png`, `2560x1440-landed.png`, `768x1024-landed.png`, `390x844-landed.png`; plus `1440x900-mid-morph.png`. Full rects/computed styles/playback/error data: `measurements.json`; reproduction: `measure.cjs`.

1. Prefer the recommended intact portrait with soft side fill, or deliberately cropped full-bleed footage? Keep tablets with desktop framing or phone framing?
2. Must the reel's embedded captions remain visible, and is there a preferred subject/frame? If a different defect (bands/gaps) was seen, which browser, viewport and screenshot?
3. If sharper large-desktop footage needs a larger download, what asset-size budget is acceptable, or is approved landscape footage available?

The measurements above describe the pre-fix baseline. Approval selected the recommended composition for tablets and desktops; no new media or second video was introduced.
