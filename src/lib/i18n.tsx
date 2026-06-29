import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { translateBatch } from "./translate.functions";

export type Lang = "zh" | "en" | "es";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (zh: string, en: string) => string;
};

const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (_, en) => en });

const CACHE_KEY = "mbi-es-cache-v1";

function loadCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}
function saveCache(cache: Record<string, string>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [, force] = useState(0);
  const esCacheRef = useRef<Record<string, string>>({});
  const pendingRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mbi-lang") as Lang | null;
    if (saved === "zh" || saved === "en" || saved === "es") setLangState(saved);
    esCacheRef.current = loadCache();
    force((n) => n + 1);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("mbi-lang", l);
  };

  const flush = useCallback(async () => {
    const batch = Array.from(pendingRef.current).filter((s) => !inFlightRef.current.has(s)).slice(0, 50);
    if (batch.length === 0) return;
    batch.forEach((s) => { pendingRef.current.delete(s); inFlightRef.current.add(s); });
    try {
      const { translations } = await translateBatch({ data: { texts: batch, target: "es" } });
      batch.forEach((src, i) => { esCacheRef.current[src] = translations[i] || src; });
      saveCache(esCacheRef.current);
      force((n) => n + 1);
    } catch (e) {
      // leave as English; will retry next time string is rendered
    } finally {
      batch.forEach((s) => inFlightRef.current.delete(s));
      if (pendingRef.current.size > 0) scheduleFlush();
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void flush();
    }, 250);
  }, [flush]);

  const t = useCallback((zh: string, en: string) => {
    if (lang === "zh") return zh;
    if (lang === "en") return en;
    // es
    const cached = esCacheRef.current[en];
    if (cached) return cached;
    if (!inFlightRef.current.has(en) && !pendingRef.current.has(en)) {
      pendingRef.current.add(en);
      scheduleFlush();
    }
    return en; // fallback while loading
  }, [lang, scheduleFlush]);

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
