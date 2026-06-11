import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events")({ component: EventsAdmin });

type Ev = {
  id: string; title_zh: string; title_en: string | null;
  description_zh: string | null; description_en: string | null;
  location: string | null; start_at: string; end_at: string | null;
  capacity: number | null; cover_url: string | null; status: string;
};
const empty: Partial<Ev> = { title_zh: "", title_en: "", description_zh: "", description_en: "", location: "", start_at: "", end_at: "", status: "draft" };

function EventsAdmin() {
  const [rows, setRows] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Ev> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("events").select("*").order("start_at", { ascending: false });
    if (error) toast.error(error.message); else setRows((data as Ev[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title_zh || !editing?.start_at) { toast.error("标题与开始时间必填"); return; }
    setSaving(true);
    const payload: any = { ...editing };
    if (!payload.end_at) payload.end_at = null;
    if (payload.capacity === "" || payload.capacity == null) payload.capacity = null;
    const { error } = editing.id
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("已保存"); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除？")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("已删除"); load(); }
  };

  const toLocal = (iso: string | null | undefined) => iso ? new Date(iso).toISOString().slice(0, 16) : "";

  return (
    <div className="p-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="serif text-4xl">活动管理 · Events</h1>
          <p className="text-muted-foreground mt-2 text-sm">论坛、对话、讲座的排程与发布。</p>
        </div>
        <Button onClick={() => setEditing(empty)} className="gap-2"><Plus className="h-4 w-4"/>新建活动</Button>
      </div>

      <div className="mt-8 border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-stone-warm border-b border-border">
            <tr><th className="p-4">标题</th><th className="p-4">时间</th><th className="p-4">地点</th><th className="p-4">状态</th><th className="p-4 w-32">操作</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">加载中…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">暂无活动。</td></tr>}
            {rows.map(e => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="p-4"><p className="serif">{e.title_zh}</p>{e.title_en && <p className="text-xs text-muted-foreground mt-1">{e.title_en}</p>}</td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(e.start_at).toLocaleString()}</td>
                <td className="p-4 text-muted-foreground text-xs">{e.location || "—"}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${e.status === "published" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>{e.status === "published" ? "已发布" : "草稿"}</span></td>
                <td className="p-4"><div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(e)}><Pencil className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="serif text-2xl">{editing?.id ? "编辑活动" : "新建活动"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>中文标题 *</Label><Input value={editing.title_zh || ""} onChange={(e) => setEditing({ ...editing, title_zh: e.target.value })}/></div>
                <div><Label>English Title</Label><Input value={editing.title_en || ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>开始时间 *</Label><Input type="datetime-local" value={toLocal(editing.start_at)} onChange={(ev) => setEditing({ ...editing, start_at: new Date(ev.target.value).toISOString() })}/></div>
                <div><Label>结束时间</Label><Input type="datetime-local" value={toLocal(editing.end_at)} onChange={(ev) => setEditing({ ...editing, end_at: ev.target.value ? new Date(ev.target.value).toISOString() : null })}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>地点 Location</Label><Input value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })}/></div>
                <div><Label>容量 Capacity</Label><Input type="number" value={editing.capacity ?? ""} onChange={(e) => setEditing({ ...editing, capacity: e.target.value ? parseInt(e.target.value) : null })}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>中文简介</Label><Textarea rows={4} value={editing.description_zh || ""} onChange={(e) => setEditing({ ...editing, description_zh: e.target.value })}/></div>
                <div><Label>English Description</Label><Textarea rows={4} value={editing.description_en || ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })}/></div>
              </div>
              <div><Label>封面图 URL</Label><Input value={editing.cover_url || ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })}/></div>
              <div>
                <Label>状态</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="draft">草稿</SelectItem><SelectItem value="published">已发布</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>取消</Button>
            <Button onClick={save} disabled={saving}>{saving ? "保存中…" : "保存"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
