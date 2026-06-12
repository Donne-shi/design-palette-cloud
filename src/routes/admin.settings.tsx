import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({ component: SettingsAdmin });

type Settings = {
  contact: { email: string; wechat: string; address: string };
  social: { twitter: string; weibo: string; youtube: string; github: string };
  hero: { title_zh: string; title_en: string; lead_zh: string; lead_en: string };
};

const DEFAULT: Settings = {
  contact: { email: "", wechat: "", address: "" },
  social: { twitter: "", weibo: "", youtube: "", github: "" },
  hero: { title_zh: "", title_en: "", lead_zh: "", lead_en: "" },
};

function SettingsAdmin() {
  const [s, setS] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) toast.error(error.message);
      else {
        const m: any = { ...DEFAULT };
        for (const r of data || []) m[r.key] = { ...m[r.key], ...(r.value as any) };
        setS(m);
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const rows = (Object.keys(s) as (keyof Settings)[]).map(k => ({ key: k as string, value: s[k] as any }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("已保存");
  };

  if (loading) return <div className="p-10 text-sm text-muted-foreground">加载中…</div>;

  return (
    <div className="p-10 max-w-3xl">
      <p className="eyebrow mb-2">Admin</p>
      <h1 className="serif text-4xl">站点设置 · Settings</h1>
      <p className="text-muted-foreground mt-2 text-sm">这些设置会显示在前台公开页面（页脚、联系页、首页 Hero）。</p>

      <section className="mt-10 border border-border bg-card p-6 space-y-4">
        <h2 className="serif text-xl">联系信息</h2>
        <div><Label>公开邮箱</Label><Input value={s.contact.email} onChange={(e) => setS({ ...s, contact: { ...s.contact, email: e.target.value } })} placeholder="hello@bridgeaway.org"/></div>
        <div><Label>微信 / WeChat ID</Label><Input value={s.contact.wechat} onChange={(e) => setS({ ...s, contact: { ...s.contact, wechat: e.target.value } })}/></div>
        <div><Label>办公地址</Label><Input value={s.contact.address} onChange={(e) => setS({ ...s, contact: { ...s.contact, address: e.target.value } })}/></div>
      </section>

      <section className="mt-6 border border-border bg-card p-6 space-y-4">
        <h2 className="serif text-xl">社交媒体</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Twitter / X</Label><Input value={s.social.twitter} onChange={(e) => setS({ ...s, social: { ...s.social, twitter: e.target.value } })}/></div>
          <div><Label>微博 Weibo</Label><Input value={s.social.weibo} onChange={(e) => setS({ ...s, social: { ...s.social, weibo: e.target.value } })}/></div>
          <div><Label>YouTube</Label><Input value={s.social.youtube} onChange={(e) => setS({ ...s, social: { ...s.social, youtube: e.target.value } })}/></div>
          <div><Label>GitHub</Label><Input value={s.social.github} onChange={(e) => setS({ ...s, social: { ...s.social, github: e.target.value } })}/></div>
        </div>
      </section>

      <section className="mt-6 border border-border bg-card p-6 space-y-4">
        <h2 className="serif text-xl">首页 Hero</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>中文主标题</Label><Input value={s.hero.title_zh} onChange={(e) => setS({ ...s, hero: { ...s.hero, title_zh: e.target.value } })}/></div>
          <div><Label>English Title</Label><Input value={s.hero.title_en} onChange={(e) => setS({ ...s, hero: { ...s.hero, title_en: e.target.value } })}/></div>
        </div>
        <div><Label>中文导语</Label><Textarea rows={3} value={s.hero.lead_zh} onChange={(e) => setS({ ...s, hero: { ...s.hero, lead_zh: e.target.value } })}/></div>
        <div><Label>English Lead</Label><Textarea rows={3} value={s.hero.lead_en} onChange={(e) => setS({ ...s, hero: { ...s.hero, lead_en: e.target.value } })}/></div>
      </section>

      <div className="mt-8 flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4"/>{saving ? "保存中…" : "保存设置"}</Button>
      </div>
    </div>
  );
}
