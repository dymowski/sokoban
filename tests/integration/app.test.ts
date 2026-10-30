import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import App from '../../src/App.svelte';
import type { LevelDef } from '../../src/domain/level';
import { LAST_LEVEL_KEY, type KeyValueStore } from '../../src/storage';

const ONE: LevelDef = {
  id: 'jeden',
  name: 'Jeden',
  map: `
######
#    #
#@$ .#
######
`,
};
const TWO: LevelDef = {
  id: 'dwa',
  name: 'Dwa',
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
  it('pokazuje planszę, jej nazwę i zerowe liczniki', () => {
    setup();
    expect(board()).toHaveAttribute('data-level-id', 'jeden');
    expect(screen.getByText('Jeden')).toBeInTheDocument();
    expect(stat('moves')).toBe('0');
    expect(stat('pushes')).toBe('0');
    expect(stat('boxes')).toBe('0/1');
    expect(player()).toHaveAttribute('data-pos', '1,2');
  });

  it('strzałka przesuwa ludzika i pcha skrzynię, bez przewijania strony', async () => {
    setup();
    const notCancelled = await press('ArrowRight');
    expect(notCancelled).toBe(false);
    expect(player()).toHaveAttribute('data-pos', '2,2');
    expect(stat('moves')).toBe('1');
    expect(stat('pushes')).toBe('1');
  });

  it('ruch w ścianę nie zmienia liczników', async () => {
    setup();
    await press('ArrowLeft');
    expect(player()).toHaveAttribute('data-pos', '1,2');
    expect(stat('moves')).toBe('0');
  });

  it('Z cofa ruch, R zaczyna od nowa', async () => {
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

  it('przyciski działają tak samo jak skróty', async () => {
    setup();
    await press('ArrowRight');
    await fireEvent.click(screen.getByRole('button', { name: /Cofnij/ }));
    expect(stat('moves')).toBe('0');
  });

  it('po rozwiązaniu pokazuje gratulacje, blokuje strzałki, Enter ładuje następną planszę', async () => {
    setup([ONE, TWO]);
    await press('ArrowRight');
    await press('ArrowRight');
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Brawo!');
    expect(dialog).toHaveTextContent('Ruchy: 2, pchnięcia: 2');
    expect(stat('boxes')).toBe('1/1');

    await press('ArrowLeft');
    expect(stat('moves')).toBe('2');

    await press('Enter');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(board()).toHaveAttribute('data-level-id', 'dwa');
    expect(stat('moves')).toBe('0');
  });

  it('N losuje inną planszę', async () => {
    setup([ONE, TWO]);
    await press('n');
    expect(board()).toHaveAttribute('data-level-id', 'dwa');
  });

  it('przy starcie pomija planszę pokazaną ostatnio (F5) i zapamiętuje bieżącą', () => {
    const store = new MemoryStore();
    store.setItem(LAST_LEVEL_KEY, 'jeden');
    setup([ONE, TWO], store);
    expect(board()).toHaveAttribute('data-level-id', 'dwa');
    expect(store.getItem(LAST_LEVEL_KEY)).toBe('dwa');
  });

  it('uszkodzona plansza daje czytelny komunikat i możliwość wylosowania innej', async () => {
    const broken: LevelDef = { id: 'zla', name: 'Zła', map: '#####\n# $.#\n#####' };
    setup([broken, TWO]);
    expect(screen.getByRole('alert')).toHaveTextContent(/Plansza »zla«: brak ludzika/);
    await fireEvent.click(screen.getByRole('button', { name: /Wylosuj inną planszę/ }));
    expect(board()).toHaveAttribute('data-level-id', 'dwa');
  });
});
