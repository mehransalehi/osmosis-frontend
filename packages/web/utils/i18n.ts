import ar from "~/localizations/admin-ar.json";
import en from "~/localizations/admin-en.json";

const locales: Record<string, any> = {
  en,
  ar,
};

export function getLocale(lang: string) {
  return locales[lang] || locales["en"];
}
