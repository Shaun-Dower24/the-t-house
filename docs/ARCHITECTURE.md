# The T-House architecture

## Current prototype

| Layer | Approach |
| --- | --- |
| Routing and rendering | Next.js App Router and TypeScript. Render the single homepage and metadata on the server. |
| Styling | Tailwind CSS v4 and CSS custom properties for a shared type, spacing and colour system. |
| Animation | CSS for the outline, states and small visual transitions. GSAP ScrollTrigger for the house-to-feature handoff and restrained decorative movement. |
| Content | A single verified video feature with a direct watch link and a separate channel link. Centralise the video, studio and social details. |
| Media | YouTube hosts the official feature thumbnail. Local studio concept art and below-fold imagery reserve their dimensions and load lazily. |
| Verification | ESLint, TypeScript, production build and browser checks. |

Keep content and actions available independently of animation. Isolate client logic to the menu, preferences and motion, and clean up listeners and animations when their owning components unmount. CSS and GSAP cover the current motion prototype. WebGL requires evidence of material visual benefit and mobile performance before any later inclusion.

## Source layout

| Area | Responsibility |
| --- | --- |
| `app/layout.tsx` | Root document, typography and metadata |
| `app/page.tsx` | Homepage scenes and content hierarchy |
| `app/globals.css` | Design tokens, layout and motion fallbacks |
| `components/` | Shared shell and client interaction boundaries |
| `content/studio.ts` | Shared studio, social and featured video details |
| `public/` | Optimised local media and brand assets |
| `docs/` | Scope, design, architecture, motion and verification |

## Future content and infrastructure

v1.1 proposes an editorial model with a stable slug, title, content type, publication status, factual description, source URL, optional verified external ID, thumbnail and rights status. Guest credits, timestamps, transcripts and related entries depend on verified source content and permissions. Keep direct video links available if an embed cannot play. A hosted headless CMS or repository-backed editor can be selected after editorial ownership, permissions and preview requirements are agreed.

The lockfile and `.nvmrc` record the Node.js 24 build inputs. [Netlify’s Next.js adapter](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) can build the prototype with the repository’s configuration. Production hosting, canonical URLs, sitemap, Search Console, analytics and consent are decisions for the core build and release phases.
