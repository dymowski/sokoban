import { describe, expect, it } from 'vitest';
import { cellIndex, parseLevel } from '../../src/domain/level';
import { boxesOnGoals, isSolved, move, newGame, reset, undo } from '../../src/domain/game';

const level = parseLevel({
  id: 'g',
  name: 'Game',
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
  it('a new game starts from the level position with no moves', () => {
    const g = newGame(level);
    expect(g.player).toBe(at(1, 2));
    expect(g.moves).toBe(0);
    expect(g.pushes).toBe(0);
    expect(isSolved(g)).toBe(false);
  });

  it('a step onto free floor increments moves and sets the facing direction', () => {
    const g = move(newGame(level), 'up');
    expect(g.player).toBe(at(1, 1));
    expect(g.moves).toBe(1);
    expect(g.pushes).toBe(0);
    expect(g.facing).toBe('up');
  });

  it('a move into a wall changes nothing', () => {
    const start = newGame(level);
    const g = move(start, 'left');
    expect(g).toBe(start);
  });

  it('a push moves the box and counts the push', () => {
    const g = move(newGame(level), 'right');
    expect(g.player).toBe(at(2, 2));
    expect(g.boxes.has(at(3, 2))).toBe(true);
    expect(g.boxes.has(at(2, 2))).toBe(false);
    expect(g.moves).toBe(1);
    expect(g.pushes).toBe(1);
  });

  it('cannot push two boxes at once', () => {
    const one = move(newGame(level), 'right');
    const two = move(one, 'right');
    expect(two).toBe(one);
  });

  it('cannot push a box into a wall', () => {
    let g = newGame(level);
    for (const d of ['up', 'right', 'right', 'right'] as const) g = move(g, d);
    expect(g.player).toBe(at(4, 1));
    const pushed = move(g, 'down');
    expect(pushed.boxes.has(at(4, 3))).toBe(true);
    const blocked = move(pushed, 'down');
    expect(blocked).toBe(pushed);
  });

  it('undo restores the previous state, also after a push', () => {
    const start = newGame(level);
    const pushed = move(start, 'right');
    const back = undo(pushed);
    expect(back.player).toBe(start.player);
    expect([...back.boxes].sort()).toEqual([...start.boxes].sort());
    expect(back.moves).toBe(0);
    expect(back.pushes).toBe(0);
  });

  it('undo without history does nothing', () => {
    const start = newGame(level);
    expect(undo(start)).toBe(start);
  });

  it('reset restores the initial state', () => {
    let g = newGame(level);
    g = move(move(g, 'up'), 'right');
    const r = reset(g);
    expect(r.player).toBe(level.player);
    expect(r.moves).toBe(0);
    expect(r.history).toHaveLength(0);
  });

  it('solved when every box stands on a goal', () => {
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
