/** Source dictionary: every text the player sees. Other languages must have the same shape (Dictionary type). */
export const en = {
  title: 'Sokoban',
  tagline: 'Push every box onto a marked square.',
  level: 'Level',
  levelCounter: '{number}/{total}',
  moves: 'Moves',
  pushes: 'Pushes',
  boxes: 'Boxes on goals',
  undo: 'Undo',
  reset: 'Restart',
  previous: 'Previous',
  next: 'Next',
  levels: 'Levels',
  keysMove: 'Arrows — move',
  keysUndo: 'Z / Backspace — undo',
  keysReset: 'R — restart',
  keysNext: 'N / P — next / previous level',
  keysLevels: 'L — level list',
  boardLabel: 'Level {name}',
  winTitle: 'Well done!',
  winText: 'Moves: {moves}, pushes: {pushes}',
  winNext: 'Next level',
  winAllTitle: 'All {total} levels solved!',
  winRestart: 'Back to level 1',
  pickerTitle: 'Choose a level',
  pickerHint: 'Arrows — choose, Enter — play, Esc — close',
  pickerClose: 'Close',
  levelOption: 'Level {number}: {name}',
  errorTitle: 'Could not load level {number}',
  errorHint:
    'This is a bug in the level file, not in your game. Choose another level, or press N / P, to keep playing.',
  errorRetry: 'Choose a level',
} as const;

export type MessageKey = keyof typeof en;
export type Dictionary = { readonly [K in MessageKey]: string };
