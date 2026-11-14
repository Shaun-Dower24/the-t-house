# The T-House

Website prototype for The T-House Studio, a creative music studio in Leyton, East London. The first milestone introduces the studio through an architectural opening and a scroll transition, with links to the studio’s YouTube and Instagram channels.

## Run locally

Use the Node.js version supported by the project and install dependencies from the lockfile.

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

The intended hosting workflow is GitHub-connected Netlify with a branch or deploy preview before production approval.
