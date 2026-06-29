import { translateBatch } from "./translate.functions";

/**
 * Translate a set of English fields into Simplified Chinese and Spanish.
 * Returns parallel arrays keyed by the same order as `texts`.
 * Empty strings are passed through untouched.
 */
export async function translateEnglishToZhEs(texts: string[]): Promise<{ zh: string[]; es: string[] }> {
  const nonEmpty = texts.map((t) => (t ?? "").trim());
  const idxMap: number[] = [];
  const payload: string[] = [];
  nonEmpty.forEach((t, i) => {
    if (t) {
      idxMap.push(i);
      payload.push(t);
    }
  });
  if (payload.length === 0) {
    return { zh: nonEmpty.map(() => ""), es: nonEmpty.map(() => "") };
  }
  const [zhRes, esRes] = await Promise.all([
    translateBatch({ data: { texts: payload, target: "zh" } }),
    translateBatch({ data: { texts: payload, target: "es" } }),
  ]);
  const zh = nonEmpty.map(() => "");
  const es = nonEmpty.map(() => "");
  idxMap.forEach((origIdx, i) => {
    zh[origIdx] = zhRes.translations[i] ?? "";
    es[origIdx] = esRes.translations[i] ?? "";
  });
  return { zh, es };
}
