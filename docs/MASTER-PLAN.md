# The T-House website master plan

## Purpose

The T-House is a creative music studio in Leyton, East London, associated with producer SV on the Beat. The website introduces the studio, makes its published media easy to discover and directs visitors to its YouTube and Instagram channels. Dower Digital commissioned the work.

The first milestone is a local homepage prototype with an accessible studio introduction and an animated transition between the opening and the studio section. The named GitHub repository was empty at the start of the work.

The supplied HTML and skills archive were read as reference material. Reviewing the [live Fabian Tjoe-A-On site](https://fabiantjoeaon.com/) and the [designer’s motion demo](https://x.com/tjoeaon/status/2107903894529421444) confirmed its defining pattern: a central glass tile wall that stays in place as the environment changes, with hover previews and compact controls around it. The revised homepage translates that interaction into an illuminated house-shaped pattern, three navigation hotspots and two lighting scenes. The environment artwork and layout were developed for The T-House.

## Visitor journey

| Scene | Visitor experience | Delivery |
| --- | --- | --- |
| The Arrival | A floating tile wall and the headline “Enter the House.” establish the studio identity. Visitors can select a hotspot, change the scene lighting or scroll directly to the studio. | Initial prototype |
| Entering the House | The opening recedes as the studio section comes into view. Architectural lines, layering and typography create depth. | Initial prototype |
| Inside the House | An editorial studio introduction. Approved photographs of the space can replace the illustrative treatment and support a gallery. | Introduction in prototype, photography and gallery after asset delivery |
| The Content | A prominent route to the studio’s published media, then an expandable Watch library. | Channel link in prototype, individual media once verified |
| Stay Connected | YouTube and Instagram are the principal follow actions. A future collaboration page gives visitors a verified way to enquire. | Social links in prototype, enquiry route in Phase 4 |

## Routes and delivery

| Route | Role | Phase |
| --- | --- | --- |
| `/` | Opening, studio introduction and social discovery | 2–3 |
| `/watch` | Expandable library of verified media | 4 |
| `/watch/[slug]` | Verified video, optional publication date and guest information, related content when available | 4 or later |
| `/inside` | Studio introduction and gallery using approved images | 4 |
| `/about` | Verified brand and studio background | 4 |
| `/contact` | Verified contact details or a collaboration enquiry flow | 4 |

Navigation in the prototype should point to homepage sections or working social destinations. Add links to supporting routes as those pages become available.

## Delivery phases

1. **Planning.** Confirm repository state, gather available project guidance and record scope, architecture, design, motion and acceptance criteria.
2. **Foundation.** Create the feature branch and build the App Router shell with a reusable site layout, responsive typography, CSS tokens, metadata and accessible navigation.
3. **Initial prototype.** Implement the opening, scroll transition and first studio section. Use an original architectural illustration until studio photography is available.
4. **Supporting content.** Integrate approved photography and video, then build Watch, Inside, About and Contact. Make future content additions data-driven.
5. **Production readiness.** Verify accessibility, layout, motion, performance, indexing and Netlify deployment readiness. Obtain approval before merging into `main` or deploying to production.

## Acceptance criteria for the first milestone

- `npm ci`, lint, type checking and a production build run from the feature branch. Record actual results in [Implementation status](IMPLEMENTATION-STATUS.md).
- The homepage opens directly at `/`. A visitor can read and navigate before motion initializes and with motion disabled.
- Desktop and mobile show a legible opening, a reachable studio introduction and working links to the studio’s YouTube and Instagram channels.
- Navigation is operable by keyboard with visible focus. Reduced-motion settings preserve the same content and actions. Media and sound never start on their own.
- The illustration reads as a design treatment. Captions and copy use verified studio information. Introduce authentic studio photography only when available.
- Browser checks exercise desktop, mobile, keyboard and reduced motion. Record any checks that could not be run.
- The feature branch remains separate from `main`. The initial handoff is a working local prototype.

## Inputs for subsequent phases

| Input | What it enables |
| --- | --- |
| Approved house logo in vector or high-resolution raster form | Accurate reproduction of the white architectural lines and orange handwritten lettering |
| Approved studio photos, credits, publication permissions and descriptions | The first studio photograph, gallery and share imagery |
| Direct link to the confirmed YouTube upload and its verified metadata | A featured video and its Watch entry |
| Approved studio description, contact destination and any enquiry requirements | About copy, contact page and collaboration workflow |
| Production domain and Netlify project details | Canonical URLs, sitemap, verified deployment and Search Console setup |
| GA4 property, consent requirements and agreed conversion events | Measurement for social follow, video discovery and future collaboration enquiries |

Social channels supplied in the brief are [YouTube](https://www.youtube.com/@thethousestudio) and [Instagram](https://www.instagram.com/thethousestudio/).
