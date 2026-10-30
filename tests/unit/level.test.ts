import { describe, expect, it } from 'vitest';
import { LevelError, cellIndex, parseLevel } from '../../src/domain/level';

const def = (map: string) => ({ id: 't', name: 'Test', map });

describe('parseLevel', () => {
  it('reads walls, goals, boxes and the player from XSB', () => {
    const level = parseLevel(
      def(`
#####
#@$.#
#####
`),
    );
    expect(level.width).toBe(5);
    expect(level.height).toBe(3);
    expect(level.player).toBe(cellIndex(level, 1, 1));
    expect([...level.boxes]).toEqual([cellIndex(level, 2, 1)]);
    expect([...level.goals]).toEqual([cellIndex(level, 3, 1)]);
    expect(level.walls.has(cellIndex(level, 0, 0))).toBe(true);
    expect(level.floor.has(cellIndex(level, 3, 1))).toBe(true);
  });

  it('understands player on goal (+) and box on goal (*)', () => {
    const level = parseLevel(
      def(`
######
#+*$ #
######
`),
    );
    expect(level.player).toBe(cellIndex(level, 1, 1));
    expect(level.goals.has(cellIndex(level, 1, 1))).toBe(true);
    expect(level.goals.has(cellIndex(level, 2, 1))).toBe(true);
    expect(level.boxes.has(cellIndex(level, 2, 1))).toBe(true);
  });

  it('pads shorter rows and does not count the outside as floor', () => {
    const level = parseLevel(
      def(`
  ####
###  #
#@$. #
######
`),
    );
    expect(level.width).toBe(6);
    expect(level.floor.has(cellIndex(level, 0, 0))).toBe(false);
    expect(level.floor.has(cellIndex(level, 4, 1))).toBe(true);
  });

  it('rejects a level without a player, saying what to fix', () => {
    expect(() => parseLevel(def('#####\n# $.#\n#####'))).toThrow(LevelError);
    expect(() => parseLevel(def('#####\n# $.#\n#####'))).toThrow(
      /Level "t": no player.*exactly one @ or \+/,
    );
  });

  it('rejects a level with two players, pointing at the row', () => {
    expect(() => parseLevel(def('######\n#@$.@#\n######'))).toThrow(/second player in row 2/);
  });

  it('rejects different numbers of boxes and goals', () => {
    expect(() => parseLevel(def('######\n#@$$.#\n######'))).toThrow(
      /boxes: 2, goals: 1.*must be equal/,
    );
  });

  it('rejects an unknown character, pointing at it and its position', () => {
    expect(() => parseLevel(def('#####\n#@$x#\n#####'))).toThrow(
      /unknown character "x" in row 2, column 4/,
    );
  });

  it('rejects a level without boxes', () => {
    expect(() => parseLevel(def('####\n#@ #\n####'))).toThrow(/no boxes/);
  });

  it('rejects a level not enclosed by walls', () => {
    expect(() => parseLevel(def('#####\n#@$. \n#####'))).toThrow(/not enclosed by walls/);
  });

  it('rejects a box or goal outside the area the player can reach', () => {
    expect(() =>
      parseLevel(
        def(`
#########
#@$.#.$ #
#########
`),
      ),
    ).toThrow(/outside the area the player can reach/);
  });
});
