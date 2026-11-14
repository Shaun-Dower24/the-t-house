# The T-House design system

## Direction

“Enter the House” uses the illuminated house-shaped identity as a starting point. A wall of glass tiles floats in a dark room and traces the house in light. Compact typography and perimeter navigation keep the focus on the room and its interactive wall.

The reference informs pacing and depth. The artwork, type layout and interaction composition are original to this project. Use the actual logo and approved studio images when the client supplies them.

## Colour

| Role | Starting value | Application |
| --- | --- | --- |
| Charcoal | `#0B0B0C` | Main canvas and dark surfaces |
| Warm orange | `#FFAC84` | Accent and active details on dark surfaces |
| Warm white | `#F4EFEB` | Main text and focus outlines |
| Cool blue | `#A9C9FF` | Alternate scene highlights |

These values are proposed brand inputs. Use semantic CSS properties for canvas, foreground, muted foreground, accent and borders so they can be adjusted in one place. Verify text and focus contrast against the surface it actually sits on, especially for small accent text and content over artwork.

## Typography and layout

- Use self-hosted DM Sans for headings and body copy. Use compact system monospace for hotspots, lighting controls and captions.
- Let the opening headline scale fluidly. Preserve readable body copy, comfortable line spacing and consistent content gutters at narrow widths and at browser zoom.
- Align the site header, studio copy and follow actions to a shared grid. On narrow screens, move secondary artwork and editorial details into a natural single-column flow.
- Keep navigation labels descriptive and text links recognisable. Provide a visible focus style and ample pointer targets.

## Components

| Component | Design behaviour |
| --- | --- |
| Header | Studio wordmark, concise section navigation and a skip link. Keep navigation in the document order. |
| Opening | One primary headline, a studio location or descriptor and a clear path to the studio section. |
| Tile wall | Glass-like tiles trace an original house shape. Three labeled links offer studio, YouTube and follow destinations. Hide decorative tiles from assistive technology. |
| Lighting controls | Warm and Cool are native radio choices. Switching them changes the environment and accent lights while the controls remain in place. |
| Studio introduction | A centered illuminated frame, verified copy and a slot for approved photography. Use an original illustration until photography is available. |
| Social links | Clearly identify YouTube and Instagram. Keep destinations discoverable without hover. |
| Footer | Studio attribution and key follow links as appropriate to the layout. |

Photography should preserve the colour and character of the actual space. Reserve dimensions to avoid layout shifts. Write meaningful alternative text for informative images and use empty alternatives for purely decorative images.

## Prototype artwork

The built-in image generator created two environments for the tile wall. `public/images/tile-room.webp` depicts a blackened-timber chamber with amber floor reflections and an open centre. `public/images/tile-room-cool.webp` depicts a slate acoustic chamber with angular baffles and blue floor lighting. `public/images/threshold-detail.webp` shows a gabled entrance with concentric lines. The studio section identifies it as entrance concept artwork. The CSS house mark and site icon are temporary design elements while the approved logo is pending.
