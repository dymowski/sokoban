# Sokoban

A single-page browser game: push every box onto a marked square.
Every visit (and every F5) picks a different level from the pool. Progress is not saved.

Play: **https://dymowski.github.io/sokoban/**

## Controls

| Key          | Action                     |
| ------------ | -------------------------- |
| ↑ ↓ ← →      | move / push a box          |
| Z, Backspace | undo a move                |
| R            | restart the level          |
| N            | another level              |
| Enter        | next level (after winning) |

## Running

Only Docker with `docker compose` is required — Node, npm and the browsers run in containers.

```bash
make init   # .env from .env.example + npm dependencies
make up     # build + nginx → http://localhost:8088 (port: APP_PORT in .env)
make dev    # Vite server with HMR → http://localhost:5188 (DEV_PORT)
make down
```

`make help` lists all targets.

## Tests and quality

```bash
make check              # lint + format-check + typecheck + all tests
make test-unit          # domain, level pool (solver), repo guards
make test-integration   # Svelte components in jsdom
make test-e2e           # Playwright against the built game behind nginx (also in the /sokoban/ subdirectory)
```

## Publishing (GitHub Pages)

The game is static files in `dist/` (`index.html` + one JS + one CSS) — production needs no
application server, any file hosting will do.

- A push to `master` runs the `.github/workflows/pages.yml` workflow: `make check` → `make build` →
  publish `dist/` at https://dymowski.github.io/sokoban/. A red gate means no publishing.
- `base: './'` in `vite.config.ts` gives relative asset paths, so the game works in the `/sokoban/`
  subdirectory; an e2e test run against `http://nginx:8080/sokoban/` guards this.
- One-time repo setting: Settings → Pages → Source: **GitHub Actions**.

## Structure

- `src/domain/` — pure game logic without Svelte/DOM: XSB level parser, moves and undo, key mapping, random level picking, solver (BFS over pushes, used in tests).
- `src/levels/levels.ts` — level pool in XSB format (`#` wall, `@` player, `$` box, `.` goal, `*` box on goal, `+` player on goal).
- `src/ui/` — Svelte components, `src/i18n/` — text dictionary.
- `docker/nginx/` — server configuration, `docker-compose.yaml` — services `node` (tooling), `dev`, `nginx`, `e2e`.

## Adding a level

Add an object to `LEVELS` in `src/levels/levels.ts` and run `make test-unit` — the test checks
that the level parses, is not solved at the start and that the solver finds a solution (≥ 4 pushes).
