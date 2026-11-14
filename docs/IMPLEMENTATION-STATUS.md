# The T-House implementation status

## First milestone

The starting GitHub repository had no files or commits. The first milestone is on `feature/immersive-homepage` and covers planning, the application foundation and the initial homepage prototype.

| Item | Status |
| --- | --- |
| Scope, design system, architecture and motion documentation | Complete |
| Feature branch and application foundation | Next.js App Router, TypeScript, Tailwind CSS, self-hosted fonts and semantic page metadata |
| Homepage opening, transition and studio introduction | Full-screen glass tile wall, three navigation hotspots, two environmental scenes, GSAP scroll motion and a framed studio introduction |
| Authentic studio imagery and official logo | Awaiting approved source assets |
| Featured video | Direct upload URL and metadata required |
| Watch, Inside, About and Contact pages | Planned for Phase 4 |
| Netlify deployment and production launch | Build configuration is in place. Preview and production verification remain pending. |

## Verification log

| Check | Result |
| --- | --- |
| Clean install | `npm ci --no-audit` passed on Node.js 24.15.0 and npm 11.12.1 |
| ESLint | `npm run lint` passed |
| TypeScript | `npm run typecheck` passed |
| Production build | `npm run build` passed and prerendered `/` |
| Production dependency audit | `npm audit --omit=dev` reported zero findings |
| Browser desktop and mobile | Playwright in Chrome at 1440 × 900, 390 × 844 and 320 × 720 verified the studio jump, social destinations, metadata, scroll-driven artwork and fit. All contexts were free of console errors. |
| Keyboard, reduced motion and no JavaScript | Playwright verified visible focus and skip-link focus transfer, static artwork under reduced motion and usable navigation with JavaScript disabled. |
| Resize and motion preference changes | Playwright verified animation adjusted across breakpoints and cleaned up and restarted when the system motion preference changed. |
| Automated accessibility scan | The initial milestone and the redesign had zero detected axe-core 4.12.1 violations. See the redesign checks below. |

## Reference-driven revision

The revised stage follows the live reference’s spatial hierarchy and uses an interactive wall as the centre of the first screen. Warm and Cool change the surrounding artwork while the wall and navigation stay in place. The studio hotspot previews the framed artwork, and the Watch and Follow hotspots each have a distinct abstract lighting preview. The Watch hotspot links to the supplied channel while the individual upload details are pending.

Lint, type checking and the production build passed again. Playwright in Chrome verified three distinct hover previews, keyboard-focus preview, pointer tilt, keyboard and touch lighting selection, links and scroll motion at 1440 × 900, 390 × 844 and 320 × 720. The checks also passed with reduced motion or JavaScript disabled. Axe-core detected zero violations for the WCAG 2.0–2.2 AA checks run in both lighting scenes at desktop and mobile sizes. Contrast checks for the layered backgrounds were reviewed manually. The hotspot text is at least 8.29:1 across normal and active states using the brightest possible background composite, and the studio caption and body text are at least 8.68:1 over the gradient.

The full npm audit reported seven moderate findings in the ESLint and TypeScript ESLint dependency chain stemming from `minimatch`. The current tooling resolves a version within the advisory range. Recheck the development tree when its upstream dependency range changes.

The browser checks covered Chrome with emulated mobile viewports. Cross-browser testing, live Core Web Vitals, Search Console and the Netlify preview remain Phase 5 work. The Watch library needs the confirmed upload URL and metadata. The gallery needs approved photography and the official logo.
