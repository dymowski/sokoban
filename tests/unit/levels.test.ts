import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../src/levels/levels';
import { parseLevel } from '../../src/domain/level';
import { isSolved, newGame } from '../../src/domain/game';
import { solve } from '../../src/domain/solver';

describe('level pool', () => {
  it('has at least 10 levels with unique ids', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
  });

  describe.each(LEVELS.map((l) => [l.id, l] as const))('level %s', (_id, def) => {
    const level = parseLevel(def);

    it('is not solved at the start', () => {
      expect(isSolved(newGame(level))).toBe(false);
    });

    it('is solvable and non-trivial (≥ 4 pushes)', () => {
      const result = solve(level);
      expect(
        result,
        `Level "${def.id}" has no solution — fix its map in src/levels/levels.ts`,
      ).not.toBeNull();
      expect(result?.pushes ?? 0).toBeGreaterThanOrEqual(4);
    });
  });
});
