import type { Lang } from "./i18n";

/** Pick the best localized value: prefer the active language, fall back to EN then ZH. */
export function pickLocalized(
  lang: Lang,
  values: { zh?: string | null; en?: string | null; es?: string | null }
): string {
  const zh = (values.zh || "").trim();
  const en = (values.en || "").trim();
  const es = (values.es || "").trim();
  if (lang === "es") return es || en || zh;
  if (lang === "en") return en || zh || es;
  return zh || en || es;
}
