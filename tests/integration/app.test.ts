import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import App from '../../src/App.svelte';
import type { LevelDef } from '../../src/domain/level';
import { LAST_LEVEL_KEY, type KeyValueStore } from '../../src/storage';

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

class MemoryStore implements KeyValueStore {
  data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

const setup = (levels: readonly LevelDef[] = [ONE], storage: KeyValueStore | null = null) =>
  render(App, { props: { levels, rng: () => 0, storage } });

const press = (key: string) => fireEvent.keyDown(window, { key });
const board = () => screen.getByTestId('board');
const player = () => screen.getByTestId('player');
const stat = (id: string) => screen.getByTestId(id).textContent?.trim();

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

  it('buttons work the same as the shortcuts', async () => {
    setup();
    await press('ArrowRight');
    await fireEvent.click(screen.getByRole('button', { name: /Undo/ }));
    expect(stat('moves')).toBe('0');
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

  it('N picks another level', async () => {
    setup([ONE, TWO]);
    await press('n');
    expect(board()).toHaveAttribute('data-level-id', 'two');
  });

  it('on start skips the last shown level (F5) and remembers the current one', () => {
    const store = new MemoryStore();
    store.setItem(LAST_LEVEL_KEY, 'one');
    setup([ONE, TWO], store);
    expect(board()).toHaveAttribute('data-level-id', 'two');
    expect(store.getItem(LAST_LEVEL_KEY)).toBe('two');
  });

  it('a broken level shows a clear message and lets the player pick another', async () => {
    const broken: LevelDef = { id: 'broken', name: 'Broken', map: '#####\n# $.#\n#####' };
    setup([broken, TWO]);
    expect(screen.getByRole('alert')).toHaveTextContent(/Level "broken": no player/);
    await fireEvent.click(screen.getByRole('button', { name: /Pick another level/ }));
    expect(board()).toHaveAttribute('data-level-id', 'two');
  });
});
