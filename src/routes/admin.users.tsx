import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersAdmin });

type Row = { id: string; user_id: string; role: string; created_at: string };
const ROLES = ["admin", "editor", "author", "reviewer"];

function UsersAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [newId, setNewId] = useState("");
  const [newRole, setNewRole] = useState("editor");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows((data as Row[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const grant = async () => {
    if (!newId.trim()) { toast.error("请填写 User ID"); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: newId.trim(), role: newRole as any });
    if (error) toast.error(error.message); else { toast.success("已授予"); setNewId(""); load(); }
  };

  const revoke = async (id: string) => {
    if (!confirm("撤销此角色？")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("已撤销"); load(); }
  };

  return (
    <div className="p-10">
      <p className="eyebrow mb-2">Admin</p>
      <h1 className="serif text-4xl">用户与角色 · Users & Roles</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl text-sm">
        角色存储在独立的 <code className="text-xs bg-muted px-1.5 py-0.5">user_roles</code> 表中，避免通过 profile 提权。让用户先在 <code className="text-xs bg-muted px-1.5 py-0.5">/auth</code> 注册，再把他们的 User ID 填到下方授予权限。
      </p>

      <div className="mt-8 border border-border bg-card p-6 max-w-3xl">
        <p className="eyebrow mb-3">授予角色</p>
        <div className="grid grid-cols-[1fr,180px,auto] gap-3">
          <input
            className="border border-input bg-background px-3 py-2 text-sm font-mono"
            placeholder="User ID (UUID)"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
          />
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={grant} className="gap-2"><Shield className="h-4 w-4"/>授予</Button>
        </div>
      </div>

      <div className="mt-8 border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
            <tr><th className="p-4">User ID</th><th className="p-4">角色</th><th className="p-4">授予时间</th><th className="p-4 w-24">操作</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">加载中…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">暂无授权记录。</td></tr>}
            {rows.map(r => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-4 font-mono text-xs">{r.user_id}</td>
                <td className="p-4"><span className="text-xs px-2 py-1 rounded bg-accent/15 text-accent uppercase tracking-widest">{r.role}</span></td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-4"><Button size="icon" variant="ghost" onClick={() => revoke(r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl">
        {ROLES.map(r => (
          <div key={r} className="border border-border bg-card p-5">
            <p className="serif text-xl capitalize">{r}</p>
            <p className="text-xs text-stone-warm uppercase tracking-widest mt-1">Role</p>
          </div>
        ))}
      </div>
    </div>
  );
}
