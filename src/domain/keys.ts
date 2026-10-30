import type { Direction } from './game';

export type Action =
  | { readonly type: 'move'; readonly dir: Direction }
  | { readonly type: 'undo' }
  | { readonly type: 'reset' }
  | { readonly type: 'next' }
  | { readonly type: 'confirm' };

const ARROWS: Readonly<Record<string, Direction>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Mapuje KeyboardEvent.key na akcję gry; inne klawisze → null (przeglądarka obsługuje je normalnie). */
export function keyToAction(key: string): Action | null {
  const dir = ARROWS[key];
  if (dir) return { type: 'move', dir };
  if (key === 'Backspace') return { type: 'undo' };
  if (key === 'Enter') return { type: 'confirm' };
  switch (key.toLowerCase()) {
    case 'z':
      return { type: 'undo' };
    case 'r':
      return { type: 'reset' };
    case 'n':
      return { type: 'next' };
    default:
      return null;
  }
}
