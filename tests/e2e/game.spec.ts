import { expect, test } from '@playwright/test';

test('the level loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await expect(page.getByTestId('board')).toBeVisible();
  await expect(page.getByTestId('player')).toBeVisible();
  expect(errors).toEqual([]);
});

test('every reload (F5) shows a different level', async ({ page }) => {
  await page.goto('/');
  let previous = await page.getByTestId('board').getAttribute('data-level-id');
  for (let i = 0; i < 5; i++) {
    await page.reload();
    const current = await page.getByTestId('board').getAttribute('data-level-id');
    expect(current).not.toBeNull();
    expect(current).not.toBe(previous);
    previous = current;
  }
});

test('arrow keys move the player and do not scroll the page', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 500 });
  await page.goto('/');
  const player = page.getByTestId('player');
  const moves = page.getByTestId('moves');

  for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
    const before = await player.getAttribute('data-pos');
    await page.keyboard.press(key);
    if ((await player.getAttribute('data-pos')) !== before) {
      await expect(moves).toHaveText('1');
      await page.keyboard.press('z');
      await expect(moves).toHaveText('0');
    }
  }
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('the game works in a subdirectory, as on GitHub Pages (/sokoban/)', async ({ page }) => {
  // On Pages the domain root has no game assets — every request outside /sokoban/ must fail.
  await page.route('**/*', (route) =>
    new URL(route.request().url()).pathname.startsWith('/sokoban/')
      ? route.continue()
      : route.abort(),
  );
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/sokoban/');
  await expect(page.getByTestId('board')).toBeVisible();
  const player = page.getByTestId('player');
  const before = await player.getAttribute('data-pos');
  for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
    await page.keyboard.press(key);
    if ((await player.getAttribute('data-pos')) !== before) break;
  }
  await expect(player).not.toHaveAttribute('data-pos', before ?? '');
  expect(errors).toEqual([]);
});

test('the N key picks another level without a reload', async ({ page }) => {
  await page.goto('/');
  const board = page.getByTestId('board');
  const first = await board.getAttribute('data-level-id');
  await page.keyboard.press('n');
  await expect(board).not.toHaveAttribute('data-level-id', first ?? '');
});
