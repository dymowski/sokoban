# Sokoban

A single-page browser game: push every box onto a marked square.
40 levels go from the easiest to the hardest. The game starts at level 1, but any level can be
picked at any time. Progress is not saved; only the current level number lives in the address
(`#7`), so F5 and a shared link keep the level.

Play: **https://dymowski.github.io/sokoban/**

## Controls

| Key          | Action                                  |
| ------------ | --------------------------------------- |
| ↑ ↓ ← →      | move / push a box                       |
| Z, Backspace | undo a move                             |
| R            | restart the level                       |
| N / P        | next / previous level                   |
| L            | level list (arrows, Enter to play, Esc) |
| Enter        | next level (after winning)              |

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

- `src/domain/` — pure game logic without Svelte/DOM: XSB level parser, moves and undo, key mapping, level navigation (address hash, level grid), solver (BFS over pushes, used in tests).
- `src/levels/levels.ts` — the 40 levels in play order, in XSB format (`#` wall, `@` player, `$` box, `.` goal, `*` box on goal, `+` player on goal).
- `src/ui/` — Svelte components, `src/i18n/` — text dictionary, `src/url.ts` — the level number in the address.
- `docker/nginx/` — server configuration, `docker-compose.yaml` — services `node` (tooling), `dev`, `nginx`, `e2e`.

## Adding a level

Levels in `src/levels/levels.ts` are ordered by difficulty. To change one, edit its map and run
`make test-unit` — the test checks that every level parses, is not solved at the start, and that the
solver finds a solution (≥ 4 pushes) that works in the game. It also checks the order: the minimum
number of pushes never drops from one level to the next, and the last level needs the most pushes
and the largest search of all. The list has exactly 40 levels.
