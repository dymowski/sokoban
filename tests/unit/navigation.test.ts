import { describe, expect, it } from 'vitest';
import { gridStep, hashOf, levelFromHash } from '../../src/domain/navigation';

describe('levelFromHash', () => {
  it('reads a 1-based level number from the address hash', () => {
    expect(levelFromHash('#1', 40)).toBe(0);
    expect(levelFromHash('#7', 40)).toBe(6);
    expect(levelFromHash('#40', 40)).toBe(39);
  });

  it.each(['', '#', '#0', '#41', '#-3', '#abc', '#7x', '#07', '#1.5'])(
    'an empty, unknown or out-of-range hash "%s" means level 1',
    (hash) => {
      expect(levelFromHash(hash, 40)).toBe(0);
    },
  );
});

describe('hashOf', () => {
  it('writes the level number, 1-based', () => {
    expect(hashOf(0)).toBe('#1');
    expect(hashOf(22)).toBe('#23');
  });

  it('round-trips with levelFromHash', () => {
    for (let i = 0; i < 40; i++) expect(levelFromHash(hashOf(i), 40)).toBe(i);
  });
});

describe('gridStep', () => {
  // 10 levels in rows of 4:
  //  0  1  2  3
  //  4  5  6  7
  //  8  9
  const step = (index: number, dir: 'up' | 'down' | 'left' | 'right') =>
    gridStep(index, dir, 10, 4);

  it('left and right move by one, also across rows', () => {
    expect(step(5, 'left')).toBe(4);
    expect(step(5, 'right')).toBe(6);
    expect(step(3, 'right')).toBe(4);
    expect(step(4, 'left')).toBe(3);
  });

  it('up and down move by a whole row', () => {
    expect(step(5, 'up')).toBe(1);
    expect(step(1, 'down')).toBe(5);
    expect(step(5, 'down')).toBe(9);
  });

  it('stays in place at the edges of the grid', () => {
    expect(step(0, 'left')).toBe(0);
    expect(step(9, 'right')).toBe(9);
    expect(step(2, 'up')).toBe(2);
    expect(step(8, 'down')).toBe(8);
  });

  it('does not step down into the missing part of the last row', () => {
    expect(step(6, 'down')).toBe(6);
    expect(step(7, 'down')).toBe(7);
  });
});
