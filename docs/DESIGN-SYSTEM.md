# The T-House design system

## Visual direction

The supplied studio mark governs the visual identity. Its white rooflines and overlapping elevations inform the large homepage drawing and thin frames. Red brush-script titles carry the signature’s energy into destination pages. Neutral charcoal keeps the linework prominent and provides depth behind the carousel.

The reference uses thin illuminated edges and panels that gain or recede in depth as a user explores. Use that principle to give an active surface weight, with the current action always apparent in the text and focus treatment. [Recorded reference](https://www.landing.love/sites/fabiantjoeaon/)

The hero uses Warp Carousel’s fitted camera, card path and spin timing with the white and red accents of the logo. The T-House cards are HTML links whose artwork and labels move together through the shared 3D scene. [Warp Carousel by Louis Studios](https://21st.dev/@louisstudios/components/warp-carousel)

The hero cards show artwork in colour on matte charcoal. The Watch card reframes the episode thumbnail around the person and reduces its bright backdrop. The reverse face carries the same colour and framing through the flip. A dark fade behind the labels keeps the text legible.

The carousel uses white, hand-drawn arrows based on the logo lettering. A rough red underline with spray speckles draws in beneath an arrow on hover or keyboard focus.

On desktop, a hovered portrait card expands into a 16:9 artwork frame. Its height stays steady, and a side card levels out and stays within the carousel. Watch opens its landscape thumbnail within the frame. Selecting the preview begins the existing flip and zoom. [Expanding Cards on 21st.dev](https://21st.dev/@vaib215/components/expanding-cards)

## Colour and type

- Use `#0B0B0B` for the canvas, `#171717` for surfaces and `#232323` for depth. Sign white `#F5F5F5` defines architectural strokes, frames and focus.
- Use `#C83838` for short display titles, the signature and the carousel’s spray underline. The colour comes from pixel (116, 115) in the red lettering of the original JPEG, measured from its top-left corner. Its green and blue channels are equal. Use white for small text, current-page underlines and visible focus outlines.
- Use Hurricane for short display titles and Barlow for long episode titles, navigation, labels, controls and body. Hurricane was closest among the rendered specimens in the long T crossbar, slanted H and compact joined lowercase. The underlying typeface of the original 150 × 150 JPEG signature remains unverified. [Hurricane](https://fonts.google.com/specimen/Hurricane) · [Official release](https://www.youtube.com/watch?v=9adqs1vgcMA) · [Barlow](https://fontsource.org/fonts/barlow)
- Keep links and controls readable over artwork, dimmed gradients or in reduced-motion mode. Reserve media dimensions. Give pointer hover and keyboard focus comparable emphasis.

## Shared surfaces

| Surface | Design behaviour |
| --- | --- |
| Header, menu and footer | The white house and red handwriting from the supplied mark, white navigation labels and fine dividers. The compact footer groups the logo with site navigation and social links. |
| Opening | A full-bleed silent loop below the header crops into the actual upright 1:2 Watch card on native scroll. The white house and three neighbouring cards emerge on matte charcoal. The same video then follows ordinary carousel turns and desktop hover. No pause or Explore controls overlay the media. Tab moves from the header into the carousel and focus settles the arrival. The header's Skip to content link remains available. Reduced motion, forced colours and no JavaScript use a static poster and scroll-snap rail. The adjustable `--arrival-focal-point` controls the poster crop; the iframe uses centred 16:9 cover. |
| Carousel backdrop | SVOnTheBeat's Instagram reel `DePXvADO6zk`, with hosting permission confirmed by the owner, plays silently behind the house and cards. The separate absolute layer follows the arrival reveal without affecting geometry. Phones use full-bleed cover under a 72% `#0B0B0B` scrim. At 48rem and up, “inside the house” replaces the rejected contain/blur treatment: video/poster cover the elevation box but share a mask derived from its nine window openings and door. Use the same 1000×540 coordinate space, centred aspect preservation and placement as the elevation. A 35% canvas tint makes the openings read as lit interiors; outside remains plain canvas, house lines stay on top and cards intentionally obscure some panes. No blurred fill or visible controls. Reduced motion/no JS/errors use the same masked poster; forced colours omit the whole backdrop. |
| Watch and episode | Red script identifies the Watch library. Grayscale video posters and the full-colour privacy-enhanced player sit in white projection frames. Full episode titles use Barlow. |
| Studio and profile | Script titles, pale elevation detail and one outlined profile panel. The home preview uses image-filled rails with a horizontal caption on the expanded image. The studio exhibit pairs the same concept images with a ruled caption and separate vertical label rails. Both use stacked disclosure rows in narrow layouts. |
| Connect | Thin side rules frame the layout on wide screens. A red script title and overlapping monochrome concept artwork sit above the link grid, with a muted dot texture beside its heading. A static red waveform marks the episode frame. The message draft spans the full grid in a single frame with corner marks. Write and Preview share one panel when space is limited and sit side by side when it is wide enough. |

## Existing-surface glass treatment

Keep the original homepage markup, copy, links and layout. Apply shared `--glass-*` CSS tokens to existing carousel labels/controls, Watch frame/caption/play/duration surfaces and studio copy/caption. Shared header, menu button and footer also receive the treatment site-wide. Use `rgba(20,22,26,.72)`, 16px blur including WebKit, a 12% white hairline and soft shadow. Decorative pseudo-elements and inset strokes preserve box geometry; no extra sections or React components. Unsupported backdrop filtering and reduced transparency use #171717; forced colours use system surfaces. Red/canvas/Hurricane/Barlow and existing focus/hover behaviour remain unchanged.

## Homepage entrance

The homepage's revision-2 “Enter the house” gate uses an intro-only segmented copy of `HouseElevation`, not an enlarged raster mark. White lines draw in ground/wall/roof/window/door order over about 3.5 seconds. “The T-House” sprays left to right in Hurricane and signature red `#C83838` over 1.2 seconds, using a soft SVG brush mask, grain, restrained glow and sparse overspray. A tracked uppercase Barlow button fades in, receives focus and has a visible white focus ring. Its activation swings the door on a left hinge (600 ms), then zooms through the measured hero aperture (1000 ms) to the existing arrival video/poster. The labelled modal holds focus and scroll until entry, with an inert background; wheel and touch defaults are not cancelled. Drawing input reveals the button rather than entering. Escape at the button enters immediately. There is no hard cap; six-second CSS failure safety shows the static title/button, or clears an unhydrated pending gate. Once-per-tab eligibility, reduced motion, forced colours, no-JS, restored history and internal-navigation skips are unchanged.

## Artwork and rights

The studio mark uses the supplied 150 × 150 px JPEG as its source. The displayed mark isolates the white drawing and red handwriting over a transparent background. Use it at a compact display size. A vector or higher-resolution original would support a larger or sharper mark. The temporary studio artwork is identified as an illustration in context. The YouTube image belongs to the official release and forms part of its Watch card and share preview.
