import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../src/App.svelte';
import type { LevelDef } from '../../src/domain/level';

const ONE: LevelDef = {
  id: 'one',
  name: 'One',
  map: `
######
#    #
#@$ .#
######
`,
};
const TWO: LevelDef = {
  id: 'two',
  name: 'Two',
  map: `
#####
#@$.#
#####
`,
};
const THREE: LevelDef = {
  id: 'three',
  name: 'Three',
  map: `
######
#@$ .#
######
`,
};

/** Sets the address the game starts with, e.g. "#2"; "" means the bare address. */
const at = (hash: string) => window.history.replaceState(null, '', `/${hash}`);

const setup = (levels: readonly LevelDef[] = [ONE]) => render(App, { props: { levels } });

/** A full key press: down and back up. Returns false when keydown was cancelled. */
const press = async (key: string) => {
  const notCancelled = await fireEvent.keyDown(window, { key });
  await fireEvent.keyUp(window, { key });
  return notCancelled;
};
const keyDown = (key: string, repeat = false) => fireEvent.keyDown(window, { key, repeat });
const keyUp = (key: string) => fireEvent.keyUp(window, { key });
const board = () => screen.getByTestId('board');
const player = () => screen.getByTestId('player');
const stat = (id: string) => screen.getByTestId(id).textContent?.trim();
const button = (name: RegExp) => screen.getByRole('button', { name });

afterEach(() => at(''));

describe('App', () => {
  it('shows the level, its name and zeroed counters', () => {
    setup();
    expect(board()).toHaveAttribute('data-level-id', 'one');
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(stat('moves')).toBe('0');
    expect(stat('pushes')).toBe('0');
    expect(stat('boxes')).toBe('0/1');
    expect(player()).toHaveAttribute('data-pos', '1,2');
  });

  it('an arrow key moves the player and pushes a box without scrolling the page', async () => {
    setup();
    const notCancelled = await press('ArrowRight');
    expect(notCancelled).toBe(false);
    expect(player()).toHaveAttribute('data-pos', '2,2');
    expect(stat('moves')).toBe('1');
    expect(stat('pushes')).toBe('1');
  });

  it('a move into a wall does not change the counters', async () => {
    setup();
    await press('ArrowLeft');
    expect(player()).toHaveAttribute('data-pos', '1,2');
    expect(stat('moves')).toBe('0');
  });

  it('Z undoes a move, R restarts the level', async () => {
    setup();
    await press('ArrowUp');
    await press('ArrowRight');
    await press('z');
    expect(player()).toHaveAttribute('data-pos', '1,1');
    expect(stat('moves')).toBe('1');
    await press('r');
    expect(player()).toHaveAttribute('data-pos', '1,2');
    expect(stat('moves')).toBe('0');
  });

  it('holding an arrow key moves the player one square, and repeats do not scroll the page', async () => {
    setup();
    await press('ArrowUp');
    await keyDown('ArrowRight');
    for (let i = 0; i < 3; i++) expect(await keyDown('ArrowRight', true)).toBe(false);
    expect(player()).toHaveAttribute('data-pos', '2,1');
    expect(stat('moves')).toBe('2');
  });

  it('the same arrow moves again only after it is released', async () => {
    setup();
    await press('ArrowUp');
    await keyDown('ArrowRight');
    await keyDown('ArrowRight');
    expect(player()).toHaveAttribute('data-pos', '2,1');
    await keyUp('ArrowRight');
    await keyDown('ArrowRight');
    expect(player()).toHaveAttribute('data-pos', '3,1');
  });

  it('another arrow moves while the previous one is still held', async () => {
    setup();
    await keyDown('ArrowUp');
    await keyDown('ArrowRight');
    expect(player()).toHaveAttribute('data-pos', '2,1');
    expect(stat('moves')).toBe('2');
  });

  it('leaving the window releases held arrows', async () => {
    setup();
    await press('ArrowUp');
    await keyDown('ArrowRight');
    await fireEvent.blur(window);
    await keyDown('ArrowRight');
    expect(player()).toHaveAttribute('data-pos', '3,1');
  });

  it('buttons work the same as the shortcuts', async () => {
    setup([ONE, TWO]);
    await press('ArrowRight');
    await fireEvent.click(button(/Undo/));
    expect(stat('moves')).toBe('0');
    await fireEvent.click(button(/Next/));
    expect(board()).toHaveAttribute('data-level-id', 'two');
    await fireEvent.click(button(/Previous/));
    expect(board()).toHaveAttribute('data-level-id', 'one');
  });
});

