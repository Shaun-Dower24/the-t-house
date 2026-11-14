# The T-House website master plan

## Source of truth

The user confirmed that **The T-House Website Master Plan v1.1**, dated 14 November 2026, governs this project. This repository summary carries forward its scope and decisions. The plan describes a prior standalone motion prototype built for review and sets visual direction and verified content as the next decisions before a production website.

The T-House is a creative music studio in Leyton, East London, associated with producer SV on the Beat. The website's primary goal is to help people discover published content and follow the studio on [YouTube](https://www.youtube.com/@thethousestudio) and [Instagram](https://www.instagram.com/thethousestudio/). The studio and its story give visitors a reason to remember the brand. Collaboration and service enquiries depend on an approved offering and contact destination.

## Current milestone

Continue with the single-page **Enter The House** motion prototype for review. The signature motif is the illuminated outline of the house. It connects the arrival to a single featured video and leads into the studio. The [Fabian Tjoe-A-On reference](https://fabiantjoeaon.com/) informs atmosphere, motion continuity and small monospace labels. The T-House design draws its identity from the house sign, warm orange light and actual studio media.

| Scene | Visitor experience |
| --- | --- |
| Arrival | A warm dark canvas, a house outline that lights up, and immediately usable Watch Latest and Explore The House links. |
| Latest video | The opening linework leads into a framed card for [Fifa In The T EP 1: SV Vs Kojo Funds](https://www.youtube.com/watch?v=9adqs1vgcMA), the single upload verified on the official channel. The card uses YouTube’s thumbnail and links directly to the video. |
| Inside the house | A staggered gallery and studio context. Use the three supplied studio photographs when recovered and cleared for this use. Label any temporary concept art. |
| Follow | Visible links to YouTube and Instagram. |
| Navigation and preferences | A full-screen menu with keyboard support, a skip link and manual motion control alongside the system preference. |

The visual prototype uses ordinary HTML as its baseline. Native scrolling, reduced-motion support and a straightforward phone layout preserve access to every link. The working branch is `feature/immersive-homepage`.

## Later website scope

| Route | Role |
| --- | --- |
| `/` | Signature opening, featured media, studio preview and follow actions |
| `/watch` | Library of verified content once there is enough material to browse |
| `/watch/[slug]` | Direct video, factual context and related entries where available |
| `/inside-the-house` | Approved studio photographs, story and behind-the-scenes media |
| `/about` and `/connect` | Approved studio and producer profile plus collaboration or enquiry routes. These may be combined in a compact navigation. |

The first milestone ends at prototype review. Review the visual direction and animation strength with the client, secure the media and permissions, and agree the next scope before the core website or CMS build. Phase 3 in v1.1 is the core website build. Phase 4 adds motion integration and launch-candidate QA. Phase 5 covers the approved production launch and measurement. Netlify build settings support evaluation of a GitHub preview. The production hosting and release remain subject to project approval.

## Inputs to close

- Original house mark or approved brand source, and studio photography with the necessary usage permissions.
- A verified publish date if used in the editorial record. Add library content as it is verified.
- Approved studio and SV profile copy, a collaboration contact destination and publishing ownership.
- Scope decision for the CMS, approved domain and host, launch permissions, and analytics and consent requirements.

Verification of the implementation lives in [Implementation status](IMPLEMENTATION-STATUS.md).
