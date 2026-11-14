# The T-House animation specification

## Motion goals

The opening establishes the studio’s architectural identity and gives visitors an immediate route into the page. The transition uses ordinary scrolling to reveal depth and change emphasis. The resting state at every stage must remain readable.

## Sequences

| Sequence | Trigger | Direction | Accessible behaviour |
| --- | --- | --- | --- |
| Opening composition | Initial view | The tile wall traces a house shape. A few tiles brighten briefly. | The headline, hotspots and lighting controls appear in the first render. |
| Wall previews | Hover or visible keyboard focus | A hotspot changes the illumination behind the tiles. On desktop the decorative wall also tilts gently toward the pointer. | The destination is always labeled. Focus reveals the same preview as hover. |
| Lighting scenes | Warm or Cool selection | The environment and accents change around the stationary tile wall. | Native radios support keyboard and touch. Lighting choices remain available with JavaScript disabled. |
| Studio transition | Natural page scroll | Ease the decorative entrance artwork forward as the studio section comes into view. Keep both headings fixed within their sections. | Scrolling, anchor links and browser history behave normally. |
| Studio introduction | Approaching the section | Use a restrained reveal for decorative layers. Keep the text and art visible in their static baseline. | Reduced motion displays the final composition immediately. |
| Link feedback | Pointer or keyboard | Short colour or underline changes. | Keyboard focus has a visible static outline. |

## Implementation

The opening brightens selected tiles once over 3.6–4.5 seconds. CSS supplies hotspot previews and scene lighting. ScrollTrigger scales the entrance environment to 116% on wide screens and 108% on narrow screens as the visitor scrolls toward the studio. The close crop in the studio section uses shorter vertical parallax. Pointer tilt applies to the artwork alone. The animation component cleans up ScrollTrigger and pointer listeners when motion is disabled or the component unmounts.

Use `prefers-reduced-motion` in CSS and when deciding whether to initialize scroll effects. Disable parallax and entrance effects for that preference. The page uses native scrolling, including instant section jumps. Initial HTML and CSS form a usable composition if the animation module never runs. Narrow viewports use shorter motion travel.

## Verification

- At a narrow and a wide viewport, confirm the opening and studio section stay within the viewport and remain legible while scrolling.
- Activate the studio jump link with keyboard input and confirm the section is reached.
- Reload with reduced motion enabled and confirm that content and actions remain visible with the scroll effect disabled.
- Disable JavaScript and confirm that the homepage, section navigation and social links remain available.
- Resize across a breakpoint after load and check for misplaced artwork, scroll jumps and blocked controls.
