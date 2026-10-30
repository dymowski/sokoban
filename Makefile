.DEFAULT_GOAL := help
SHELL := /bin/bash

export UID := $(shell id -u)
export GID := $(shell id -g)

# wildcard: a missing .env is skipped quietly instead of make trying the .env rule below first
-include $(wildcard .env)
APP_PORT ?= 8088
DEV_PORT ?= 5188

COMPOSE := docker compose
NODE := $(COMPOSE) run --rm --no-deps node

.PHONY: help init env install lock build up down restart logs dev shell \
	lint format format-check typecheck test test-unit test-integration test-e2e check

help: ## List targets
	@grep -hE '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

init: env ## First run: .env from the template + npm dependencies
	@# New make process: this one read -include .env before the file existed and does not see it as ready
	@$(MAKE) --no-print-directory install
	@echo ""
	@echo "✅ Done. Next: make up (game at http://localhost:$(APP_PORT))  |  make dev  |  make check"

env:
	@if [ -f .env ]; then echo ".env already exists — not overwriting it"; else cp .env.example .env && echo "Created .env from .env.example"; fi

.env:
	@echo "No .env file — run: make init (copies .env.example to .env)"; exit 1

node_modules/.package-lock.json: package.json package-lock.json | .env
	$(NODE) npm ci

install: node_modules/.package-lock.json ## npm dependencies (npm ci in a container, only when the lock file changed)

lock: | .env ## Refresh package-lock.json in a container (no npm on the host)
	$(NODE) npm install --package-lock-only

build: install ## Build the game into dist/ (vite build)
	$(NODE) npx vite build

up: build ## Build and run the game behind nginx
	$(COMPOSE) up -d --wait nginx
	@echo ""
	@echo "✅ Game is running: http://localhost:$(APP_PORT)"
	@echo "   Controls: arrows, Z = undo, R = restart, N = another level"
	@echo "   Next: make logs  |  make down  |  make dev (HMR at http://localhost:$(DEV_PORT))"

down: ## Stop all containers
	$(COMPOSE) --profile dev --profile test down --remove-orphans

restart: down up ## Restart (rebuild + start)

logs: ## nginx logs (Ctrl+C to stop)
	$(COMPOSE) logs -f nginx

dev: install ## Vite dev server with HMR
	@echo "▶ Dev server: http://localhost:$(DEV_PORT)  (Ctrl+C to stop)"
	$(COMPOSE) --profile dev up dev

shell: | .env ## Shell in the node container
	$(NODE) bash

lint: install ## ESLint
	$(NODE) npx eslint .

format: install ## Prettier — format files
	$(NODE) npx prettier --write .

format-check: install ## Prettier — check formatting
	$(NODE) npx prettier --check .

typecheck: install ## svelte-check (strict TypeScript, .svelte files included)
	$(NODE) npx svelte-check --tsconfig ./tsconfig.json --fail-on-warnings

test: test-unit test-integration test-e2e ## All tests (in Docker containers)

test-unit: install ## Unit tests only (domain, level pool, repo guards)
	$(NODE) npx vitest run --project unit

test-integration: install ## Integration tests only (Svelte components in jsdom)
	$(NODE) npx vitest run --project integration

test-e2e: build ## E2E tests only (Playwright against nginx)
	$(COMPOSE) up -d --wait nginx
	$(COMPOSE) --profile test run --rm e2e

check: ## Full gate: lint, format, types, tests
	@failed=""; \
	$(MAKE) --no-print-directory lint         || failed="$$failed lint"; \
	$(MAKE) --no-print-directory format-check || failed="$$failed format-check"; \
	$(MAKE) --no-print-directory typecheck    || failed="$$failed typecheck"; \
	$(MAKE) --no-print-directory test         || failed="$$failed test"; \
	if [ -n "$$failed" ]; then echo "CHECK: FAIL ($${failed# })"; exit 1; fi; \
	echo "CHECK: OK"
