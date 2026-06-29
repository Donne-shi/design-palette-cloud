import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send, Trash2, Plus, Clock } from "lucide-react";
import {
  getNewsletterStatus,
  ensureNewsletterAudience,
  syncSubscribersToResend,
  createBroadcast,
  sendBroadcast,
  listBroadcasts,
  deleteBroadcast,
} from "@/lib/resend.functions";

export const Route = createFileRoute("/admin/newsletter")({
  head: () => ({ meta: [{ title: "Newsletter · Admin — MBI" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: NewsletterPage,
});

type Status = {
  audienceId: string | null;
  audience: any;
  contactsCount: number | null;
  subscriberCount?: number;
  error?: string;
};

function NewsletterPage() {
  const getStatus = useServerFn(getNewsletterStatus);
  const ensureAud = useServerFn(ensureNewsletterAudience);
  const syncSubs = useServerFn(syncSubscribersToResend);
  const create = useServerFn(createBroadcast);
  const send = useServerFn(sendBroadcast);
  const list = useServerFn(listBroadcasts);
  const del = useServerFn(deleteBroadcast);

  const [status, setStatus] = useState<Status | null>(null);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [body, setBody] = useState("");
  const [schedule, setSchedule] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([getStatus(), list()]);
      setStatus(s as Status);
      setBroadcasts(l.broadcasts || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const doSync = async () => {
    setBusy("sync");
    try {
      const r = await syncSubs();
      toast.success(`已同步：新增 ${r.added}，已存在 ${r.skipped}，失败 ${r.failed}`);
      refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const doEnsure = async () => {
    setBusy("ensure");
    try { await ensureAud(); toast.success("Audience 已创建/已就绪"); refresh(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const htmlBody = useMemo(() => {
    // Minimal markdown-ish: paragraphs from blank lines, **bold**, *italic*, links.
    const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
    return body
      .split(/\n{2,}/)
      .map((para) => {
        let p = esc(para.trim());
        p = p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        p = p.replace(/\*(.+?)\*/g, "<em>$1</em>");
        p = p.replace(/\[(.+?)\]\((https?:[^)]+)\)/g, '<a href="$2" style="color:#8a7a5c;">$1</a>');
        p = p.replace(/\n/g, "<br/>");
        return `<p style="margin:0 0 18px 0;">${p}</p>`;
      })
      .join("\n");
  }, [body]);

  const doCreateAndSend = async (immediate: boolean) => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject 与正文不能为空");
      return;
    }
    setBusy("create");
    try {
      const r = await create({ data: { subject, html: htmlBody, preview } });
      if (immediate || schedule) {
        await send({ data: { id: r.id, scheduledAt: immediate ? undefined : new Date(schedule).toISOString() } });
        toast.success(immediate ? "已发送" : "已排程");
      } else {
        toast.success("Broadcast 已创建（草稿）");
      }
      setSubject(""); setPreview(""); setBody(""); setSchedule("");
      refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const doSendExisting = async (id: string) => {
    if (!confirm("立即发送这封 broadcast？")) return;
    setBusy(id);
    try { await send({ data: { id } }); toast.success("已发送"); refresh(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const doDelete = async (id: string) => {
    if (!confirm("删除这封 broadcast？")) return;
    setBusy(id);
    try { await del({ data: { id } }); toast.success("已删除"); refresh(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  return (
    <div className="p-10 space-y-10">
      <div>
        <p className="eyebrow mb-2">Admin</p>
        <h1 className="serif text-4xl">Newsletter</h1>
        <p className="mt-2 text-muted-foreground">通过 Resend Broadcasts 发送给所有订阅者。</p>
      </div>

      {/* Status */}
      <section className="border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="serif text-xl">Audience</h2>
            {loading ? (
              <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
            ) : status?.audienceId ? (
              <div className="mt-3 text-sm space-y-1">
                <div><span className="text-stone-warm uppercase tracking-widest text-xs mr-2">ID</span><code className="text-xs">{status.audienceId}</code></div>
                <div><span className="text-stone-warm uppercase tracking-widest text-xs mr-2">Name</span>{status.audience?.name ?? "—"}</div>
                <div className="flex gap-6">
                  <div><span className="text-stone-warm uppercase tracking-widest text-xs mr-2">Resend 联系人</span>{status.contactsCount ?? "—"}</div>
                  <div><span className="text-stone-warm uppercase tracking-widest text-xs mr-2">本地订阅者</span>{status.subscriberCount ?? 0}</div>
                </div>
                {status.error && <p className="text-destructive">{status.error}</p>}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">尚未创建 audience。</p>
            )}
          </div>
          <div className="flex gap-2">
            {!status?.audienceId && (
              <Button onClick={doEnsure} disabled={busy === "ensure"} variant="outline" className="gap-2">
                <Plus className="h-4 w-4"/>创建 Audience
              </Button>
            )}
            <Button onClick={doSync} disabled={busy === "sync"} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${busy === "sync" ? "animate-spin" : ""}`}/>同步订阅者
            </Button>
          </div>
        </div>
      </section>

      {/* Composer */}
      <section className="border border-border bg-card p-6 space-y-4">
        <h2 className="serif text-xl">新建 Broadcast</h2>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-stone-warm">Subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200}
            className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent"/>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-stone-warm">Preview text（收件箱预览，可选）</span>
          <input value={preview} onChange={(e) => setPreview(e.target.value)} maxLength={200}
            className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent"/>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-stone-warm">正文（支持空行分段、**粗体**、*斜体*、[文字](链接)）</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12}
            className="mt-2 w-full bg-background border border-input px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"/>
        </label>
        <details className="text-sm">
          <summary className="cursor-pointer text-stone-warm uppercase tracking-widest text-xs">HTML 预览</summary>
          <div className="mt-3 border border-border p-4 bg-background" dangerouslySetInnerHTML={{ __html: htmlBody }} />
        </details>
        <div className="flex flex-wrap items-end gap-3 pt-2">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-stone-warm flex items-center gap-1"><Clock className="h-3 w-3"/>定时（可选）</span>
            <input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)}
              className="mt-2 bg-background border border-input px-3 py-2 text-sm"/>
          </label>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => doCreateAndSend(false)} disabled={busy === "create"}>保存草稿{schedule && "/排程"}</Button>
            <Button onClick={() => doCreateAndSend(true)} disabled={busy === "create"} className="gap-2">
              <Send className="h-4 w-4"/>立即发送
            </Button>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="border border-border bg-card">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="serif text-xl">历史 Broadcasts</h2>
          <Button variant="ghost" size="sm" onClick={refresh} className="gap-2">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}/>刷新
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
            <tr><th className="p-4">Subject</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4 w-32 text-right">操作</th></tr>
          </thead>
          <tbody>
            {broadcasts.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">暂无 broadcast。</td></tr>
            )}
            {broadcasts.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0">
                <td className="p-4 serif">{b.subject || "—"}</td>
                <td className="p-4 uppercase text-xs tracking-widest text-stone-warm">{b.status}</td>
                <td className="p-4 text-muted-foreground">{b.created_at ? new Date(b.created_at).toLocaleString() : "—"}</td>
                <td className="p-4 text-right space-x-1">
                  {b.status === "draft" && (
                    <Button size="sm" variant="outline" onClick={() => doSendExisting(b.id)} disabled={busy === b.id} className="gap-1">
                      <Send className="h-3 w-3"/>发送
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => doDelete(b.id)} disabled={busy === b.id}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
