import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "zh" | "en";
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (zh: string, en: string) => string };

const LangCtx = createContext<Ctx>({ lang: "zh", setLang: () => {}, t: (zh) => zh });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("mbi-lang") as Lang | null) : null;
    if (saved === "zh" || saved === "en") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("mbi-lang", l);
  };
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
