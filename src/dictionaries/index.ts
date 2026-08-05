import type { Locale } from "@/i18n/config";
import type { Dictionary } from "./types";
import en from "./en";
import ko from "./ko";

const dictionaries: Record<Locale, Dictionary> = { en, ko };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary } from "./types";
