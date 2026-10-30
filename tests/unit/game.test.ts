import { describe, expect, it } from 'vitest';
import { cellIndex, parseLevel } from '../../src/domain/level';
import { boxesOnGoals, isSolved, move, newGame, reset, undo } from '../../src/domain/game';

const level = parseLevel({
  id: 'g',
  name: 'Gra',
  map: `
#######
#     #
#@$ $.#
#   . #
#######
`,
});
const at = (x: number, y: number) => cellIndex(level, x, y);

describe('game', () => {
  it('nowa gra startuje z pozycji planszy, bez ruchów', () => {
    const g = newGame(level);
    expect(g.player).toBe(at(1, 2));
    expect(g.moves).toBe(0);
    expect(g.pushes).toBe(0);
    expect(isSolved(g)).toBe(false);
  });

  it('krok na wolną podłogę zwiększa licznik ruchów i ustawia kierunek', () => {
    const g = move(newGame(level), 'up');
    expect(g.player).toBe(at(1, 1));
    expect(g.moves).toBe(1);
    expect(g.pushes).toBe(0);
    expect(g.facing).toBe('up');
  });

  it('ruch w ścianę nic nie zmienia', () => {
    const start = newGame(level);
    const g = move(start, 'left');
    expect(g).toBe(start);
  });

  it('pchnięcie przesuwa skrzynię i liczy pchnięcie', () => {
    const g = move(newGame(level), 'right');
    expect(g.player).toBe(at(2, 2));
    expect(g.boxes.has(at(3, 2))).toBe(true);
    expect(g.boxes.has(at(2, 2))).toBe(false);
    expect(g.moves).toBe(1);
    expect(g.pushes).toBe(1);
  });

  it('nie da się pchnąć dwóch skrzyń naraz', () => {
    const one = move(newGame(level), 'right');
    const two = move(one, 'right');
    expect(two).toBe(one);
  });

  it('nie da się wepchnąć skrzyni w ścianę', () => {
    let g = newGame(level);
    for (const d of ['up', 'right', 'right', 'right'] as const) g = move(g, d);
    expect(g.player).toBe(at(4, 1));
    const pushed = move(g, 'down');
    expect(pushed.boxes.has(at(4, 3))).toBe(true);
    const blocked = move(pushed, 'down');
    expect(blocked).toBe(pushed);
  });

  it('cofnij przywraca poprzedni stan, także po pchnięciu', () => {
    const start = newGame(level);
    const pushed = move(start, 'right');
    const back = undo(pushed);
    expect(back.player).toBe(start.player);
    expect([...back.boxes].sort()).toEqual([...start.boxes].sort());
    expect(back.moves).toBe(0);
    expect(back.pushes).toBe(0);
  });

  it('cofnij bez historii nic nie robi', () => {
    const start = newGame(level);
    expect(undo(start)).toBe(start);
  });

  it('od nowa przywraca stan początkowy', () => {
    let g = newGame(level);
    g = move(move(g, 'up'), 'right');
    const r = reset(g);
    expect(r.player).toBe(level.player);
    expect(r.moves).toBe(0);
    expect(r.history).toHaveLength(0);
  });

  it('rozwiązana, gdy wszystkie skrzynie stoją na celach', () => {
    let g = newGame(level);
    for (const d of ['up', 'right', 'right', 'down', 'right'] as const) g = move(g, d);
    expect(boxesOnGoals(g)).toBe(1);
    for (const d of ['up', 'left', 'left', 'down'] as const) g = move(g, d);
    expect(isSolved(g)).toBe(false);
    for (const d of ['left', 'down', 'right', 'right'] as const) g = move(g, d);
    expect(boxesOnGoals(g)).toBe(2);
    expect(isSolved(g)).toBe(true);
    expect(g.moves).toBe(13);
    expect(g.pushes).toBe(4);
  });
});
