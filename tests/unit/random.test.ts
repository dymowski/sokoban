import { describe, expect, it } from 'vitest';
import { pickLevelId } from '../../src/domain/random';

const ids = ['a', 'b', 'c', 'd'];

describe('pickLevelId', () => {
  it('never returns the last shown level', () => {
    for (let i = 0; i < 100; i++) {
      const r = i / 100;
      expect(pickLevelId(ids, 'c', () => r)).not.toBe('c');
    }
  });

  it('covers all the remaining levels', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) seen.add(pickLevelId(ids, 'a', () => i / 100));
    expect([...seen].sort()).toEqual(['b', 'c', 'd']);
  });

  it('without a last id (or with an unknown one) picks from the whole pool', () => {
    expect(pickLevelId(ids, null, () => 0)).toBe('a');
    expect(pickLevelId(ids, 'zzz', () => 0.999)).toBe('d');
  });

  it('a single-level pool returns it even when it was the last one', () => {
    expect(pickLevelId(['x'], 'x', () => 0.5)).toBe('x');
  });

  it('an empty pool is an error with a hint', () => {
    expect(() => pickLevelId([], null, Math.random)).toThrow(
      /level pool is empty.*src\/levels\/levels.ts/,
    );
  });
});
