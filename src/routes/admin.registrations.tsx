import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/registrations")({ component: AdminRegistrations });

type Ev = { id: string; title_zh: string; start_at: string; capacity: number | null };
type Reg = { id: string; status: string; name: string; email: string; note: string | null; created_at: string; user_id: string };

function AdminRegistrations() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("events").select("id,title_zh,start_at,capacity").order("start_at", { ascending: false });
      setEvents((data as Ev[]) || []);
      if (data && data.length) setSelected(data[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("event_registrations")
        .select("id,status,name,email,note,created_at,user_id")
        .eq("event_id", selected)
        .order("created_at", { ascending: true });
      if (error) toast.error(error.message);
      setRegs((data as Reg[]) || []);
      setLoading(false);
    })();
  }, [selected]);

  const confirm = async (r: Reg, next: string) => {
    const { error } = await supabase.from("event_registrations").update({ status: next }).eq("id", r.id);
    if (error) return toast.error(error.message);
    setRegs(regs.map(x => x.id === r.id ? { ...x, status: next } : x));
  };

  const remove = async (id: string) => {
    if (!confirm("删除该报名？")) return;
    const { error } = await supabase.from("event_registrations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRegs(regs.filter(r => r.id !== id));
  };

  const exportCsv = () => {
    const header = ["name", "email", "status", "note", "created_at"];
    const body = regs.map(r => [r.name, r.email, r.status, r.note ?? "", r.created_at].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ev = events.find(e => e.id === selected);
    a.href = url; a.download = `registrations-${ev?.title_zh || selected}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ev = events.find(e => e.id === selected);
  const confirmed = regs.filter(r => r.status === "confirmed").length;
  const waitlist = regs.filter(r => r.status === "waitlist").length;

  return (
    <div className="p-10">
      <p className="eyebrow mb-2">Admin</p>
      <h1 className="serif text-4xl">活动报名 · Registrations</h1>
      <p className="mt-2 text-muted-foreground">查看与管理每个活动的报名名单。</p>

      <div className="mt-6 flex items-end gap-3 flex-wrap">
        <label className="flex-1 min-w-[260px]">
          <span className="text-xs uppercase tracking-widest text-stone-warm">活动</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}
            className="mt-2 w-full bg-background border border-input px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent">
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title_zh} — {new Date(e.start_at).toLocaleDateString()}</option>
            ))}
          </select>
        </label>
        <Button variant="outline" disabled={regs.length===0} onClick={exportCsv} className="gap-2"><Download className="h-4 w-4"/>导出 CSV</Button>
      </div>

      {ev && (
        <p className="mt-4 text-sm text-muted-foreground">
          {confirmed} 已确认{ev.capacity ? ` / ${ev.capacity} 名额` : ""} · {waitlist} 候补
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Loading…</p>
      ) : regs.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">该活动暂无报名。</p>
      ) : (
        <div className="mt-8 border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
              <tr>
                <th className="p-4">姓名</th>
                <th className="p-4">Email</th>
                <th className="p-4">状态</th>
                <th className="p-4">备注</th>
                <th className="p-4">时间</th>
                <th className="p-4 w-40">操作</th>
              </tr>
            </thead>
            <tbody>
              {regs.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-4 serif">{r.name}</td>
                  <td className="p-4">{r.email}</td>
                  <td className="p-4">
                    <span className={`text-xs uppercase tracking-widest ${r.status==='confirmed'?'text-accent':'text-stone-warm'}`}>{r.status}</span>
                  </td>
                  <td className="p-4 text-muted-foreground italic">{r.note || "—"}</td>
                  <td className="p-4 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {r.status !== "confirmed" && <Button size="sm" variant="outline" onClick={() => confirm(r, "confirmed")}>确认</Button>}
                      {r.status !== "waitlist" && <Button size="sm" variant="ghost" onClick={() => confirm(r, "waitlist")}>候补</Button>}
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
