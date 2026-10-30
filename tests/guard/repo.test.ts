import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

/** Repo files checked for Polish text: an explicit list, so local untracked files in the root stay out. */
const LANGUAGE_ROOT_FILES = [
  '.dockerignore',
  '.editorconfig',
  '.env.example',
  '.gitignore',
  '.nvmrc',
  '.prettierignore',
  '.prettierrc',
  'Makefile',
  'README.md',
  'docker-compose.yaml',
  'eslint.config.js',
  'index.html',
  'package.json',
  'playwright.config.ts',
  'svelte.config.js',
  'tsconfig.json',
  'vite.config.ts',
  'vitest.config.ts',
];
const LANGUAGE_DIRS = ['src', 'tests', 'docker', '.github'];
/** Polish letters and Polish-style quotes, as escapes so this file does not match itself. */
const POLISH_CHARS =
  /[\u0105\u0107\u0119\u0142\u0144\u00F3\u015B\u017A\u017C\u0104\u0106\u0118\u0141\u0143\u00D3\u015A\u0179\u017B\u201E\u201D\u00BB\u00AB]/;

const languageFiles = () => [
  ...LANGUAGE_ROOT_FILES,
  ...LANGUAGE_DIRS.flatMap((dir) =>
    readdirSync(join(ROOT, dir), { recursive: true, encoding: 'utf8' })
      .map((path) => join(dir, path))
      .filter((path) => statSync(join(ROOT, path)).isFile()),
  ),
];

const compose = read('docker-compose.yaml');
const envExample = read('.env.example');
const makefile = read('Makefile');
const pkg = JSON.parse(read('package.json')) as { devDependencies: Record<string, string> };

/** Variables set by the Makefile (export UID/GID), not by .env. */
const FROM_MAKEFILE = new Set(['UID', 'GID']);

const envEntries = () =>
  envExample
    .split('\n')
    .map((line, i, lines) => ({ line, prev: lines[i - 1] ?? '' }))
    .filter(({ line }) => /^[A-Z_]+=/.test(line));

describe('repo guards', () => {
  it('images do not use the latest tag and are pinned by digest', () => {
    expect(
      compose,
      'docker-compose.yaml contains "latest" — pin the version in .env.example',
    ).not.toMatch(/latest/);
    for (const { line } of envEntries().filter(({ line }) => line.includes('_IMAGE='))) {
      expect(
        line,
        `${line} — append @sha256:<digest> (docker buildx imagetools inspect <image>)`,
      ).toMatch(/:[\w.-]+@sha256:[0-9a-f]{64}$/);
      expect(line).not.toMatch(/:latest/);
    }
  });

  it('GitHub Actions workflow: actions pinned to a SHA, runner without latest', () => {
    const workflow = read('.github/workflows/pages.yml');
    expect(workflow, 'pages.yml contains "latest" — use e.g. runs-on: ubuntu-24.04').not.toMatch(
      /latest/,
    );
    const uses = [...workflow.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1] as string);
    expect(uses.length).toBeGreaterThan(0);
    const loose = uses.filter((u) => !/@[0-9a-f]{40}$/.test(u));
    expect(
      loose,
      `Pin to a commit SHA (uses: owner/action@<sha> # vX.Y.Z): ${loose.join(', ')}`,
    ).toEqual([]);
  });

  it('every ${X} variable from docker-compose.yaml is in .env.example', () => {
    const used = new Set([...compose.matchAll(/\$\{([A-Z_]+)/g)].map((m) => m[1] as string));
    const defined = new Set(envEntries().map(({ line }) => line.split('=')[0]));
    const missing = [...used].filter((v) => !FROM_MAKEFILE.has(v) && !defined.has(v));
    expect(missing, `Add to .env.example (with a comment): ${missing.join(', ')}`).toEqual([]);
  });

  it('every variable in .env.example has a comment on the line above', () => {
    const bare = envEntries()
      .filter(({ prev }) => !prev.startsWith('#'))
      .map(({ line }) => line.split('=')[0]);
    expect(bare, `Add a "# ..." comment above: ${bare.join(', ')}`).toEqual([]);
  });

  it('Makefile has the full set of standard targets', () => {
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
    expect(missing, `Missing Makefile targets: ${missing.join(', ')}`).toEqual([]);
  });

  it('Makefile includes .env only when it exists', () => {
    expect(
      makefile,
      'Use "-include $(wildcard .env)": plain "-include .env" makes make run the .env rule first, so every target on a fresh clone prints "No .env file"',
    ).toMatch(/^-include \$\(wildcard \.env\)$/m);
  });

  it('npm dependencies have exact versions (no ^ or ~)', () => {
    const loose = Object.entries(pkg.devDependencies)
      .filter(([, v]) => !/^\d+\.\d+\.\d+$/.test(v))
      .map(([name, v]) => `${name}@${v}`);
    expect(loose, `Pin an exact version: ${loose.join(', ')}`).toEqual([]);
  });

  it('@playwright/test version matches the PLAYWRIGHT_IMAGE image', () => {
    const image = /^PLAYWRIGHT_IMAGE=.*:v([\d.]+)-/m.exec(envExample)?.[1];
    expect(
      pkg.devDependencies['@playwright/test'],
      'Change the PLAYWRIGHT_IMAGE version in .env.example or @playwright/test in package.json so they are equal',
    ).toBe(image);
  });

  it('repo files contain no Polish characters', () => {
    const hits = languageFiles().flatMap((path) =>
      read(path)
        .split('\n')
        .flatMap((line, i) =>
          POLISH_CHARS.test(line) ? [`${path}:${i + 1}: ${line.trim()}`] : [],
        ),
    );
    expect(
      hits,
      `Translate to English (code, comments, docs and UI texts are English-only):\n${hits.join('\n')}`,
    ).toEqual([]);
  });
});
