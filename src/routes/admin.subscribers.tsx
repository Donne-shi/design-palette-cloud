import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/subscribers")({ component: Subs });

type Sub = { id: string; email: string; language: string; created_at: string };

function Subs() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("subscribers").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) setErr(error.message);
      else setRows(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-10">
      <p className="eyebrow mb-2">Admin</p>
      <h1 className="serif text-4xl">Subscribers</h1>
      <p className="mt-2 text-muted-foreground">Newsletter sign-ups. Visible to admins and editors only.</p>

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
              <tr><th className="p-4">Email</th><th className="p-4">Language</th><th className="p-4">Date</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No subscribers yet.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-4 serif">{r.email}</td>
                  <td className="p-4 uppercase text-xs tracking-widest text-stone-warm">{r.language}</td>
                  <td className="p-4 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
