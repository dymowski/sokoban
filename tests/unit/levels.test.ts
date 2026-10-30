import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../src/levels/levels';
import { parseLevel } from '../../src/domain/level';
import { isSolved, newGame } from '../../src/domain/game';
import { solve } from '../../src/domain/solver';

describe('pula plansz', () => {
  it('ma co najmniej 10 plansz z unikalnymi id', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
  });

  describe.each(LEVELS.map((l) => [l.id, l] as const))('plansza %s', (_id, def) => {
    const level = parseLevel(def);

    it('nie jest rozwiązana na starcie', () => {
      expect(isSolved(newGame(level))).toBe(false);
    });

    it('jest rozwiązywalna i niebanalna (≥ 4 pchnięcia)', () => {
      const result = solve(level);
      expect(
        result,
        `Plansza »${def.id}« nie ma rozwiązania — popraw mapę w src/levels/levels.ts`,
      ).not.toBeNull();
      expect(result?.pushes ?? 0).toBeGreaterThanOrEqual(4);
    });
  });
});
