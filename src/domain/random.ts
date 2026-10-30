/** Losuje id planszy, pomijając ostatnio pokazaną (o ile w puli jest coś innego). */
export function pickLevelId(
  ids: readonly string[],
  lastId: string | null,
  rng: () => number,
): string {
  if (ids.length === 0) {
    throw new Error(
      'Pula plansz jest pusta — dodaj co najmniej jedną planszę w src/levels/levels.ts',
    );
  }
  const candidates = ids.length > 1 ? ids.filter((id) => id !== lastId) : ids;
  const index = Math.min(Math.floor(rng() * candidates.length), candidates.length - 1);
  return candidates[index] as string;
}
