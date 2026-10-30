/** Source dictionary: every text the player sees. Other languages must have the same shape (Dictionary type). */
export const en = {
  title: 'Sokoban',
  tagline: 'Push every box onto a marked square.',
  level: 'Level',
  moves: 'Moves',
  pushes: 'Pushes',
  boxes: 'Boxes on goals',
  undo: 'Undo',
  reset: 'Restart',
  next: 'Another level',
  keysMove: 'Arrows — move',
  keysUndo: 'Z / Backspace — undo',
  keysReset: 'R — restart',
  keysNext: 'N — another level',
  boardLabel: 'Level {name}',
  winTitle: 'Well done!',
  winText: 'Moves: {moves}, pushes: {pushes}',
  winNext: 'Next level',
  errorTitle: 'Could not load the level',
  errorHint:
    'This is a bug in the level file, not in your game. Pick another level to keep playing.',
  errorRetry: 'Pick another level',
} as const;

export type MessageKey = keyof typeof en;
export type Dictionary = { readonly [K in MessageKey]: string };
