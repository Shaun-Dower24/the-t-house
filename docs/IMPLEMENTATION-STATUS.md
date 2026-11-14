# The T-House implementation status

## Rebuild scope

The full website follows [Website Master Plan v1.1](MASTER-PLAN.md). Its routes cover Home, Watch, the individual release, Inside the House, About and Connect. The homepage feature opens the episode page, where viewers can load the privacy-enhanced player, share the episode or watch directly on YouTube. Its official source supplies the title, 3:43 duration, publication timestamp and thumbnail. [Official upload](https://www.youtube.com/watch?v=9adqs1vgcMA)

| Area | Implementation and review |
| --- | --- |
| Site and motion | House-inspired entrance, progressively enhanced scroll motion, accessible menu and reduced-motion control. |
| Real content | A typed record for the one verified public upload. The library can grow as more releases are verified. |
| Studio identity | Temporary concept artwork and an original house motif. Approved studio photography, logo source and definitive profile copy remain open. |
| Contact | Links to official channels. A dedicated form or email route requires an approved contact destination and privacy treatment. |
| Editorial management | Repository-based updates. A managed CMS depends on the editorial owner, account, draft process and preferences. |
| Hosting and measurement | Local review and GitHub branch work. Production domain, release approval, Search Console, GA4 properties and consent decisions remain open. |

## Verification

| Check | Rebuild result |
| --- | --- |
| Lint, type checking and production build | Passed on Node.js 24. The build prerenders six content pages. |
| Route and metadata checks | All six routes respond successfully. An unknown video returns HTTP 404. Verified the preview indexing rules, structured episode metadata and six sitemap entries with a test public origin. |
| Browser desktop, tablet and phones | Chrome checks passed at 1440, 768, 390 and 320 pixels, including layout fit and loaded imagery. |
| Keyboard, reduced motion and no JavaScript | Verified the skip link, menu navigation and focus return, scroll motion after returning home, persistent motion preference, system reduction and essential links with scripts disabled. |
| Video activation, fallback and sharing | Verified the player loads after activation, the direct YouTube fallback is available and copying the episode URL gives feedback. |
| Accessibility scan | Axe-core found zero automated violations across six routes and the open menu on desktop and mobile. Gradient contrast still requires a complete manual audit before launch. |
| Mobile lab performance | One Lighthouse run against the production preview scored 95, with LCP 2.83 s, CLS 0.014 and total blocking time 38 ms. Measure field Core Web Vitals after launch. |

Confirm domain, permissions and approved studio media before a public release. Cross-browser device testing, field performance and analytics checks belong to the launch environment.
