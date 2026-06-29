import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Globe, ChevronDown, User, LogOut } from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/mbi-logo.png.asset.json";


const nav = [
  { to: "/", zh: "首页", en: "Home" },
  { to: "/about", zh: "关于我们", en: "About" },
  { to: "/news", zh: "新闻与评论", en: "News" },
  { to: "/events", zh: "活动", en: "Events" },
  { to: "/theology", zh: "神学争鸣", en: "Theology" },
  { to: "/cultural-exchange", zh: "文化交流", en: "Exchange" },
  { to: "/faith-public", zh: "公共议题", en: "Public Life" },
  { to: "/journal", zh: "电子期刊", en: "Journal" },
  { to: "/resources", zh: "资源中心", en: "Resources" },
  { to: "/contact", zh: "联系我们", en: "Contact" },
] as const;

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
  { code: "es", label: "ES" },
];

export function Header() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserOpen(false);
  };


  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-prose flex items-center justify-between h-16 lg:h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logoAsset.url} alt="Multicultural Bridge Initiative" width={48} height={48} className="h-10 w-auto lg:h-12" />
          <span className="leading-tight hidden sm:block">
            <span className="block font-serif text-base lg:text-lg text-foreground">{t("多元文化桥梁计划", "Multicultural Bridge Initiative")}</span>
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
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-stone-warm hover:text-accent transition-colors px-2 py-1.5"
              aria-label="Language"
            >
              <Globe className="h-3.5 w-3.5" />
              {LANGS.find((l) => l.code === lang)?.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 min-w-[7rem] border border-border bg-background shadow-lg">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`block w-full text-left px-3 py-2 text-xs uppercase tracking-widest hover:bg-secondary ${lang === l.code ? "text-accent" : "text-foreground"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {email ? (
            <div ref={userRef} className="relative hidden sm:block">
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-stone-warm hover:text-accent transition-colors px-2 py-1.5"
                aria-label="Account"
              >
                <User className="h-3.5 w-3.5" />
                <span className="max-w-[8rem] truncate normal-case tracking-normal">{email}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-1 min-w-[10rem] border border-border bg-background shadow-lg">
                  <Link
                    to="/account"
                    onClick={() => setUserOpen(false)}
                    className="block w-full text-left px-3 py-2 text-xs uppercase tracking-widest hover:bg-secondary"
                  >
                    {t("我的账号", "Account")}
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setUserOpen(false)}
                    className="block w-full text-left px-3 py-2 text-xs uppercase tracking-widest hover:bg-secondary"
                  >
                    {t("后台", "Admin")}
                  </Link>

                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs uppercase tracking-widest hover:bg-secondary"
                  >
                    <LogOut className="h-3 w-3" />
                    {t("退出", "Sign out")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:flex items-center gap-1.5 text-xs tracking-widest uppercase text-stone-warm hover:text-accent transition-colors px-2 py-1.5"
            >
              <User className="h-3.5 w-3.5" />
              {t("登录", "Sign in")}
            </Link>
          )}

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
          </nav>
        </div>
      )}
    </header>
  );
}
