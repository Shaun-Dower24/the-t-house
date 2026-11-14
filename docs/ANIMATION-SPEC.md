# The T-House motion specification

## Scene sequence

| Scene | Trigger | Visual change | Baseline |
| --- | --- | --- | --- |
| Arrival | First view and native scroll | White lines trace the house elevation. Its detail recedes as the visitor scrolls toward the framed release. | The initial HTML gives the page title, studio context, visible drawing and navigation immediately. |
| Hero browsing | Drag, swipe, previous or next control, or keyboard navigation | Upright copper cards rotate around a shared 3D stage. The front card comes forward and its neighbours recede into depth, with pale edges defining each face. | A native scroll-snap rail displays the same links in reduced motion and without JavaScript. |
| Hero navigation | A visitor activates a destination card | An angled card comes forward from its current pose. The selected card turns 180° on its vertical axis over 300 ms. Its reverse face then expands for 320 ms, and fades after the destination renders. | Ordinary links open their destinations with system or site reduced motion, or with JavaScript disabled. |
| Latest release | Native scroll | Architectural lines and lighting guide attention from the opening to the framed release. | Real video information and links stay in the document flow. |
| Watch | Card engagement | Subtle frame emphasis or depth signals the active link. | Focus and touch provide an operable card and labelled destination. |
| Studio | Native scroll | Layering around the studio image creates a change in spatial depth. | Artwork and captions read in a normal sequence. |
| Follow | End of page | The house form returns beside the official channel links. | The channel actions remain visible and keyboard accessible. |

## Interaction rules

- Tie scroll motion to document travel and keep the browser’s normal scrolling, navigation and history.
- Use CSS for brief state changes and GSAP ScrollTrigger for choreographed movement. Keep animation tied to visible layers and clean up when leaving the page.
- Follow the visitor’s system preference. The site’s motion control can further reduce movement. Keep navigation and video controls available from the first view with JavaScript disabled or motion reduced.
- The full-screen menu supports keyboard focus, Escape and returning focus to its opener. Navigation through the menu leads directly to the requested page.
- Keep carousel browsing manual. Arrows, keyboard focus and swipes browse destinations without opening a page. Escape during the outgoing card animation cancels it and returns focus to the selected card.
- Decorative motion remains silent. Video is a separate, user-initiated action.

## Verify

Review the house-to-video sequence and framing across phone, tablet and desktop widths. Test the carousel’s forward and receding motion, drag, keyboard browsing, the flip before the zoom, destination focus, browser history, reduced motion and the native rail fallback. Also check menu focus and video activation. Record outcomes in [Implementation status](IMPLEMENTATION-STATUS.md).
