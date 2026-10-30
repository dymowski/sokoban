import type { Level } from './level';

export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTIONS: readonly Direction[] = ['up', 'down', 'left', 'right'];

interface Snapshot {
  readonly player: number;
  readonly boxes: ReadonlySet<number>;
  readonly moves: number;
  readonly pushes: number;
  readonly facing: Direction;
}

export interface GameState extends Snapshot {
  readonly level: Level;
  /** Previous states for undo — in memory only, the game saves nothing. */
  readonly history: readonly Snapshot[];
}

export const offset = (level: Pick<Level, 'width'>, dir: Direction): number => {
  switch (dir) {
    case 'up':
      return -level.width;
    case 'down':
      return level.width;
    case 'left':
      return -1;
    case 'right':
      return 1;
  }
};

export function newGame(level: Level): GameState {
  return {
    level,
    player: level.player,
    boxes: level.boxes,
    moves: 0,
    pushes: 0,
    facing: 'down',
    history: [],
  };
}

const isFree = (state: GameState, cell: number): boolean =>
  state.level.floor.has(cell) && !state.boxes.has(cell);

/** One step in the given direction; pushes a box if the square behind it is free. A blocked move returns the same state. */
export function move(state: GameState, dir: Direction): GameState {
  const d = offset(state.level, dir);
  const target = state.player + d;
  if (!state.level.floor.has(target)) return state;

  const snapshot: Snapshot = {
    player: state.player,
    boxes: state.boxes,
    moves: state.moves,
    pushes: state.pushes,
    facing: state.facing,
  };

  if (!state.boxes.has(target)) {
    return {
      ...state,
      player: target,
      moves: state.moves + 1,
      facing: dir,
      history: [...state.history, snapshot],
    };
  }

  const behind = target + d;
  if (!isFree(state, behind)) return state;
  const boxes = new Set(state.boxes);
  boxes.delete(target);
  boxes.add(behind);
  return {
    ...state,
    player: target,
    boxes,
    moves: state.moves + 1,
    pushes: state.pushes + 1,
    facing: dir,
    history: [...state.history, snapshot],
  };
}

export function undo(state: GameState): GameState {
  const prev = state.history.at(-1);
  if (!prev) return state;
  return { ...state, ...prev, history: state.history.slice(0, -1) };
}

export function reset(state: GameState): GameState {
  return newGame(state.level);
}

export function boxesOnGoals(state: GameState): number {
  let n = 0;
  for (const b of state.boxes) if (state.level.goals.has(b)) n++;
  return n;
}

export function isSolved(state: GameState): boolean {
  return boxesOnGoals(state) === state.level.goals.size;
}
