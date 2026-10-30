/** Słownik źródłowy — każdy tekst widoczny dla gracza. Kolejne języki muszą mieć ten sam kształt (typ Dictionary). */
export const pl = {
  title: 'Sokoban',
  tagline: 'Wepchnij wszystkie skrzynie na zaznaczone pola.',
  level: 'Plansza',
  moves: 'Ruchy',
  pushes: 'Pchnięcia',
  boxes: 'Skrzynie na miejscu',
  undo: 'Cofnij',
  reset: 'Od nowa',
  next: 'Inna plansza',
  keysMove: 'Strzałki — ruch',
  keysUndo: 'Z / Backspace — cofnij',
  keysReset: 'R — od nowa',
  keysNext: 'N — inna plansza',
  boardLabel: 'Plansza {name}',
  winTitle: 'Brawo!',
  winText: 'Ruchy: {moves}, pchnięcia: {pushes}',
  winNext: 'Następna plansza',
  errorTitle: 'Nie udało się wczytać planszy',
  errorHint:
    'To błąd w pliku z planszami, nie w Twojej grze. Wylosuj inną planszę, żeby grać dalej.',
  errorRetry: 'Wylosuj inną planszę',
} as const;

export type MessageKey = keyof typeof pl;
export type Dictionary = { readonly [K in MessageKey]: string };
