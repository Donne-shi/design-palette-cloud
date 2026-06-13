import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, FileText, Calendar, BookOpen, Users, Mail, LogOut, Inbox, Settings, MessageSquare, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · MBI" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLayout,
});

const sidebar = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/articles", label: "Articles", icon: FileText },
  { to: "/admin/comments", label: "Comments", icon: MessageSquare },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { to: "/admin/journal", label: "Journal", icon: BookOpen },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate({ to: "/auth" });
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setChecking(false);
      if (!data.session) navigate({ to: "/auth" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); };

  if (checking || !user) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col">
        <div className="p-6 border-b border-primary-foreground/10">
          <Link to="/" className="serif text-xl">MBI</Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50 mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebar.map((s) => {
            const active = s.exact ? pathname === s.to : pathname.startsWith(s.to) && s.to !== "/admin";
            return (
              <Link key={s.to} to={s.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors ${active ? "bg-accent text-accent-foreground" : "text-primary-foreground/80 hover:bg-primary-foreground/5"}`}>
                <s.icon className="h-4 w-4" /> {s.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-primary-foreground/10">
          <div className="px-3 py-2 text-xs text-primary-foreground/60 truncate">{user.email}</div>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/80 hover:text-accent">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-background"><Outlet /></main>
    </div>
  );
}
