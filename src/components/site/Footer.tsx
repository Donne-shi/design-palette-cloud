import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BridgeMark, Ornament } from "./Brand";
import { Mail, MapPin, Send, Github, Twitter, Youtube, Rss } from "lucide-react";

export function Footer() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("subscribers").insert({ email, language: lang });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.success(t("您已订阅，谢谢！", "You're already subscribed, thank you!"));
      else toast.error(t("订阅失败，请稍后再试。", "Subscription failed, please try again."));
      return;
    }
    setEmail("");
    toast.success(t("订阅成功！感谢您的支持。", "Subscribed. Thank you!"));
  };

  return (
    <footer className="mt-24 border-t border-border/70 bg-secondary/40">
      <div className="container-prose pt-16 pb-12 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 text-accent">
            <BridgeMark className="h-9 w-9" />
            <Ornament className="hidden sm:flex" />
          </div>
          <p className="serif text-2xl leading-snug text-foreground max-w-md mt-6">
            {t(
              "以福音连接文化，以真理回应时代，以恩典促进对话。",
              "Building bridges across cultures through the Gospel — truth, grace, dialogue."
            )}
          </p>
          <p className="mt-6 text-sm text-muted-foreground max-w-md">
            {t(
              "Multicultural Bridge Initiative · 一个连接福音信仰、公共议题与跨文化交流的平台。",
              "A platform connecting Gospel faith, public discourse, and cross-cultural exchange."
            )}
          </p>
          <div className="mt-6 flex items-center gap-4 text-stone-warm">
            <a aria-label="Email" href="mailto:hello@mbi.example" className="hover:text-accent transition-colors"><Mail className="h-4 w-4" /></a>
            <a aria-label="Twitter" href="#" className="hover:text-accent transition-colors"><Twitter className="h-4 w-4" /></a>
            <a aria-label="YouTube" href="#" className="hover:text-accent transition-colors"><Youtube className="h-4 w-4" /></a>
            <a aria-label="GitHub" href="#" className="hover:text-accent transition-colors"><Github className="h-4 w-4" /></a>
            <a aria-label="RSS" href="#" className="hover:text-accent transition-colors"><Rss className="h-4 w-4" /></a>
          </div>
        </div>

        <div className="md:col-span-3 text-sm">
          <p className="eyebrow mb-4">{t("导航", "Sitemap")}</p>
          <ul className="space-y-2 text-foreground/80">
            <li><Link to="/about" className="link-underline">{t("关于我们", "About")}</Link></li>
            <li><Link to="/journal" className="link-underline">{t("电子期刊", "Journal")}</Link></li>
            <li><Link to="/theology" className="link-underline">{t("神学争鸣", "Theology Forum")}</Link></li>
            <li><Link to="/resources" className="link-underline">{t("资源中心", "Resources")}</Link></li>
            <li><Link to="/contact" className="link-underline">{t("联系我们", "Contact")}</Link></li>
          </ul>
          <p className="mt-6 text-xs text-stone-warm flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> Pasadena, CA
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow mb-4">{t("订阅电子期刊", "Subscribe")}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {t("每季度一期《桥梁》Bridge Quarterly。无垃圾邮件，可随时退订。", "Bridge Quarterly, four times a year. No spam, unsubscribe anytime.")}
          </p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("您的邮箱", "your@email.com")}
              className="flex-1 bg-background border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 bg-accent text-accent-foreground px-4 py-2 text-sm tracking-wider uppercase hover:bg-accent/90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> {loading ? "…" : t("订阅", "Subscribe")}
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="container-prose py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Multicultural Bridge Initiative. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <Link to="/admin" className="hover:text-accent">{t("后台", "Admin")}</Link>
            <span>Truth · Grace · Dialogue · Service · Hope</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
