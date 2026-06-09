import { createFileRoute } from "@tanstack/react-router";
import { FileText, Calendar, BookOpen, Mail, Users, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const stats = [
  { label: "Articles", value: "0", icon: FileText, hint: "Demo data" },
  { label: "Events", value: "0", icon: Calendar, hint: "Demo data" },
  { label: "Journal Issues", value: "0", icon: BookOpen, hint: "Demo data" },
  { label: "Subscribers", value: "—", icon: Mail, hint: "Live (Cloud)" },
  { label: "Users", value: "1", icon: Users, hint: "Live (Cloud)" },
  { label: "Monthly visits", value: "1.2k", icon: TrendingUp, hint: "Connect analytics" },
];

function AdminDashboard() {
  return (
    <div className="p-10">
      <p className="eyebrow mb-2">Dashboard</p>
      <h1 className="serif text-4xl">Welcome back.</h1>
      <p className="text-muted-foreground mt-2">A quick look at the platform's vitals. CMS modules will be wired up next.</p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <p className="text-xs uppercase tracking-widest text-stone-warm">{s.label}</p>
              <s.icon className="h-4 w-4 text-accent" />
            </div>
            <p className="serif text-4xl mt-3">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-2">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 border border-border bg-card p-8">
        <p className="eyebrow mb-3">Next steps</p>
        <h2 className="serif text-2xl">Wiring up the CMS</h2>
        <ul className="mt-4 space-y-2 text-sm text-foreground/80 list-disc pl-5">
          <li>Articles, events, and journal-issues tables (with editor / author / reviewer roles)</li>
          <li>AI-assisted news aggregation + human review flow</li>
          <li>Scheduled publishing & comment moderation</li>
          <li>Event registration & subscriber broadcast (via Lovable AI Gateway)</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-6">All of this runs on Lovable Cloud — no extra accounts. Tell me which module to build next.</p>
      </div>
    </div>
  );
}
