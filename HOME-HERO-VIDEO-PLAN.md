# Homepage video into the Warp Carousel

## What visitors see

The homepage opens on a silent, edge-to-edge video below the site header. As visitors scroll down, the same playing image shrinks and crops into the front **Watch** card. The house outline emerges behind it, the other three cards and their controls come into view, and scrolling continues into **Watch the latest**.

| Point in the scroll | On screen |
| --- | --- |
| Opening | The video fills the hero. The header provides navigation and a compact **Pause video** control sits on the hero. The homepage title remains available to screen readers. |
| First part of the scroll | The video starts to pull inward. Its crop shifts from a wide frame to a portrait crop, keeping the main subject in view. The charcoal backdrop and illuminated house become visible around it. |
| Card landing | The video meets the actual bounds of the upright 1:2 Watch card. Its fine white rim and **Watch** label appear as the neighbouring cards, graffiti arrows and red counter come into view. |
| Browsing | Watch begins in the front position. The same video stays on its face while the card is active and visible. Browse all four links by arrows, keyboard or swipe. On desktop, hover can widen a card to 16:9. Activating a card still runs the 180° flip and route zoom. |

Before the visitor browses, scrolling back up expands the video into the hero again. After they choose to browse, the carousel keeps their selection. Browser Back restores the last browsed card and the browser's scroll position.

## Supplied component and footage

- Adapt the video, poster and resize concept from the attached `ScrollExpandMedia` component. Reverse its card-to-screen direction. Drive the geometry with existing native scroll and GSAP ScrollTrigger. Keep wheel, touch, keyboard and scrollbar movement under browser control. [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- Use the supplied MP4 and its matching poster for the first preview. Both responded with the expected media types. For production, confirm the demo footage or use a studio-supplied loop. Serve the selected video and matching poster as optimised static assets. [Supplied demo MP4](https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1) · [Supplied poster](https://cdn.21st.dev/assets/localized/5bb1be92440e920def3eb36ad5a610d609240616cd8b11c0effe6b92bcafe06e.jpg)
- Give the clip an adjustable focal point for the portrait crop. Check it on a narrow phone and in the desktop 16:9 hover frame. Preserve the clip's colour and use the existing dark fade directly behind the card label. Use a short, seamless clip with an MP4 source and a lightweight matching poster. Keep the episode player user-initiated on the Watch route.

## Integration

1. **Compose the arrival scene in `app/page.tsx`.** Put the house drawing and existing `HeroCarousel` in a shared stage beneath the header. Give the stage a CSS sticky wrapper and enough document height to scrub the transition, starting with about one viewport of travel on desktop and half a viewport on phones. Keep clipping on the inner stage so it can stick and release as the next section arrives. Place an **Explore carousel** anchor at the start and let a deliberate activation bring focus to the settled carousel.
2. **Adapt the supplied component in `components/ui/scroll-expansion-hero.tsx`.** Give the Watch card's artwork slot one persistent native video element with a poster. During the opening and morph, allow its media layer to extend beyond the Watch card into the scene. Measure the stage and the real Watch art box at its front, unhovered pose. Scrub the media frame's position and crop between those rectangles, keeping the picture proportional. At landing, return the layer to its ordinary card positioning so it follows Warp's rotation and hover expansion. Keep the video mounted through the handoff. Scope clipping and stacking adjustments to the transition and recalculate both rectangles on resize or orientation changes.
3. **Coordinate the two motion systems.** Retire the current `#arrival` house-drawing scrub in `components/home-scenes.tsx` and let the new arrival effect control that part of the scene. Leave the featured release and studio scroll effects on their existing triggers. In `components/hero-carousel.tsx` and `components/hero-carousel.module.css`, keep the normal portrait pose during the morph. Keyboard focus or an intentional browse settles the carousel immediately before handling the interaction. Let `WarpCarousel` take over its ordinary navigation and hover motion after the handoff. Use scoped updates for geometry with no React render on every scroll frame.
4. **Carry the artwork into the existing page transition.** In `components/card-route-transition.tsx`, use a still of the current frame for Watch's flip when a frame is available. Use the matching poster as the fallback. Use that still on both faces, with the current portrait or hover crop. The route overlay currently clones card artwork and reads the image's crop, so it needs an explicit still for a video-backed card. Keep the four existing destinations, selection history and Escape behaviour.
5. **Handle media and motion states.** Start muted inline playback only when the scene is eligible and visible. Keep playback paused after a user pause, when the tab is hidden, offscreen or when another card is active. With autoplay blocked or a failed download, scrub the matching poster through the same geometry. With system or site reduced motion, forced colours or scripts disabled, render a static poster and operable carousel rail in normal document flow. Keep the pause control keyboard accessible when the video can play. [W3C guidance on pausing moving content](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)

The project already has TypeScript, shadcn aliases and Tailwind v4. The shared component path is `components/ui`, and global styles are in `app/globals.css`. Use scoped styles for the arrival effect and the installed GSAP dependency.

Record the approved arrival sequence in [the motion specification](ANIMATION-SPEC.md), [the design system](DESIGN-SYSTEM.md) and the existing design context when implementing it. Document the silent background loop separately from user-initiated episode playback.

## Acceptance checks

- Capture the first view, a frame midway through the scroll, and the landed carousel at phone, tablet and desktop widths. The media frame should finish flush with the real Watch artwork. Check for crop jumps, black frames, duplicate playback, stretched footage, layout shift and horizontal overflow.
- Test slow scroll, fast fling, reverse scroll before browsing, resize and phone rotation. The header and **Watch the latest** remain reachable by normal scrolling, and the page restores its position on Back.
- Test keyboard focus before landing, the skip action, horizontal swipe alongside native vertical scrolling, desktop hover, all four links, and the complete flip and zoom. Test with reduced motion, forced colours, scripts disabled, blocked autoplay and unavailable video. Confirm the video stops when paused, offscreen or in a background tab.
- Run lint, TypeScript and a production build. Verify inline playback and poster fallback in Chrome, Safari and Firefox, including iOS Safari where available. Record outcomes in [Implementation status](IMPLEMENTATION-STATUS.md) and capture the preview for review.