describe('level order', () => {
  it('starts at level 1 and shows its number out of all levels', () => {
    setup([ONE, TWO, THREE]);
    expect(board()).toHaveAttribute('data-level-id', 'one');
    expect(stat('level-number')).toBe('1/3');
    expect(window.location.hash).toBe('#1');
  });

  it('N goes to the next level and P back, both kept in the address', async () => {
    setup([ONE, TWO, THREE]);
    await press('n');
    expect(board()).toHaveAttribute('data-level-id', 'two');
    expect(stat('level-number')).toBe('2/3');
    expect(window.location.hash).toBe('#2');
    await press('p');
    expect(board()).toHaveAttribute('data-level-id', 'one');
    expect(window.location.hash).toBe('#1');
  });

  it('P on the first level and N on the last one do nothing, their buttons are disabled', async () => {
    setup([ONE, TWO]);
    expect(button(/Previous/)).toBeDisabled();
    await press('p');
    expect(board()).toHaveAttribute('data-level-id', 'one');

    await press('n');
    expect(button(/Next/)).toBeDisabled();
    expect(button(/Previous/)).toBeEnabled();
    await press('n');
    expect(board()).toHaveAttribute('data-level-id', 'two');
  });

  it('the level number in the address opens that level (F5, shared link)', () => {
    at('#3');
    setup([ONE, TWO, THREE]);
    expect(board()).toHaveAttribute('data-level-id', 'three');
    expect(stat('level-number')).toBe('3/3');
  });

  it.each(['#0', '#4', '#abc'])('an unknown level number "%s" opens level 1', (hash) => {
    at(hash);
    setup([ONE, TWO, THREE]);
    expect(board()).toHaveAttribute('data-level-id', 'one');
    expect(window.location.hash).toBe('#1');
  });

  it('changing the number in the address loads that level without a reload', async () => {
    setup([ONE, TWO, THREE]);
    at('#2');
    await fireEvent(window, new HashChangeEvent('hashchange'));
    expect(board()).toHaveAttribute('data-level-id', 'two');
  });

  it('when solved, shows congratulations, blocks arrows, and Enter loads the next level', async () => {
    setup([ONE, TWO]);
    await press('ArrowRight');
    await press('ArrowRight');
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Well done!');
    expect(dialog).toHaveTextContent('Moves: 2, pushes: 2');
    expect(stat('boxes')).toBe('1/1');

    await press('ArrowLeft');
    expect(stat('moves')).toBe('2');

    await press('Enter');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(board()).toHaveAttribute('data-level-id', 'two');
    expect(stat('moves')).toBe('0');
  });

  it('after the last level, says all levels are solved and Enter goes back to level 1', async () => {
    at('#2');
    setup([ONE, TWO]);
    await press('ArrowRight');
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('All 2 levels solved!');
    expect(within(dialog).getByRole('button', { name: /Back to level 1/ })).toBeInTheDocument();

    await press('Enter');
    expect(board()).toHaveAttribute('data-level-id', 'one');
    expect(window.location.hash).toBe('#1');
  });

  it('a broken level shows a clear message and lets the player choose another', async () => {
    const broken: LevelDef = { id: 'broken', name: 'Broken', map: '#####\n# $.#\n#####' };
    setup([broken, TWO]);
    expect(screen.getByRole('alert')).toHaveTextContent(/Level "broken": no player/);
    await fireEvent.click(button(/Choose a level/));
    await fireEvent.click(screen.getByRole('button', { name: 'Level 2: Two' }));
    expect(board()).toHaveAttribute('data-level-id', 'two');
  });
});

describe('level list', () => {
  const picker = () => screen.getByRole('dialog', { name: 'Choose a level' });

  it('L opens a grid of all levels with the current one marked', async () => {
    at('#2');
    setup([ONE, TWO, THREE]);
    await press('l');
    const options = within(picker()).getAllByRole('button', { name: /^Level \d+:/ });
    expect(options.map((b) => b.textContent?.trim())).toEqual(['1', '2', '3']);
    expect(options[1]).toHaveAttribute('aria-current', 'true');
    expect(options[1]).toHaveFocus();
  });

  it('arrows choose a level and Enter plays it', async () => {
    setup([ONE, TWO, THREE]);
    await press('l');
    await press('ArrowRight');
    await press('ArrowRight');
    expect(screen.getByRole('button', { name: 'Level 3: Three' })).toHaveFocus();
    await press('Enter');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(board()).toHaveAttribute('data-level-id', 'three');
    expect(window.location.hash).toBe('#3');
  });

  it('clicking a level plays it', async () => {
    setup([ONE, TWO, THREE]);
    await fireEvent.click(button(/Levels/));
    await fireEvent.click(screen.getByRole('button', { name: 'Level 2: Two' }));
    expect(board()).toHaveAttribute('data-level-id', 'two');
  });

  it('while the list is open, game keys do nothing', async () => {
    setup([ONE, TWO, THREE]);
    await press('l');
    for (const key of ['ArrowRight', 'ArrowDown', 'n', 'p', 'r', 'z']) await press(key);
    expect(picker()).toBeInTheDocument();
    expect(board()).toHaveAttribute('data-level-id', 'one');
    expect(player()).toHaveAttribute('data-pos', '1,2');
    expect(stat('moves')).toBe('0');
  });

  it.each(['Escape', 'l'])('%s closes the list and keeps the level', async (key) => {
    setup([ONE, TWO, THREE]);
    await press('l');
    await press('ArrowRight');
    await press(key);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(board()).toHaveAttribute('data-level-id', 'one');
  });

  it('the Close button closes the list', async () => {
    setup([ONE, TWO]);
    await press('l');
    await fireEvent.click(within(picker()).getByRole('button', { name: /Close/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
