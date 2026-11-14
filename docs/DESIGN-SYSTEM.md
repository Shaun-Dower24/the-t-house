# The T-House design system

## Direction

“Enter the House” uses the illuminated house-shaped identity as a starting point. Dark surfaces, a warm orange accent and architectural outlines establish the setting. Large typography establishes the opening, while readable editorial copy and clear links make the site easy to use.

The reference informs pacing and depth. The artwork, type layout and interaction composition are original to this project. Use the actual logo and approved studio images when the client supplies them.

## Colour

| Role | Starting value | Application |
| --- | --- | --- |
| Charcoal | `#151515` | Main canvas and dark surfaces |
| Orange | `#F15A29` | Accent, active details and emphasis |
| Warm white | `#F2EEE8` | Text on dark surfaces and high-contrast graphic lines |
| Wood brown | `#745443` | Supporting surface tone and photography direction |

These values are proposed brand inputs. Use semantic CSS properties for canvas, foreground, muted foreground, accent and borders so they can be adjusted in one place. Verify text and focus contrast against the surface it actually sits on, especially for small accent text and content over artwork.

## Typography and layout

- Use a bold display face for the opening and section headings, paired with a readable sans serif for body copy and controls. Keep fallbacks robust and prefer self-hosted assets when licensing and availability allow.
- Let the opening headline scale fluidly. Preserve readable body copy, comfortable line spacing and consistent content gutters at narrow widths and at browser zoom.
- Align the site header, studio copy and follow actions to a shared grid. On narrow screens, move secondary artwork and editorial details into a natural single-column flow.
- Keep navigation labels descriptive and text links recognisable. Provide a visible focus style and ample pointer targets.

## Components

| Component | Design behaviour |
| --- | --- |
| Header | Studio wordmark, concise section navigation and a skip link. Keep navigation in the document order. |
| Opening | One primary headline, a studio location or descriptor and a clear path to the studio section. |
| Architectural graphic | Original visual interpretation of the house shape. Treat it as decorative when adjacent text already carries its meaning. |
| Studio introduction | Editorial heading, verified copy and a slot for approved photography. Use an original illustration until photography is available. |
| Social links | Clearly identify YouTube and Instagram. Keep destinations discoverable without hover. |
| Footer | Studio attribution and key follow links as appropriate to the layout. |

Photography should preserve the colour and character of the actual space. Reserve dimensions to avoid layout shifts. Write meaningful alternative text for informative images and use empty alternatives for purely decorative images.
