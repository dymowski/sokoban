import { DIRECTIONS, offset, type Direction } from './game';
import type { Level } from './level';

export interface Solution {
  /** Minimum number of pushes (BFS over pushes). */
  readonly pushes: number;
  /** Full move sequence to replay in the game. */
  readonly moves: readonly Direction[];
  /** States the search generated before it found the solution — a rough measure of difficulty. */
  readonly explored: number;
}

interface Node {
  readonly boxes: readonly number[];
  /** Actual player position (where the pushed box stood). */
  readonly player: number;
  readonly parent: number;
  readonly dir: Direction | null;
}

/** Squares from which a box can still be pushed to some goal (reverse "pulling" from the goals). */
function liveCells(level: Level): Set<number> {
  const live = new Set(level.goals);
  const queue = [...level.goals];
  while (queue.length > 0) {
    const q = queue.pop() as number;
    for (const dir of DIRECTIONS) {
      const d = offset(level, dir);
      if (level.floor.has(q - d) && level.floor.has(q - 2 * d) && !live.has(q - d)) {
        live.add(q - d);
        queue.push(q - d);
      }
    }
  }
  return live;
}

function reachable(level: Level, boxes: ReadonlySet<number>, from: number): Set<number> {
  const seen = new Set([from]);
  const queue = [from];
  while (queue.length > 0) {
    const c = queue.pop() as number;
    for (const dir of DIRECTIONS) {
      const n = c + offset(level, dir);
      if (level.floor.has(n) && !boxes.has(n) && !seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }
  return seen;
}

function walk(level: Level, boxes: ReadonlySet<number>, from: number, to: number): Direction[] {
  const prev = new Map<number, [number, Direction]>();
  const queue = [from];
  const seen = new Set([from]);
  for (let head = 0; head < queue.length; head++) {
    const c = queue[head] as number;
    if (c === to) break;
    for (const dir of DIRECTIONS) {
      const n = c + offset(level, dir);
      if (level.floor.has(n) && !boxes.has(n) && !seen.has(n)) {
        seen.add(n);
        prev.set(n, [c, dir]);
        queue.push(n);
      }
    }
  }
  const path: Direction[] = [];
  for (let c = to; c !== from;) {
    const step = prev.get(c);
    if (!step)
      throw new Error(`Solver: no player path from ${from} to ${to} — bug in the reconstruction`);
    path.push(step[1]);
    c = step[0];
  }
  return path.reverse();
}

/** Solves a level with BFS over pushes; used in tests to check the pool. */
export function solve(level: Level, maxStates = 1_000_000): Solution | null {
  const live = liveCells(level);
  if ([...level.boxes].some((b) => !live.has(b) && !level.goals.has(b))) return null;

  const keyOf = (boxes: readonly number[], region: Set<number>) =>
    `${boxes.join(',')}|${Math.min(...region)}`;

  const nodes: Node[] = [];
  const seen = new Set<string>();
  const startBoxes = [...level.boxes].sort((a, b) => a - b);
  nodes.push({ boxes: startBoxes, player: level.player, parent: -1, dir: null });
  seen.add(keyOf(startBoxes, reachable(level, level.boxes, level.player)));

  for (let head = 0; head < nodes.length; head++) {
    const node = nodes[head] as Node;
    if (node.boxes.every((b) => level.goals.has(b))) return rebuild(level, nodes, head);
    if (nodes.length > maxStates) return null;

    const boxSet = new Set(node.boxes);
    const region = reachable(level, boxSet, node.player);
    for (const box of node.boxes) {
      for (const dir of DIRECTIONS) {
        const d = offset(level, dir);
        const to = box + d;
        if (!region.has(box - d) || !level.floor.has(to) || boxSet.has(to) || !live.has(to))
          continue;
        const next = node.boxes.map((b) => (b === box ? to : b)).sort((a, b) => a - b);
        const nextSet = new Set(next);
        const key = keyOf(next, reachable(level, nextSet, box));
        if (seen.has(key)) continue;
        seen.add(key);
        nodes.push({ boxes: next, player: box, parent: head, dir });
      }
    }
  }
  return null;
}

function rebuild(level: Level, nodes: readonly Node[], goal: number): Solution {
  const chain: Node[] = [];
  for (let i = goal; i !== -1; i = (nodes[i] as Node).parent) chain.push(nodes[i] as Node);
  chain.reverse();

  const moves: Direction[] = [];
  for (let i = 1; i < chain.length; i++) {
    const prev = chain[i - 1] as Node;
    const cur = chain[i] as Node;
    const dir = cur.dir as Direction;
    const pushFrom = cur.player - offset(level, dir);
    moves.push(...walk(level, new Set(prev.boxes), prev.player, pushFrom), dir);
  }
  return { pushes: chain.length - 1, moves, explored: nodes.length };
}
