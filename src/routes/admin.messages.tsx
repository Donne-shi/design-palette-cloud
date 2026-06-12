import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Mail, Archive, CheckCircle2, Reply } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/messages")({ component: MessagesAdmin });

type Msg = {
  id: string; name: string; email: string;
  subject: string | null; message: string;
  status: string; admin_notes: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  new: { text: "未读", cls: "bg-accent/15 text-accent" },
  read: { text: "已读", cls: "bg-muted text-muted-foreground" },
  replied: { text: "已回复", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  archived: { text: "已归档", cls: "bg-muted text-muted-foreground" },
};

function MessagesAdmin() {
  const [rows, setRows] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<Msg | null>(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) toast.error(error.message); else setRows((data as Msg[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const openMsg = async (m: Msg) => {
    setOpen(m); setNotes(m.admin_notes || "");
    if (m.status === "new") {
      await supabase.from("contact_messages").update({ status: "read" }).eq("id", m.id);
      load();
    }
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status, admin_notes: notes || null }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("已更新"); setOpen(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除该条消息？")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("已删除"); setOpen(null); load(); }
  };

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="serif text-4xl">联系消息 · Messages</h1>
          <p className="text-muted-foreground mt-2 text-sm">来自联系表单的全部留言与咨询。</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="new">未读</SelectItem>
            <SelectItem value="read">已读</SelectItem>
            <SelectItem value="replied">已回复</SelectItem>
            <SelectItem value="archived">已归档</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
            <tr><th className="p-4">状态</th><th className="p-4">姓名 / 邮箱</th><th className="p-4">主题</th><th className="p-4">日期</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">加载中…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">暂无消息。</td></tr>}
            {rows.map(m => {
              const s = STATUS_LABEL[m.status] || STATUS_LABEL.new;
              return (
                <tr key={m.id} className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/40" onClick={() => openMsg(m)}>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${s.cls}`}>{s.text}</span></td>
                  <td className="p-4">
                    <p className={m.status === "new" ? "serif font-semibold" : "serif"}>{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </td>
                  <td className="p-4 text-sm">{m.subject || <span className="text-muted-foreground">（无主题）</span>}</td>
                  <td className="p-4 text-muted-foreground text-xs">{new Date(m.created_at).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="serif text-2xl flex items-center gap-2"><Mail className="h-5 w-5"/>{open?.subject || "（无主题）"}</DialogTitle></DialogHeader>
          {open && (
            <div className="space-y-4">
              <div className="text-sm border border-border bg-muted/30 p-4">
                <p><span className="text-stone-warm">From:</span> <span className="serif">{open.name}</span> &lt;{open.email}&gt;</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(open.created_at).toLocaleString()}</p>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed border border-border p-4 bg-card">{open.message}</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-warm mb-2">内部备注</p>
                <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="仅团队可见的备注…"/>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" asChild>
                  <a href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject || "")}`}><Reply className="h-4 w-4"/>邮件回复</a>
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setStatus(open.id, "replied")}><CheckCircle2 className="h-4 w-4"/>标记已回复</Button>
                <Button variant="outline" className="gap-2" onClick={() => setStatus(open.id, "archived")}><Archive className="h-4 w-4"/>归档</Button>
              </div>
            </div>
          )}
          <DialogFooter>
            {open && <Button variant="ghost" onClick={() => remove(open.id)} className="text-destructive gap-2"><Trash2 className="h-4 w-4"/>删除</Button>}
            <Button variant="outline" onClick={() => setOpen(null)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
