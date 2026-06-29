import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { useLang } from "@/lib/i18n";
import { Mail, Send, Heart, HandCoins, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · MBI" },
      { name: "description", content: "Get in touch with the Multicultural Bridge Initiative — submissions, partnerships, media inquiries." },
      { property: "og:title", content: "Contact — MBI" },
      { property: "og:description", content: "Submissions, partnerships, media inquiries." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "姓名不能为空").max(100),
  email: z.string().trim().email("邮箱格式不正确").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "请输入内容").max(2000),
});

function ContactPage() {
  const { t } = useLang();
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const parsed = schema.safeParse({
      name: fd.get("name") || "",
      email: fd.get("email") || "",
      subject: fd.get("subject") || "",
      message: fd.get("message") || "",
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("已收到您的留言，我们会尽快回复。","Message received — we'll reply soon."));
    (e.target as HTMLFormElement).reset();
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        titleZh={t("我们很乐意听见你。", "We'd love to hear from you.")}
        titleEn={t("We'd love to hear from you.", "我们很乐意听见你。")}
      />
      <section className="container-prose py-20 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5 space-y-8">
          <div>
            <p className="eyebrow mb-2">Email</p>
            <a href="mailto:INFO.BRIDGEAWAY@GMAIL.COM" className="serif text-xl flex items-center gap-2 hover:text-accent break-all">
              <Mail className="h-4 w-4 text-accent shrink-0" /> INFO.BRIDGEAWAY@GMAIL.COM
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              {t("投稿、合作、媒体咨询请使用此邮箱，我们会在 1–3 个工作日内回复。", "For submissions, partnerships and media inquiries — we reply within 1–3 business days.")}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">{t("办公方式", "How we work")}</p>
            <p className="serif text-lg">{t("远程协作 · Remote-first", "Remote-first")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("我们是一个分布式的网络团队，目前以线上方式开展工作。", "We are a distributed network team, currently operating online.")}
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="md:col-span-7 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-stone-warm">{t("姓名","Name")}</span>
              <input name="name" required maxLength={100} className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-stone-warm">Email</span>
              <input name="email" required type="email" maxLength={255} className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent" />
            </label>
          </div>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-stone-warm">{t("主题","Subject")}</span>
            <input name="subject" maxLength={200} className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-stone-warm">{t("留言","Message")}</span>
            <textarea name="message" required rows={6} maxLength={2000} className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent resize-none" />
          </label>
          <button disabled={sending} className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-sm tracking-widest uppercase disabled:opacity-60">
            <Send className="h-4 w-4" /> {sending ? "…" : t("发送","Send")}
          </button>
        </form>
      </section>
    </SiteShell>
  );
}
