import { pl, type Dictionary, type MessageKey } from './pl';

const dictionary: Dictionary = pl;

/** Tekst ze słownika; {nazwa} w tekście zastępowane wartością z params. */
export function t(key: MessageKey, params: Readonly<Record<string, string | number>> = {}): string {
  return dictionary[key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
