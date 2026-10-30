# Sokoban

Jednostronicowa gra w przeglądarce: wepchnij wszystkie skrzynie na zaznaczone pola.
Przy każdym wejściu (i każdym F5) losowana jest inna plansza z puli. Postęp nie jest zapisywany.

Zagraj: **https://dymowski.github.io/sokoban/**

## Sterowanie

| Klawisz      | Akcja                          |
| ------------ | ------------------------------ |
| ↑ ↓ ← →      | ruch / pchnięcie skrzyni       |
| Z, Backspace | cofnij ruch                    |
| R            | zacznij planszę od nowa        |
| N            | inna plansza                   |
| Enter        | następna plansza (po wygranej) |

## Uruchomienie

Wymagany tylko Docker z `docker compose` — Node, npm i przeglądarki działają w kontenerach.

```bash
make init   # .env z .env.example + zależności npm
make up     # build + nginx → http://localhost:8088 (port: APP_PORT w .env)
make dev    # serwer Vite z HMR → http://localhost:5188 (DEV_PORT)
make down
```

`make help` wypisuje wszystkie cele.

## Testy i jakość

```bash
make check              # lint + format-check + typecheck + wszystkie testy
make test-unit          # domena, pula plansz (solver), wartownicy repo
make test-integration   # komponenty Svelte w jsdom
make test-e2e           # Playwright przeciw zbudowanej grze za nginx (także w podkatalogu /sokoban/)
```

## Publikacja (GitHub Pages)

Gra to statyczne pliki z `dist/` (`index.html` + jeden JS + jeden CSS) — na produkcji nie potrzebuje
serwera aplikacji, wystarczy dowolny hosting plików.

- Push na `master` uruchamia workflow `.github/workflows/pages.yml`: `make check` → `make build` →
  publikacja `dist/` na https://dymowski.github.io/sokoban/. Czerwona bramka = brak publikacji.
- `base: './'` w `vite.config.ts` daje względne ścieżki assetów, dzięki czemu gra działa w podkatalogu
  `/sokoban/`; pilnuje tego test e2e uruchamiany przeciw `http://nginx:8080/sokoban/`.
- Jednorazowo w repo: Settings → Pages → Source: **GitHub Actions**.

## Struktura

- `src/domain/` — czysta logika gry bez Svelte/DOM: parser plansz XSB, ruchy i cofanie, mapowanie klawiszy, losowanie, solver (BFS po pchnięciach, używany w testach).
- `src/levels/levels.ts` — pula plansz w formacie XSB (`#` ściana, `@` ludzik, `$` skrzynia, `.` cel, `*` skrzynia na celu, `+` ludzik na celu).
- `src/ui/` — komponenty Svelte, `src/i18n/` — słownik tekstów.
- `docker/nginx/` — konfiguracja serwera, `docker-compose.yaml` — usługi `node` (narzędzia), `dev`, `nginx`, `e2e`.

## Dodawanie planszy

Dopisz obiekt do `LEVELS` w `src/levels/levels.ts` i uruchom `make test-unit` — test sprawdzi,
że plansza się parsuje, nie jest rozwiązana na starcie i solver znajduje rozwiązanie (≥ 4 pchnięcia).
