/** Klucz z id ostatnio pokazanej planszy — tylko po to, żeby F5 wylosowało inną. Stan gry nie jest zapisywany. */
export const LAST_LEVEL_KEY = 'sokoban:lastLevelId';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** sessionStorage albo null, gdy przeglądarka go blokuje (tryb prywatny, wyłączone dane witryn). */
export function sessionStore(): KeyValueStore | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readLastLevelId(store: KeyValueStore | null): string | null {
  try {
    return store?.getItem(LAST_LEVEL_KEY) ?? null;
  } catch {
    return null;
  }
}

export function writeLastLevelId(store: KeyValueStore | null, id: string): void {
  try {
    store?.setItem(LAST_LEVEL_KEY, id);
  } catch {
    // Brak dostępu do storage — trudno, kolejne F5 może trafić na tę samą planszę.
  }
}
