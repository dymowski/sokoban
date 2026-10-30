/** Picks a random level id, skipping the last shown one (as long as the pool has another). */
export function pickLevelId(
  ids: readonly string[],
  lastId: string | null,
  rng: () => number,
): string {
  if (ids.length === 0) {
    throw new Error('The level pool is empty — add at least one level in src/levels/levels.ts');
  }
  const candidates = ids.length > 1 ? ids.filter((id) => id !== lastId) : ids;
  const index = Math.min(Math.floor(rng() * candidates.length), candidates.length - 1);
  return candidates[index] as string;
}
