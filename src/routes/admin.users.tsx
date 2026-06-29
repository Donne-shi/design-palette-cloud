import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Shield, Mail } from "lucide-react";
import { toast } from "sonner";
import { listUsersWithRoles, grantRoleByEmail } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/admin/users")({ component: UsersAdmin });

type Row = { id: string; user_id: string; role: string; created_at: string; email: string | null };
const ROLES = ["admin", "editor", "author", "reviewer"];

function UsersAdmin() {
  const list = useServerFn(listUsersWithRoles);
  const grant = useServerFn(grantRoleByEmail);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await list();
      setRows(data as Row[]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const onGrant = async () => {
    if (!email.trim()) { toast.error("请填写邮箱"); return; }
    setBusy(true);
    try {
      await grant({ data: { email, role: role as any } });
      toast.success(`已授予 ${email} → ${role}`);
      setEmail("");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
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
        输入对方注册的邮箱即可授权。对方需先在 <code className="text-xs bg-muted px-1.5 py-0.5">/auth</code> 注册账号。
      </p>

      <div className="mt-8 border border-border bg-card p-6 max-w-3xl">
        <p className="eyebrow mb-3">通过邮箱授予角色</p>
        <div className="grid grid-cols-[1fr,180px,auto] gap-3">
          <input
            className="border border-input bg-background px-3 py-2 text-sm"
            placeholder="user@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={onGrant} disabled={busy} className="gap-2">
            <Shield className="h-4 w-4"/>{busy ? "授予中…" : "授予"}
          </Button>
        </div>
      </div>

      <div className="mt-8 border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
            <tr>
              <th className="p-4">邮箱</th>
              <th className="p-4">User ID</th>
              <th className="p-4">角色</th>
              <th className="p-4">授予时间</th>
              <th className="p-4 w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">加载中…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">暂无授权记录。</td></tr>}
            {rows.map(r => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  {r.email ? (
                    <span className="inline-flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-stone-warm"/>{r.email}</span>
                  ) : <span className="text-muted-foreground italic text-xs">用户已删除</span>}
                </td>
                <td className="p-4 font-mono text-[11px] text-muted-foreground">{r.user_id}</td>
                <td className="p-4"><span className="text-xs px-2 py-1 rounded bg-accent/15 text-accent uppercase tracking-widest">{r.role}</span></td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-4"><Button size="icon" variant="ghost" onClick={() => revoke(r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
