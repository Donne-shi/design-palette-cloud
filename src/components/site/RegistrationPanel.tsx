import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2, X, CheckCircle2, Hourglass } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type Reg = { id: string; status: string; name: string; email: string; note: string | null; created_at: string };

export function RegistrationPanel({ eventId, capacity }: { eventId: string; capacity: number | null }) {
  const { t } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [mine, setMine] = useState<Reg | null>(null);
  const [confirmed, setConfirmed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const load = async (u: User | null) => {
    setLoading(true);
    const counts = await supabase
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "confirmed");
    setConfirmed(counts.count ?? 0);
    if (u) {
      const { data } = await supabase
        .from("event_registrations")
        .select("id,status,name,email,note,created_at")
        .eq("event_id", eventId)
        .eq("user_id", u.id)
        .maybeSingle();
      setMine((data as Reg) || null);
      if (!data) {
        setEmail(u.email || "");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      load(u);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const u = s?.user ?? null;
      setUser(u);
      load(u);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      user_id: user.id,
      name: name.trim(),
      email: email.trim(),
      note: note.trim() || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(t("报名已提交", "Registration submitted"));
    load(user);
  };

  const cancel = async () => {
    if (!mine || !confirm(t("取消你的报名？", "Cancel your registration?"))) return;
    const { error } = await supabase.from("event_registrations").delete().eq("id", mine.id);
    if (error) return toast.error(error.message);
    toast.success(t("已取消", "Cancelled"));
    setMine(null);
    load(user);
  };

  const seatsLeft = capacity ? Math.max(0, capacity - confirmed) : null;
  const isFull = capacity !== null && confirmed >= capacity;

  return (
    <aside className="border border-border bg-card p-6 sticky top-24">
      <p className="eyebrow mb-3">{t("活动报名", "Registration")}</p>
      {capacity ? (
        <p className="text-sm text-foreground/80 mb-4">
          {confirmed} / {capacity} {t("已报名", "registered")}
          {seatsLeft !== null && seatsLeft > 0 && <span className="text-accent"> · {seatsLeft} {t("个名额", "seats left")}</span>}
          {isFull && <span className="text-stone-warm"> · {t("名额已满，可加入候补", "full — waitlist open")}</span>}
        </p>
      ) : (
        <p className="text-sm text-foreground/80 mb-4">{confirmed} {t("人已报名", "registered")}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !user ? (
        <>
          <p className="text-sm text-muted-foreground mb-3">{t("请先登录后再报名。", "Sign in to register.")}</p>
          <Link
            to="/auth"
            search={{ next: typeof window !== "undefined" ? window.location.pathname : "/" }}
            className="inline-block w-full text-center bg-accent text-accent-foreground px-5 py-2.5 text-sm uppercase tracking-widest"
          >
            {t("登录 / 注册", "Sign in")}
          </Link>
        </>
      ) : mine ? (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 text-sm ${mine.status === "confirmed" ? "text-accent" : "text-stone-warm"}`}>
            {mine.status === "confirmed" ? <CheckCircle2 className="h-4 w-4"/> : <Hourglass className="h-4 w-4"/>}
            <span>
              {mine.status === "confirmed" && t("报名成功", "Registered")}
              {mine.status === "waitlist" && t("已加入候补名单", "On the waitlist")}
              {mine.status === "cancelled" && t("已取消", "Cancelled")}
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{mine.name}</p>
            <p>{mine.email}</p>
            {mine.note && <p className="italic">"{mine.note}"</p>}
          </div>
          {mine.status !== "cancelled" && (
            <button onClick={cancel} className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-stone-warm hover:text-destructive">
              <X className="h-3 w-3"/> {t("取消报名", "Cancel")}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={register} className="space-y-3">
          <input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("姓名", "Name")} className="w-full bg-background border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"/>
          <input required type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-background border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"/>
          <textarea maxLength={2000} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("备注（可选）", "Note (optional)")} className="w-full bg-background border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"/>
          <button disabled={submitting} className="w-full bg-accent text-accent-foreground py-2.5 text-sm uppercase tracking-widest disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin"/>}
            {isFull ? t("加入候补", "Join waitlist") : t("立即报名", "Register")}
          </button>
        </form>
      )}
    </aside>
  );
}
