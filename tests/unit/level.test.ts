import { describe, expect, it } from 'vitest';
import { LevelError, cellIndex, parseLevel } from '../../src/domain/level';

const def = (map: string) => ({ id: 't', name: 'Test', map });

describe('parseLevel', () => {
  it('czyta ściany, cele, skrzynie i ludzika z formatu XSB', () => {
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

  it('rozumie ludzika na celu (+) i skrzynię na celu (*)', () => {
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

  it('wyrównuje krótsze wiersze i nie liczy zewnętrza jako podłogi', () => {
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

  it('odrzuca planszę bez ludzika z komunikatem, co poprawić', () => {
    expect(() => parseLevel(def('#####\n# $.#\n#####'))).toThrow(LevelError);
    expect(() => parseLevel(def('#####\n# $.#\n#####'))).toThrow(
      /Plansza »t«: brak ludzika.*dokładnie jeden znak @ lub \+/,
    );
  });

  it('odrzuca planszę z dwoma ludzikami, wskazując wiersz', () => {
    expect(() => parseLevel(def('######\n#@$.@#\n######'))).toThrow(/drugi ludzik w wierszu 2/);
  });

  it('odrzuca różną liczbę skrzyń i celów', () => {
    expect(() => parseLevel(def('######\n#@$$.#\n######'))).toThrow(
      /2 skrzyń.*1 celów.*muszą być równe/,
    );
  });

  it('odrzuca nieznany znak, wskazując go i jego pozycję', () => {
    expect(() => parseLevel(def('#####\n#@$x#\n#####'))).toThrow(
      /nieznany znak »x« w wierszu 2, kolumnie 4/,
    );
  });

  it('odrzuca planszę bez skrzyń', () => {
    expect(() => parseLevel(def('####\n#@ #\n####'))).toThrow(/brak skrzyń/);
  });

  it('odrzuca planszę niezamkniętą ścianami', () => {
    expect(() => parseLevel(def('#####\n#@$. \n#####'))).toThrow(/nie jest zamknięta ścianami/);
  });

  it('odrzuca skrzynię lub cel poza obszarem dostępnym dla ludzika', () => {
    expect(() =>
      parseLevel(
        def(`
#########
#@$.#.$ #
#########
`),
      ),
    ).toThrow(/poza obszarem dostępnym dla ludzika/);
  });
});
