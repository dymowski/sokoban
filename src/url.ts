/** The address hash holds the current level number ("#7"), so F5 and a shared link keep the level. Game state is not saved. */
export function readHash(): string {
  try {
    return window.location.hash;
  } catch {
    return '';
  }
}

/** Replaces the hash without a new history entry (Back leaves the game, not the previous level). */
export function writeHash(hash: string): void {
  try {
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  } catch {
    // No access to history (sandboxed frame) — never mind, only F5 starts at level 1 again.
  }
}
