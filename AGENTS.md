# Repository guidance

- Read [the master plan](docs/MASTER-PLAN.md), [design system](docs/DESIGN-SYSTEM.md), [architecture](docs/ARCHITECTURE.md) and [motion specification](docs/ANIMATION-SPEC.md) before changing the website.
- Follow the scoped delivery phases. Use a feature branch. Merging into `main` and production deployment require explicit approval.
- Use Next.js App Router, TypeScript and Tailwind for the foundation. Keep server rendering as the default and contain client-side animation in the smallest practical boundary.
- Maintain ordinary scroll, functional section links, visible keyboard focus, legible responsive layouts and a complete reduced-motion baseline. Keep the initial render usable before animation initializes.
- Use studio-supplied or verified content for photography, guests, services, video metadata and claims about the business. Treat the design reference as inspiration. Keep third-party reference code and artwork out of the project.
- Before handoff, run lint, TypeScript and a production build. Exercise the relevant browser paths and record results and open issues in [Implementation status](docs/IMPLEMENTATION-STATUS.md).
