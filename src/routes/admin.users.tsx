import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/users")({ component: () => (
  <div className="p-10">
    <p className="eyebrow mb-2">Admin</p>
    <h1 className="serif text-4xl">Users & Roles</h1>
    <p className="mt-4 text-muted-foreground max-w-xl">Manage who can edit, write, review, or administer. Roles live in a separate <code>user_roles</code> table — no privilege escalation through profile edits.</p>
    <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl">
      {["admin","editor","author","reviewer"].map(r => (
        <div key={r} className="border border-border bg-card p-5">
          <p className="serif text-xl capitalize">{r}</p>
          <p className="text-xs text-stone-warm uppercase tracking-widest mt-1">Role</p>
        </div>
      ))}
    </div>
  </div>
) });
