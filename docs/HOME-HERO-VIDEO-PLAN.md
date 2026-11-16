# Homepage video into the Warp Carousel

## What visitors see

The homepage opens on a silent, edge-to-edge video below the site header. As visitors scroll down, the same playing image shrinks and crops into the front **Watch** card. The house outline emerges behind it, the other three cards and their controls come into view, and scrolling continues into **Watch the latest**.

| Point in the scroll | On screen |
| --- | --- |
| Opening | The video fills the hero without overlaid pause or Explore controls. The header provides navigation and Skip to content. The homepage title remains available to screen readers. |
| First part of the scroll | The video starts to pull inward. Its crop shifts from a wide frame to a portrait crop, keeping the main subject in view. The charcoal backdrop and illuminated house become visible around it. |
| Card landing | The video meets the actual bounds of the upright 1:2 Watch card. Its fine white rim and **Watch** label appear as the neighbouring cards, graffiti arrows and red counter come into view. |
| Browsing | Watch begins in the front position. The same video stays on its face while the card is active and visible. Browse all four links by arrows, keyboard or swipe. On desktop, hover can widen a card to 16:9. Activating a card still runs the 180° flip and route zoom. |

Before the visitor browses, scrolling back up expands the video into the hero again. After they choose to browse, the carousel keeps their selection. Browser Back restores the last browsed card and the browser's scroll position.

## Supplied component and footage

- Adapt the video, poster and resize concept from the attached `ScrollExpandMedia` component. Reverse its card-to-screen direction. Drive the geometry with existing native scroll and GSAP ScrollTrigger. Keep wheel, touch, keyboard and scrollbar movement under browser control. [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- Embed the official third-party upload [SVOnTheBeat – 8 Bar Riddim](https://www.youtube.com/watch?v=9ekaltChkjc), not a studio-owned release. Use `youtube-nocookie.com`, never download or re-host the footage. Start at 13 seconds, autoplay muted inline, hide controls and use `loop=1&playlist=9ekaltChkjc&rel=0&enablejsapi=1`. The IFrame Player API seeks back to 13 seconds at the end of each loop.
- Centre a 16:9 iframe over the clipped media frame using cover sizing at every morph/hover size. Disable iframe pointer events so native touch/scroll reach the page. Keep `/images/arrival-poster.jpg` visible until the API reports playing; restore it on embed failure. The retained poster is a fallback, not a still of the new footage. Preserve the dark fade behind the label. Keep episode playback user-initiated on the Watch route.

## Integration

1. **Compose the arrival scene in `app/page.tsx`.** Put the house drawing and existing `HeroCarousel` in a shared stage beneath the header. Give the stage a CSS sticky wrapper and enough document height to scrub the transition, starting with about one viewport of travel on desktop and half a viewport on phones. Keep clipping on the inner stage so it can stick and release as the next section arrives. Keyboard focus from the header reaches the carousel directly and settles it before interaction, without an Explore anchor or programmatic scroll jump.
2. **Adapt the supplied component in `components/ui/scroll-expansion-hero.tsx`.** Give the Watch artwork one persistent poster/media frame, with its lazy YouTube player managed by `youtube-arrival.ts`. Measure the stage and the real Watch art box at its front, unhovered pose and scrub between those rectangles. At landing, return the layer to ordinary card positioning so it follows Warp's rotation and hover expansion. Use state-preserving `moveBefore` to retain the live iframe through reparenting; older browsers that cannot preserve an iframe during a DOM move reconnect with the poster visible. Scope clipping/stacking adjustments to the transition and recalculate both rectangles on resize or orientation changes.
3. **Coordinate the two motion systems.** Retire the current `#arrival` house-drawing scrub in `components/home-scenes.tsx` and let the new arrival effect control that part of the scene. Leave the featured release and studio scroll effects on their existing triggers. In `components/hero-carousel.tsx` and `components/hero-carousel.module.css`, keep the normal portrait pose during the morph. Keyboard focus or an intentional browse settles the carousel immediately before handling the interaction. Let `WarpCarousel` take over its ordinary navigation and hover motion after the handoff. Use scoped updates for geometry with no React render on every scroll frame.
4. **Carry the artwork into the existing page transition.** In `components/card-route-transition.tsx`, omit the cross-origin iframe from artwork clones and reveal the retained poster on both flip faces. Do not attempt to capture cross-origin video pixels or clone a second player. Keep the four existing destinations, selection history and Escape behaviour.
5. **Handle media and motion states.** Load the API/iframe only when eligible, visible and allowed to play. Defer playback until the entrance door opens. Use automatic API pause/resume for hidden tabs, offscreen scenes and inactive Watch selection. With autoplay blocked or an unavailable embed/API, keep the poster visible; there is no manual retry button. With system/site reduced motion, forced colours or scripts disabled, load no iframe and render a static poster and operable rail in normal flow. The owner requested removal of the user-facing pause control; record the WCAG 2.2.2 consideration in implementation status. Third-party playback depends on YouTube/network policy and cannot be guaranteed. [W3C guidance on pausing moving content](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)

The project already has TypeScript, shadcn aliases and Tailwind v4. The shared component path is `components/ui`, and global styles are in `app/globals.css`. Use scoped styles for the arrival effect and the installed GSAP dependency.

Record the approved arrival sequence in [the motion specification](ANIMATION-SPEC.md), [the design system](DESIGN-SYSTEM.md) and the existing design context when implementing it. Document the silent background loop separately from user-initiated episode playback.

## Acceptance checks

- Capture the first view, a frame midway through the scroll, and the landed carousel at phone, tablet and desktop widths. The media frame should finish flush with the real Watch artwork. Check for crop jumps, black frames, duplicate playback, stretched footage, layout shift and horizontal overflow.
- Test slow scroll, fast fling, reverse scroll before browsing, resize and phone rotation. The header and **Watch the latest** remain reachable by normal scrolling, and the page restores its position on Back.
- Test keyboard focus from the header before landing, Skip to content, horizontal swipe alongside native vertical scrolling, desktop hover, all four links, and the complete flip and zoom. Test with reduced motion, forced colours, scripts disabled, blocked autoplay and unavailable video. Confirm there are no overlaid hero controls and playback stops offscreen or in a background tab.
- Run lint, TypeScript and a production build. Verify inline playback and poster fallback in Chrome, Safari and Firefox, including iOS Safari where available. Record outcomes in [Implementation status](IMPLEMENTATION-STATUS.md) and capture the preview for review.
