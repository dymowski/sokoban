import { en, type Dictionary, type MessageKey } from './en';

const dictionary: Dictionary = en;

/** Text from the dictionary; each {name} placeholder is replaced with its value from params. */
export function t(key: MessageKey, params: Readonly<Record<string, string | number>> = {}): string {
  return dictionary[key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
