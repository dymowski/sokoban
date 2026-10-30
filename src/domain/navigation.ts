import type { Direction } from './game';

/** Level index (0-based) from the address hash "#7" (1-based); anything else means level 1. */
export function levelFromHash(hash: string, count: number): number {
  const match = /^#([1-9]\d*)$/.exec(hash);
  const number = match ? Number(match[1]) : 0;
  return number >= 1 && number <= count ? number - 1 : 0;
}

/** Address hash for a level index (0-based): the level number the player sees. */
export const hashOf = (index: number): string => `#${index + 1}`;

/** Next selected index in the level grid; at an edge (or above a missing cell) it stays put. */
export function gridStep(index: number, dir: Direction, count: number, columns: number): number {
  const delta = { left: -1, right: 1, up: -columns, down: columns }[dir];
  const next = index + delta;
  return next >= 0 && next < count ? next : index;
}
