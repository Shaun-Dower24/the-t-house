# The T-House motion specification

## Scene sequence

| Scene | Trigger | Visual change | Baseline |
| --- | --- | --- | --- |
| Arrival | First view and native scroll | A silent video below the header shrinks into the real Watch artwork slot in a sticky stage. GSAP ScrollTrigger updates only DOM geometry; the house and neighbouring cards emerge. Reverse scroll expands it until intentional browsing settles the scene. | A static matching poster and native carousel rail remain in normal flow without scripts, in forced colours or with system/site reduced motion. |
| Hero browsing | Drag, swipe, previous or next control, or keyboard navigation | Warp Carousel’s fitted 3D path moves upright charcoal cards through the shared stage. The front card comes forward, neighbours recede into depth, and button turns use Warp’s fitted timing. | A native scroll-snap rail displays the same links in reduced motion and without JavaScript. |
| Hero navigation | A visitor activates a destination card | An angled card comes forward from its current pose. The selected card turns 180° on its vertical axis over 300 ms. Its reverse face then expands for 320 ms, and fades after the destination renders. | Ordinary links open their destinations with system or site reduced motion, or with JavaScript disabled. |
| Latest release | Native scroll | Architectural lines and lighting guide attention from the opening to the framed release. | Real video information and links stay in the document flow. |
| Home studio preview | Hover, focus or activate an artwork panel | The selected image widens and its caption turns horizontal. On desktop, scroll shifts the image within its frame. | Native disclosure controls open the images with scripts disabled. Reduced motion displays the selected state instantly. |
| Watch | Card engagement | Subtle frame emphasis or depth signals the active link. | Focus and touch provide an operable card and labelled destination. |
| Connect | Hero visible at 36rem or wider with motion enabled | Monochrome television waves move behind the collage and respond to the pointer. The render stops when the viewer moves down the page or switches tabs. | A static scanline texture appears on small screens, with reduced motion, without WebGL and without JavaScript. |
| Connect heading | The heading enters view with motion enabled | A single signature-red ink reveal follows the Hurricane letterforms and hands off to selectable text. | The heading appears as text while loading and with reduced motion, forced colors, unavailable WebGL2 or JavaScript disabled. |
| Connect artwork | A horizontal drag or the Next image button | The foreground frame moves to the back and the other artwork takes its place. Vertical gestures scroll normally. | The button swaps the images instantly with reduced motion. Both artworks render in the initial positions with JavaScript disabled. |
| Connect Bento heading | The section heading enters view with motion enabled | The words of “Watch and get in touch” rise once through their masks with a short stagger. | The full section label is available from the first render and stays visually static with reduced motion or JavaScript disabled. |
| Connect draft heading | The heading enters view with motion enabled | A signature-red pen tip traces the white Barlow outlines and white fill rises into the letters once. The effect hands off to selectable text. | The heading appears as plain text while loading, with reduced motion or forced colors, or when JavaScript or SVG geometry is unavailable. |
| Connect message preview | A draft becomes ready to copy | The live preview gains a signature-red leading edge and a brief outline. The text and its selection stay in place. | Reduced motion and forced colors use a static edge. Without JavaScript, the Instagram link is available directly. |
| Connect FAQ | The heading enters view, a question opens or a mouse moves across the list | The white Barlow heading rises through a mask. A circular reveal fills the open question with signature red and the plus turns into an ×. A soft neutral highlight follows the mouse along the edges. | The title stays readable while loading. The disclosure responds immediately with reduced motion or forced colors. Native question and answer links work without JavaScript. |
| Studio artwork | Hover or focus on a rail, or activate a gallery label | The selected frame expands across the gallery. In narrow layouts, a tap expands the artwork below its label. | Panels switch instantly with reduced motion and the labels work as native disclosures with JavaScript disabled. |
| Follow | End of page | The house form returns beside the official channel links. | The channel actions remain visible and keyboard accessible. |

## Interaction rules

- Tie scroll motion to document travel and keep the browser’s normal scrolling, navigation and history.
- Use CSS for brief state changes and GSAP ScrollTrigger for choreographed movement. Keep animation tied to visible layers and clean up when leaving the page.
- Follow the visitor’s system preference. The site’s motion control can further reduce movement. Keep navigation and video controls available from the first view with JavaScript disabled or motion reduced.
- The full-screen menu supports keyboard focus, Escape and returning focus to its opener. Navigation through the menu leads directly to the requested page.
- Keep carousel browsing manual. Arrows, keyboard focus and swipes browse destinations without opening a page. Escape during the outgoing card animation cancels it and returns focus to the selected card.
- On desktop pointer hover, widen a resting card to 16:9 over 300 ms. Pause the preview during turns and dragging. Use the current card size and artwork as the first frame of the flip.
- Reveal the spray underline beneath the carousel arrows on pointer hover or visible keyboard focus. Show the full mark immediately in reduced motion.
- The silent homepage background loop is decorative and has an explicit pause control. It pauses offscreen, in hidden tabs, after user pause and when Watch is not active. Autoplay failure retains the poster. Episode playback remains a separate, user-initiated action.

## Verify

Review the house-to-video sequence and framing across phone, tablet and desktop widths. Test the carousel’s forward and receding motion, drag, keyboard browsing, the flip before the zoom, destination focus, browser history, reduced motion and the native rail fallback. Also check menu focus and video activation. Record outcomes in [Implementation status](IMPLEMENTATION-STATUS.md).
