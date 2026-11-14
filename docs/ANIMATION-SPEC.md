# The T-House motion specification

## Scene sequence

| Scene | Trigger | Visual change | Baseline |
| --- | --- | --- | --- |
| Arrival | First view | Light builds around the architectural house motif. | The initial HTML gives the page title, studio context and working navigation immediately. |
| Latest release | Native scroll | Architectural lines and lighting guide attention from the opening to the framed release. | Real video information and links stay in the document flow. |
| Watch | Card engagement | Subtle frame emphasis or depth signals the active link. | Focus and touch provide an operable card and labelled destination. |
| Studio | Native scroll | Layering around the studio image creates a change in spatial depth. | Artwork and captions read in a normal sequence. |
| Follow | End of page | The house form returns beside the official channel links. | The channel actions remain visible and keyboard accessible. |

## Interaction rules

- Tie scroll motion to document travel and keep the browser’s normal scrolling, navigation and history.
- Use CSS for brief state changes and GSAP ScrollTrigger for choreographed movement. Keep animation tied to visible layers and clean up when leaving the page.
- Follow the visitor’s system preference. The site’s motion control can further reduce movement. Keep navigation and video controls available from the first view with JavaScript disabled or motion reduced.
- The full-screen menu supports keyboard focus, Escape and returning focus to its opener. Navigation through the menu leads directly to the requested page.
- Decorative motion remains silent. Video is a separate, user-initiated action.

## Verify

Review the house-to-video sequence and framing across phone, tablet and desktop widths. Test native scroll, menu focus, reduced motion, static fallback, page-to-page navigation and video activation. Record outcomes in [Implementation status](IMPLEMENTATION-STATUS.md).
