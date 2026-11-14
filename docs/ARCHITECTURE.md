# The T-House architecture

## Stack

| Layer | Approach |
| --- | --- |
| Routing and rendering | Next.js App Router and TypeScript. Render the homepage and metadata on the server. |
| Styling | Tailwind CSS v4 with global CSS custom properties for the design tokens. |
| Animation | GSAP and ScrollTrigger for the scene transition. Evaluate Motion for React when a specific component interaction warrants it. |
| Content | Static typed content where multiple surfaces reuse the same data. Plan a small media model for Watch. |
| Hosting | GitHub-connected Netlify. Validate a branch or deploy preview before requesting production approval. |
| Verification | ESLint, TypeScript, production build and browser checks. |

The prototype uses static content and lightweight browser animation. The design can be implemented with HTML, CSS and a small animation module.

## Proposed source layout

| Area | Responsibility |
| --- | --- |
| `app/layout.tsx` | Root document, typography, site metadata and global CSS |
| `app/page.tsx` | Homepage scene composition |
| `app/globals.css` | Tokens, base styles, reusable utilities and motion fallbacks |
| `components/` | Shared shell, scene components and the client-side animation boundary |
| `public/` | Original illustrations, approved brand assets and locally served images |
| `docs/` | Scope, design, architecture, motion and implementation record |

Keep the core homepage markup readable without client-side scripting. Scope animation to the homepage and use a GSAP context or equivalent lifecycle cleanup to remove timelines and scroll triggers. Use CSS for small interaction states. Defer noncritical media, reserve its dimensions and respect reduced motion during initialization and preference changes.

## Media model for Watch

A future entry should have a stable slug, title, description and YouTube video ID. Add publication date, credited guests, thumbnail and image alternative text only when verified. Derive related entries from actual records when there is enough content. Render external media after a clear user action where practical and keep the direct YouTube destination available.

## Deployment and discovery

Keep the build reproducible from Git and the lockfile. Pin a supported Node runtime in project configuration or document the selected runtime after verification. Netlify should build the application through its Next.js integration. Confirm branch preview behaviour and routing before promotion.

Include descriptive metadata and semantic headings from the foundation. Add canonical URLs, sitemap and production robots policy when the production domain is known. Verify the property in Search Console after launch. Keep analytics identifiers and tracking decisions configurable for future GA4 integration once the property and consent requirements are confirmed.
