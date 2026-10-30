import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../src/levels/levels';
import { parseLevel, type LevelDef } from '../../src/domain/level';
import { isSolved, move, newGame } from '../../src/domain/game';
import { solve, type Solution } from '../../src/domain/solver';

/** Hard levels take the solver a few seconds — each one is solved once and shared by the tests. */
const SOLVE_TIMEOUT = 60_000;
const solutions = new Map<string, Solution | null>();
const solutionOf = (def: LevelDef): Solution | null => {
  if (!solutions.has(def.id)) solutions.set(def.id, solve(parseLevel(def)));
  return solutions.get(def.id) ?? null;
};

describe('level list', () => {
  it('has 40 levels with unique ids and names', () => {
    expect(LEVELS).toHaveLength(40);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
    expect(new Set(LEVELS.map((l) => l.name)).size).toBe(LEVELS.length);
  });

  describe.each(LEVELS.map((l, i) => [i + 1, l.id, l] as const))(
    'level %i (%s)',
    (_n, _id, def) => {
      const level = parseLevel(def);

      it('is not solved at the start', () => {
        expect(isSolved(newGame(level))).toBe(false);
      });

      it(
        'is solvable and non-trivial (≥ 4 pushes), and the solution works in the game',
        () => {
          const result = solutionOf(def);
          expect(
            result,
            `Level "${def.id}" has no solution — fix its map in src/levels/levels.ts`,
          ).not.toBeNull();
          expect(result?.pushes ?? 0).toBeGreaterThanOrEqual(4);
          let game = newGame(level);
          for (const dir of result?.moves ?? []) game = move(game, dir);
          expect(isSolved(game)).toBe(true);
        },
        SOLVE_TIMEOUT,
      );
    },
  );

  it(
    'goes from the easiest to the hardest: the minimum number of pushes never drops',
    () => {
      const pushes = LEVELS.map((def) => solutionOf(def)?.pushes ?? 0);
      for (let i = 1; i < pushes.length; i++) {
        expect(
          pushes[i],
          `Level ${i + 1} ("${LEVELS[i]?.id}") needs fewer pushes than level ${i} — reorder them`,
        ).toBeGreaterThanOrEqual(pushes[i - 1] ?? 0);
      }
    },
    SOLVE_TIMEOUT,
  );

  it(
    'ends with the hardest level: the most pushes and the largest search of all',
    () => {
      const results = LEVELS.map((def) => solutionOf(def));
      const final = results.at(-1);
      const others = results.slice(0, -1);
      expect(final?.pushes).toBeGreaterThan(Math.max(...others.map((r) => r?.pushes ?? 0)));
      expect(final?.explored).toBeGreaterThan(Math.max(...others.map((r) => r?.explored ?? 0)));
    },
    SOLVE_TIMEOUT,
  );
});
