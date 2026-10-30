/** Key holding the id of the last shown level — only so that F5 picks a different one. Game state is not saved. */
export const LAST_LEVEL_KEY = 'sokoban:lastLevelId';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** sessionStorage, or null when the browser blocks it (private mode, site data disabled). */
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
    // No storage access — never mind, the next F5 may land on the same level.
  }
}
