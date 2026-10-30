import { describe, expect, it } from 'vitest';
import { keyToAction } from '../../src/domain/keys';

describe('keyToAction', () => {
  it.each([
    ['ArrowUp', 'up'],
    ['ArrowDown', 'down'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
  ] as const)('%s → move %s', (key, dir) => {
    expect(keyToAction(key)).toEqual({ type: 'move', dir });
  });

  it.each([
    ['z', 'undo'],
    ['Z', 'undo'],
    ['Backspace', 'undo'],
    ['r', 'reset'],
    ['R', 'reset'],
    ['n', 'next'],
    ['N', 'next'],
    ['Enter', 'confirm'],
  ] as const)('%s → %s', (key, type) => {
    expect(keyToAction(key)).toEqual({ type });
  });

  it('other keys are ignored', () => {
    expect(keyToAction('a')).toBeNull();
    expect(keyToAction(' ')).toBeNull();
    expect(keyToAction('Tab')).toBeNull();
  });
});
