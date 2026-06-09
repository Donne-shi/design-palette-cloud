import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useLang } from "@/lib/i18n";

const nav = [
  { to: "/", zh: "首页", en: "Home" },
  { to: "/about", zh: "关于我们", en: "About" },
  { to: "/news", zh: "新闻与评论", en: "News" },
  { to: "/theology", zh: "神学争鸣", en: "Theology" },
  { to: "/cultural-exchange", zh: "文化交流", en: "Exchange" },
  { to: "/faith-public", zh: "公共议题", en: "Public Life" },
  { to: "/journal", zh: "电子期刊", en: "Journal" },
  { to: "/resources", zh: "资源中心", en: "Resources" },
  { to: "/contact", zh: "联系我们", en: "Contact" },
] as const;

export function Header() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-prose flex items-center justify-between h-16 lg:h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="inline-block h-8 w-8 rounded-sm bg-accent text-accent-foreground grid place-items-center font-serif text-lg">M</span>
          <span className="leading-tight">
            <span className="block font-serif text-base lg:text-lg text-foreground">{t("多元文化桥梁计划", "Multicultural Bridge")}</span>
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stone-warm">MBI · Building Bridges</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[13px] text-foreground/85">
          {nav.slice(1).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="link-underline"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {t(n.zh, n.en)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="hidden sm:flex items-center gap-1.5 text-xs tracking-widest uppercase text-stone-warm hover:text-accent transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "zh" ? "EN" : "中"}
          </button>
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/70 bg-background">
          <nav className="container-prose py-4 grid gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm"
                activeProps={{ className: "text-accent" }}
              >
                {t(n.zh, n.en)}
              </Link>
            ))}
            <button
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-stone-warm"
            >
              <Globe className="h-3.5 w-3.5" /> {lang === "zh" ? "English" : "中文"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
