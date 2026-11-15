# The T-House

The T-House is a creative music studio in Leyton, East London. This site rebuild follows the Website Master Plan v1.1. It connects an illuminated house entrance to the studio’s verified YouTube release, a Watch library, a studio introduction, About and Connect.

## Run locally

Use Node.js 24 and install the locked dependencies.

```sh
npm ci
npm run dev
```

Open [the local homepage](http://localhost:3000).

For a production build preview, use `npm run build` and then `npm run start`. Run `npm run lint` and `npm run typecheck` before handing over changes.

## UI components

Reusable components live in `components/ui`, so project features and shadcn examples can use the same `@/components/ui` imports. TypeScript and Tailwind are already configured. Shared styles live in `app/globals.css`, and the hero styles live in `components/hero-carousel.module.css`.

Import `WarpCarousel` from `@/components/ui/warp-carousel`. Rendering `<WarpCarousel />` in a sized container runs the supplied canvas demo. The homepage passes the navigation option to use the fitted Warp motion with real destination links.

shadcn is configured in `components.json` with `app/globals.css` as its stylesheet and `@/components/ui` as its UI alias.

Connect uses [Animated Link](components/ui/animated-link.tsx). The [Animated Link demo](components/ui/animated-link-demo.tsx) shows the left, right and center variants.

## Configuration

The local build works without environment variables. Set `SITE_URL` to the approved public origin, including `https://`, when the release is authorised to be indexed. It provides canonical URLs and the sitemap origin. Leave it unset for local and preview environments.

The repository includes [Netlify build settings](netlify.toml). Run production and deployment checks against the approved preview before launching.

## Project documentation

- [Master plan and scope](docs/MASTER-PLAN.md)
- [Design system](docs/DESIGN-SYSTEM.md)
- [Motion specification](docs/ANIMATION-SPEC.md)
- [Architecture and editorial workflow](docs/ARCHITECTURE.md)
- [Implementation status and verification](docs/IMPLEMENTATION-STATUS.md)
