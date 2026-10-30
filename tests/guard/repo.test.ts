import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

const compose = read('docker-compose.yaml');
const envExample = read('.env.example');
const makefile = read('Makefile');
const pkg = JSON.parse(read('package.json')) as { devDependencies: Record<string, string> };

/** Zmienne ustawiane przez Makefile (export UID/GID), nie przez .env. */
const FROM_MAKEFILE = new Set(['UID', 'GID']);

const envEntries = () =>
  envExample
    .split('\n')
    .map((line, i, lines) => ({ line, prev: lines[i - 1] ?? '' }))
    .filter(({ line }) => /^[A-Z_]+=/.test(line));

describe('wartownicy repo', () => {
  it('obrazy nie używają tagu latest i są przypięte digestem', () => {
    expect(
      compose,
      'docker-compose.yaml zawiera "latest" — przypnij wersję w .env.example',
    ).not.toMatch(/latest/);
    for (const { line } of envEntries().filter(({ line }) => line.includes('_IMAGE='))) {
      expect(
        line,
        `${line} — dopisz @sha256:<digest> (docker buildx imagetools inspect <obraz>)`,
      ).toMatch(/:[\w.-]+@sha256:[0-9a-f]{64}$/);
      expect(line).not.toMatch(/:latest/);
    }
  });

  it('workflow GitHub Actions: akcje przypięte do SHA, runner bez latest', () => {
    const workflow = read('.github/workflows/pages.yml');
    expect(workflow, 'pages.yml zawiera "latest" — użyj np. runs-on: ubuntu-24.04').not.toMatch(
      /latest/,
    );
    const uses = [...workflow.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1] as string);
    expect(uses.length).toBeGreaterThan(0);
    const loose = uses.filter((u) => !/@[0-9a-f]{40}$/.test(u));
    expect(
      loose,
      `Przypnij do SHA commita (uses: owner/akcja@<sha> # vX.Y.Z): ${loose.join(', ')}`,
    ).toEqual([]);
  });

  it('każda zmienna ${X} z docker-compose.yaml jest w .env.example', () => {
    const used = new Set([...compose.matchAll(/\$\{([A-Z_]+)/g)].map((m) => m[1] as string));
    const defined = new Set(envEntries().map(({ line }) => line.split('=')[0]));
    const missing = [...used].filter((v) => !FROM_MAKEFILE.has(v) && !defined.has(v));
    expect(missing, `Dopisz do .env.example (z komentarzem): ${missing.join(', ')}`).toEqual([]);
  });

  it('każda zmienna w .env.example ma komentarz w linii powyżej', () => {
    const bare = envEntries()
      .filter(({ prev }) => !prev.startsWith('#'))
      .map(({ line }) => line.split('=')[0]);
    expect(bare, `Dodaj komentarz "# ..." nad: ${bare.join(', ')}`).toEqual([]);
  });

  it('Makefile ma komplet standardowych celów', () => {
    const required = [
      'help',
      'init',
      'install',
      'build',
      'up',
      'down',
      'logs',
      'dev',
      'lint',
      'format',
      'format-check',
      'typecheck',
      'test',
      'test-unit',
      'test-integration',
      'test-e2e',
      'check',
    ];
    const missing = required.filter((target) => !new RegExp(`^${target}:`, 'm').test(makefile));
    expect(missing, `Brak celów w Makefile: ${missing.join(', ')}`).toEqual([]);
  });

  it('zależności npm mają dokładne wersje (bez ^ i ~)', () => {
    const loose = Object.entries(pkg.devDependencies)
      .filter(([, v]) => !/^\d+\.\d+\.\d+$/.test(v))
      .map(([name, v]) => `${name}@${v}`);
    expect(loose, `Przypnij dokładną wersję: ${loose.join(', ')}`).toEqual([]);
  });

  it('wersja @playwright/test zgadza się z obrazem PLAYWRIGHT_IMAGE', () => {
    const image = /^PLAYWRIGHT_IMAGE=.*:v([\d.]+)-/m.exec(envExample)?.[1];
    expect(
      pkg.devDependencies['@playwright/test'],
      'Zmień wersję obrazu PLAYWRIGHT_IMAGE w .env.example albo @playwright/test w package.json, żeby były równe',
    ).toBe(image);
  });
});
