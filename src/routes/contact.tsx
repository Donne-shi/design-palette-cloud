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

      {/* SUPPORT US / DONATE */}
      <section className="bg-secondary/40 border-y border-border/70">
        <div className="container-prose py-20 md:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-accent"/> {t("支持我们", "Support Us")}</p>
            <h2 className="serif text-4xl md:text-5xl leading-tight">
              {t("以奉献参与这项事工", "Partner with us through your giving")}
            </h2>
            <p className="mt-6 text-foreground/80 leading-relaxed">
              {t(
                "Multicultural Bridge Initiative 是一个以福音为中心的非营利事工。每一笔奉献都将用于内容创作、跨文化对话、活动与期刊出版。我们承诺所有奉献都将忠心、透明地使用。",
                "Multicultural Bridge Initiative is a Gospel-centered non-profit ministry. Every gift supports our editorial work, cross-cultural dialogue, events, and journal. We are committed to using all gifts faithfully and transparently."
              )}
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="border border-border bg-card p-6">
              <HandCoins className="h-6 w-6 text-accent mb-4" />
              <h3 className="serif text-xl">{t("在线奉献", "Online Giving")}</h3>
              <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                {t("在线奉献通道正在筹备中，敬请期待。", "Our online giving portal is coming soon.")}
              </p>
              <p className="mt-4 text-xs uppercase tracking-widest text-accent">{t("即将上线", "Coming Soon")}</p>
            </div>

            <div className="border border-border bg-card p-6">
              <Building2 className="h-6 w-6 text-accent mb-4" />
              <h3 className="serif text-xl">{t("支票/银行转账", "Check / Bank Transfer")}</h3>
              <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                {t("如需以支票或银行转账方式奉献，请通过下方邮箱与我们联系，我们会发送详细信息。", "To give by check or bank transfer, please contact us by email and we will send full instructions.")}
              </p>
              <a href="mailto:INFO.BRIDGEAWAY@GMAIL.COM?subject=Donation%20Inquiry" className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline">
                <Mail className="h-4 w-4"/> INFO.BRIDGEAWAY@GMAIL.COM
              </a>
            </div>

            <div className="border border-border bg-card p-6">
              <Heart className="h-6 w-6 text-accent mb-4" />
              <h3 className="serif text-xl">{t("代祷支持", "Pray With Us")}</h3>
              <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                {t("我们最看重的支持，是您持续的代祷。愿主使用这事工,服事祂的众教会。", "The support we value most is your prayer. May the Lord use this ministry to serve His church.")}
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            {t(
              "* 我们正在申请美国 501(c)(3) 非营利身份；获得批准后,美国纳税人的奉献可享受税务抵扣。",
              "* We are in the process of applying for U.S. 501(c)(3) status; once approved, gifts from U.S. taxpayers will be tax-deductible."
            )}
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
