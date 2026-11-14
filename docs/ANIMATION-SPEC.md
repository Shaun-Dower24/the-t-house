# The T-House animation specification

## Scene sequence

| Scene | Trigger | Visual change | Baseline |
| --- | --- | --- | --- |
| Arrival | First view | The house outline draws in and lights up over a dark, warm canvas. | The outline, title and CTAs are already usable at first paint. |
| Latest video | Ordinary scrolling | The house outline leads into a glowing frame around the single video feature. | The feature is a conventional link with readable labels and immediate access. |
| Inside The House | Approaching the gallery | Offset image framing and small, staggered decorative movement suggest depth. | A readable gallery with static images on reduced motion and a vertical layout on phones. |
| Follow | End of the page | The house and window forms carry through to the closing actions. | YouTube and Instagram links stay visible and keyboard accessible. |

## Interaction rules

- Tie the house-to-feature sequence to native scroll progress. Keep browser history, hashes and keyboard scrolling functional.
- Keep entrance motion brief and non-blocking. The page has no loading gate. Use one restrained animated layer per transition and preserve legibility throughout.
- Preserve equivalent feedback for hover and keyboard focus. Use regular controls on touch.
- Use CSS and GSAP ScrollTrigger for the signature motion. A manual control can reduce movement, with `prefers-reduced-motion` supplying the default. Reduced motion keeps images, titles, links and menu actions available. Skip custom parallax and tilt in that mode.
- The full-screen menu supports keyboard navigation, Escape to close and focus return. Provide access to navigation with scripts disabled.
- The prototype uses silent motion. Any future audio depends on rights and a user-initiated control.

## Verification

Check the outline, frame transition, latest video destination and gallery at desktop and phone sizes. Exercise menu open, Escape, focus return, skip navigation, manual motion, OS reduced motion, preference changes and JavaScript-disabled operation. Check for clipping, broken images, console errors and smooth native scrolling. Record exact evidence in [Implementation status](IMPLEMENTATION-STATUS.md).
