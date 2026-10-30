import { describe, expect, it } from 'vitest';
import { parseLevel } from '../../src/domain/level';
import { isSolved, move, newGame } from '../../src/domain/game';
import { solve } from '../../src/domain/solver';

const lvl = (map: string) => parseLevel({ id: 's', name: 'Solver', map });

describe('solve', () => {
  it('finds a solution with the minimum number of pushes that works in the game', () => {
    const level = lvl(`
#######
#     #
#@$ $.#
#   . #
#######
`);
    const result = solve(level);
    expect(result).not.toBeNull();
    expect(result?.pushes).toBe(4);
    let g = newGame(level);
    for (const d of result?.moves ?? []) g = move(g, d);
    expect(isSolved(g)).toBe(true);
  });

  it('returns null for an unsolvable level (box in a corner)', () => {
    expect(
      solve(
        lvl(`
######
#$  .#
# @  #
######
`),
      ),
    ).toBeNull();
  });
});
