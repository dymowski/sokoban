import { describe, expect, it } from 'vitest';
import { pickLevelId } from '../../src/domain/random';

const ids = ['a', 'b', 'c', 'd'];

describe('pickLevelId', () => {
  it('nigdy nie zwraca ostatnio pokazanej planszy', () => {
    for (let i = 0; i < 100; i++) {
      const r = i / 100;
      expect(pickLevelId(ids, 'c', () => r)).not.toBe('c');
    }
  });

  it('pokrywa wszystkie pozostałe plansze', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) seen.add(pickLevelId(ids, 'a', () => i / 100));
    expect([...seen].sort()).toEqual(['b', 'c', 'd']);
  });

  it('bez ostatniej (albo z nieznaną) losuje z całej puli', () => {
    expect(pickLevelId(ids, null, () => 0)).toBe('a');
    expect(pickLevelId(ids, 'zzz', () => 0.999)).toBe('d');
  });

  it('pula z jedną planszą zwraca ją nawet, gdy była ostatnia', () => {
    expect(pickLevelId(['x'], 'x', () => 0.5)).toBe('x');
  });

  it('pusta pula to błąd z podpowiedzią', () => {
    expect(() => pickLevelId([], null, Math.random)).toThrow(
      /Pula plansz jest pusta.*src\/levels\/levels.ts/,
    );
  });
});
