import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/subscribers")({ component: Subs });

type Sub = { id: string; email: string; language: string; created_at: string };

function Subs() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message); else { setRows(data || []); setErr(null); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const exportCsv = () => {
    const header = ["email", "language", "created_at"];
    const body = rows.map(r => [r.email, r.language, r.created_at].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `subscribers-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (id: string) => {
    if (!confirm("确定取消订阅？")) return;
    const { error } = await supabase.from("subscribers").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("已删除"); load(); }
  };

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="serif text-4xl">Subscribers</h1>
          <p className="mt-2 text-muted-foreground">Newsletter sign-ups. Visible to admins and editors only.</p>
        </div>
        <Button onClick={exportCsv} variant="outline" className="gap-2" disabled={rows.length === 0}>
          <Download className="h-4 w-4"/>导出 CSV
        </Button>
      </div>

      {loading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
      {err && (
        <div className="mt-8 border border-destructive/40 bg-destructive/5 text-destructive p-4 text-sm">
          {err}. If this says permission denied, ask the super-admin to grant you the editor or admin role.
        </div>
      )}
      {!loading && !err && (
        <div className="mt-8 border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
              <tr><th className="p-4">Email</th><th className="p-4">Language</th><th className="p-4">Date</th><th className="p-4 w-20">操作</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No subscribers yet.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-4 serif">{r.email}</td>
                  <td className="p-4 uppercase text-xs tracking-widest text-stone-warm">{r.language}</td>
                  <td className="p-4 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-4"><Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
