# The T-House animation specification

## Motion goals

The opening establishes the studio’s architectural identity and gives visitors an immediate route into the page. The transition uses ordinary scrolling to reveal depth and change emphasis. The resting state at every stage must remain readable.

## Sequences

| Sequence | Trigger | Direction | Accessible behaviour |
| --- | --- | --- | --- |
| Opening composition | Initial view | Bring architectural linework into view and add subtle background movement. The headline and links appear in the first render. | No gate, loading screen or delayed access to controls. |
| Studio transition | Natural page scroll | Let the opening recede while the studio heading and artwork approach their resting positions. Use modest travel and a limited number of layers. | Scrolling, anchor links and browser history behave normally. |
| Studio introduction | Approaching the section | Use a restrained reveal for decorative layers. Keep the text and art visible in their static baseline. | Reduced motion displays the final composition immediately. |
| Link feedback | Pointer or keyboard | Short colour or underline changes. | Keyboard focus has a visible static outline. |

## Implementation

Use ScrollTrigger for motion tied to the transition between scenes. Prefer `transform` and `opacity` on small decorative layers. Avoid layout-driven scroll handlers, forced scroll positions and sustained effects that compete with the text. Keep effects within one lifecycle boundary and clean them up on unmount.

Use `prefers-reduced-motion` in CSS and when deciding whether to initialize scroll effects. Disable parallax, entrances and smooth scrolling for that preference. Set the page up so initial HTML and CSS form a finished, usable composition if the animation module never runs. Reduce travel and avoid heavy effects on narrow viewports.

## Verification

- At a narrow and a wide viewport, confirm the opening and studio section stay within the viewport and remain legible while scrolling.
- Activate the studio jump link with keyboard input and confirm the section is reached.
- Reload with reduced motion enabled and confirm that content and actions remain visible with the scroll effect disabled.
- Disable JavaScript and confirm that the homepage, section navigation and social links remain available.
- Resize across a breakpoint after load and check for misplaced artwork, scroll jumps and blocked controls.
