.DEFAULT_GOAL := help
SHELL := /bin/bash

export UID := $(shell id -u)
export GID := $(shell id -g)

-include .env
APP_PORT ?= 8088
DEV_PORT ?= 5188

COMPOSE := docker compose
NODE := $(COMPOSE) run --rm --no-deps node

.PHONY: help init env install lock build up down restart logs dev shell \
	lint format format-check typecheck test test-unit test-integration test-e2e check

help: ## Lista celów
	@grep -hE '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

init: env install ## Pierwsze uruchomienie: .env z szablonu + zależności npm
	@echo ""
	@echo "✅ Gotowe. Dalej: make up (gra na http://localhost:$(APP_PORT))  |  make dev  |  make check"

env:
	@if [ -f .env ]; then echo ".env już istnieje — nie nadpisuję"; else cp .env.example .env && echo "Utworzono .env z .env.example"; fi

.env:
	@echo "Brak pliku .env — uruchom: make init (skopiuje .env.example do .env)"; exit 1

node_modules/.package-lock.json: package.json package-lock.json | .env
	$(NODE) npm ci

install: node_modules/.package-lock.json ## Zależności npm (npm ci w kontenerze, tylko gdy lock się zmienił)

lock: | .env ## Odśwież package-lock.json w kontenerze (bez npm na hoście)
	$(NODE) npm install --package-lock-only

build: install ## Zbuduj grę do dist/ (vite build)
	$(NODE) npx vite build

up: build ## Zbuduj i uruchom grę za nginx
	$(COMPOSE) up -d --wait nginx
	@echo ""
	@echo "✅ Gra działa: http://localhost:$(APP_PORT)"
	@echo "   Sterowanie: strzałki, Z = cofnij, R = od nowa, N = inna plansza"
	@echo "   Dalej: make logs  |  make down  |  make dev (HMR na http://localhost:$(DEV_PORT))"

down: ## Zatrzymaj wszystkie kontenery
	$(COMPOSE) --profile dev --profile test down --remove-orphans

restart: down up ## Restart (przebudowa + start)

logs: ## Logi nginx (Ctrl+C kończy)
	$(COMPOSE) logs -f nginx

dev: install ## Serwer deweloperski Vite z HMR
	@echo "▶ Dev server: http://localhost:$(DEV_PORT)  (Ctrl+C kończy)"
	$(COMPOSE) --profile dev up dev

shell: | .env ## Powłoka w kontenerze node
	$(NODE) bash

lint: install ## ESLint
	$(NODE) npx eslint .

format: install ## Prettier — formatuj pliki
	$(NODE) npx prettier --write .

format-check: install ## Prettier — sprawdź formatowanie
	$(NODE) npx prettier --check .

typecheck: install ## svelte-check (TypeScript strict, także .svelte)
	$(NODE) npx svelte-check --tsconfig ./tsconfig.json --fail-on-warnings

test: test-unit test-integration test-e2e ## Wszystkie testy (w dockerach)

test-unit: install ## Tylko testy jednostkowe (domena, pula plansz, wartownicy)
	$(NODE) npx vitest run --project unit

test-integration: install ## Tylko testy integracyjne (komponenty Svelte w jsdom)
	$(NODE) npx vitest run --project integration

test-e2e: build ## Tylko testy e2e (Playwright przeciw nginx)
	$(COMPOSE) up -d --wait nginx
	$(COMPOSE) --profile test run --rm e2e

check: ## Pełna bramka: lint, format, typy, testy
	@failed=""; \
	$(MAKE) --no-print-directory lint         || failed="$$failed lint"; \
	$(MAKE) --no-print-directory format-check || failed="$$failed format-check"; \
	$(MAKE) --no-print-directory typecheck    || failed="$$failed typecheck"; \
	$(MAKE) --no-print-directory test         || failed="$$failed test"; \
	if [ -n "$$failed" ]; then echo "CHECK: FAIL ($${failed# })"; exit 1; fi; \
	echo "CHECK: OK"
