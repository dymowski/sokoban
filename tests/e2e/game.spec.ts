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

test('starts at level 1 of 40, and the level number in the address survives F5', async ({
  page,
}) => {
  await page.goto('/');
  const number = page.getByTestId('level-number');
  await expect(number).toHaveText('1/40');
  await page.keyboard.press('n');
  await expect(number).toHaveText('2/40');
  await expect(page).toHaveURL(/#2$/);
  await page.reload();
  await expect(number).toHaveText('2/40');
  await page.keyboard.press('p');
  await expect(number).toHaveText('1/40');
});

test('a link with a level number opens that level', async ({ page }) => {
  await page.goto('/#40');
  await expect(page.getByTestId('level-number')).toHaveText('40/40');
  await expect(page.getByRole('button', { name: /Next/ })).toBeDisabled();
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

test('the level list: L, arrows and Enter jump to a level', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('l');
  const picker = page.getByRole('dialog', { name: 'Choose a level' });
  await expect(picker).toBeVisible();
  await expect(picker.getByRole('button', { name: /^Level \d+:/ })).toHaveCount(40);
  // From 1: two to the right, one row (8 levels) down → 11.
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowDown']) await page.keyboard.press(key);
  await page.keyboard.press('Enter');
  await expect(picker).toBeHidden();
  await expect(page.getByTestId('level-number')).toHaveText('11/40');
  await expect(page).toHaveURL(/#11$/);
});
