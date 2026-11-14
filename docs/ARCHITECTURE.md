# The T-House architecture

| Layer | Approach |
| --- | --- |
| Rendering | Next.js App Router and TypeScript. Public pages render crawlable HTML with stable paths and per-page metadata. |
| Styling | Tailwind CSS v4 with shared CSS custom properties for type, spacing, colour and focus. |
| Motion | CSS and GSAP ScrollTrigger enhance the home sequence. The menu and preference control use focused client components. |
| Content | Typed, repository-backed video and studio content. One verified YouTube release drives the homepage, Watch library and video page. |
| Video | The poster links to the video page and the player loads after visitor action. The page uses YouTube’s privacy-enhanced player and keeps the direct YouTube link available. |
| Sharing and discovery | The video has a stable route, share controls and dedicated preview metadata. The approved `SITE_URL` supplies the public origin for canonicals and the sitemap. |
| Enquiries | Connect uses official studio channels. A form depends on an approved recipient and contact data handling. |
| Hosting | Node.js 24 and the checked-in lockfile. The repository includes Next.js build settings for Netlify evaluation. |

## Source map

| Area | Responsibility |
| --- | --- |
| `app/layout.tsx`, `components/` | Root metadata, shared navigation, footer, preferred motion and homepage enhancements. |
| `app/page.tsx`, `app/globals.css` | Home composition, shared design tokens, layout and motion fallbacks. |
| `app/watch/` | Media library, stable video pages and progressive video and share controls. |
| `app/inside-the-house/`, `app/about/`, `app/connect/` | Studio, brand story and official contact routes. |
| `content/studio.ts` | Verified video, studio and channel records. |
| `content/site.ts`, `app/robots.ts`, `app/sitemap.ts` | Canonical and social metadata, indexing controls and sitemap. |
| `public/` | Local artwork and images. |

## Editorial workflow

1. Verify each new release against its official platform page. Record the exact title, video ID and URL, duration, publication timestamp, publisher and official thumbnail. Confirm embedding policy, visibility and asset rights.
2. Add or update the typed record in `content/studio.ts`. Use a unique stable slug, a factual editorial description and the appropriate content kind. Link related slugs when verified. Add names, topics, chapters and transcripts to the editorial model when the site has a use for them and the material is cleared.
3. Use a review branch and inspect the website preview. Check the Watch library, feature selection, individual route, playback fallback, thumbnail, metadata and share link. Keep published slugs stable. If a video is removed or restricted, update its record, review how its page should appear and verify old links.
4. Publish through the agreed review process. Check the public URL and video destination after release. A future CMS can use the same content fields once editors, draft previews, and account access are agreed.

The build works with `SITE_URL` unset. Preview builds with no `SITE_URL` send a `noindex` directive and disallow crawling in `robots.txt`. Use host access controls for a private preview. Configure the final HTTPS origin after confirming domain ownership and release approval. Plan Search Console, any GA4 events and privacy copy around the approved launch configuration and editorial workflow.
