# The T-House

Review prototype for The T-House Studio, a creative music studio in Leyton, East London. The scope follows the original Website Master Plan v1.1. The homepage leads from an illuminated house outline to the studio’s verified YouTube upload, the studio introduction and social links.

## Run locally

Use Node.js 24 and install dependencies from the lockfile.

```sh
npm ci
npm run dev
```

Open [the local homepage](http://localhost:3000).

## Verification

```sh
npm run lint
npm run typecheck
npm run build
```

See [Implementation status](docs/IMPLEMENTATION-STATUS.md) for browser coverage, asset requirements and checks still pending.

## Project documentation

- [Master plan](docs/MASTER-PLAN.md)
- [Design system](docs/DESIGN-SYSTEM.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Animation specification](docs/ANIMATION-SPEC.md)
- [Implementation status](docs/IMPLEMENTATION-STATUS.md)

The [Netlify configuration](netlify.toml) uses the automatic Next.js adapter. Connect the GitHub repository and validate a preview before the production release.
