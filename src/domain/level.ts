export interface LevelDef {
  readonly id: string;
  readonly name: string;
  /** Mapa w formacie XSB: # ściana, @ ludzik, + ludzik na celu, $ skrzynia, * skrzynia na celu, . cel. */
  readonly map: string;
}

export interface Level {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly walls: ReadonlySet<number>;
  /** Pola wewnątrz planszy, po których może chodzić ludzik (bez ścian i zewnętrza). */
  readonly floor: ReadonlySet<number>;
  readonly goals: ReadonlySet<number>;
  readonly boxes: ReadonlySet<number>;
  readonly player: number;
}

export class LevelError extends Error {
  override name = 'LevelError';
}

export const cellIndex = (level: Pick<Level, 'width'>, x: number, y: number): number =>
  y * level.width + x;

export function parseLevel(def: LevelDef): Level {
  const fail = (msg: string): never => {
    throw new LevelError(`Plansza »${def.id}«: ${msg}`);
  };

  const rows = def.map.replace(/^\n+|\s+$/g, '').split('\n');
  const width = Math.max(...rows.map((r) => r.length));
  const height = rows.length;
  const walls = new Set<number>();
  const goals = new Set<number>();
  const boxes = new Set<number>();
  let player: number | null = null;

  for (const [y, row] of rows.entries()) {
    for (const [x, ch] of [...row].entries()) {
      const i = y * width + x;
      switch (ch) {
        case '#':
          walls.add(i);
          break;
        case '@':
        case '+':
          if (player !== null)
            fail(`drugi ludzik w wierszu ${y + 1} — dokładnie jeden znak @ lub +`);
          player = i;
          if (ch === '+') goals.add(i);
          break;
        case '$':
          boxes.add(i);
          break;
        case '*':
          boxes.add(i);
          goals.add(i);
          break;
        case '.':
          goals.add(i);
          break;
        case ' ':
        case '-':
        case '_':
          break;
        default:
          fail(
            `nieznany znak »${ch}« w wierszu ${y + 1}, kolumnie ${x + 1} — dozwolone: # @ + $ * . i spacja`,
          );
      }
    }
  }

  const start = player ?? fail('brak ludzika — mapa musi zawierać dokładnie jeden znak @ lub +');
  if (boxes.size === 0) fail('brak skrzyń — dodaj co najmniej jedną skrzynię ($) i cel (.)');
  if (boxes.size !== goals.size) {
    fail(`${boxes.size} skrzyń i ${goals.size} celów — liczby muszą być równe`);
  }

  const floor = new Set<number>([start]);
  const queue = [start];
  while (queue.length > 0) {
    const i = queue.pop() as number;
    const x = i % width;
    const y = Math.floor(i / width);
    if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
      fail(
        `nie jest zamknięta ścianami — ludzik może wyjść poza mapę przez pole w wierszu ${y + 1}, kolumnie ${x + 1}`,
      );
    }
    for (const n of [i - 1, i + 1, i - width, i + width]) {
      if (!walls.has(n) && !floor.has(n)) {
        floor.add(n);
        queue.push(n);
      }
    }
  }

  for (const i of [...boxes, ...goals]) {
    if (!floor.has(i)) {
      fail(
        `skrzynia lub cel w wierszu ${Math.floor(i / width) + 1}, kolumnie ${(i % width) + 1} leży poza obszarem dostępnym dla ludzika`,
      );
    }
  }

  return { id: def.id, name: def.name, width, height, walls, floor, goals, boxes, player: start };
}
