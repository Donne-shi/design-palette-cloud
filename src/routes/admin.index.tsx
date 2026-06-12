import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, BookOpen, Mail, Users, ArrowRight, Inbox } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

type RecentArticle = { id: string; title_zh: string; status: string; created_at: string };
type UpcomingEvent = { id: string; title_zh: string; start_at: string; location: string | null };
type RecentMsg = { id: string; name: string; email: string; subject: string | null; created_at: string };

function AdminDashboard() {
  const [counts, setCounts] = useState({ articles: 0, events: 0, journal: 0, subs: 0, roles: 0, pubArticles: 0, newMsgs: 0 });
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [recentMsgs, setRecentMsgs] = useState<RecentMsg[]>([]);

  useEffect(() => {
    (async () => {
      const head = { count: "exact" as const, head: true };
      const [a, ap, e, j, s, u, mn, ra, ev, rm] = await Promise.all([
        supabase.from("articles").select("*", head),
        supabase.from("articles").select("*", head).eq("status", "published"),
        supabase.from("events").select("*", head),
        supabase.from("journal_issues").select("*", head),
        supabase.from("subscribers").select("*", head),
        supabase.from("user_roles").select("*", head),
        supabase.from("contact_messages").select("*", head).eq("status", "new"),
        supabase.from("articles").select("id,title_zh,status,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("events").select("id,title_zh,start_at,location").gte("start_at", new Date().toISOString()).order("start_at", { ascending: true }).limit(5),
        supabase.from("contact_messages").select("id,name,email,subject,created_at").eq("status", "new").order("created_at", { ascending: false }).limit(5),
      ]);
      setCounts({
        articles: a.count ?? 0,
        pubArticles: ap.count ?? 0,
        events: e.count ?? 0,
        journal: j.count ?? 0,
        subs: s.count ?? 0,
        roles: u.count ?? 0,
        newMsgs: mn.count ?? 0,
      });
      setRecentArticles((ra.data as RecentArticle[]) || []);
      setUpcoming((ev.data as UpcomingEvent[]) || []);
      setRecentMsgs((rm.data as RecentMsg[]) || []);
    })();
  }, []);

  const stats = [
    { label: "文章 Articles", value: counts.articles, hint: `${counts.pubArticles} 已发布`, icon: FileText, to: "/admin/articles" },
    { label: "活动 Events", value: counts.events, hint: "全部排程", icon: Calendar, to: "/admin/events" },
    { label: "期刊 Journal", value: counts.journal, hint: "所有期次", icon: BookOpen, to: "/admin/journal" },
    { label: "未读消息 Messages", value: counts.newMsgs, hint: "待处理", icon: Inbox, to: "/admin/messages" },
    { label: "订阅者 Subscribers", value: counts.subs, hint: "邮件列表", icon: Mail, to: "/admin/subscribers" },
    { label: "工作人员 Staff", value: counts.roles, hint: "已授角色", icon: Users, to: "/admin/users" },
  ];

  return (
    <div className="p-10">
      <p className="eyebrow mb-2">Dashboard</p>
      <h1 className="serif text-4xl">欢迎回来。</h1>
      <p className="text-muted-foreground mt-2">一目了然地了解平台的核心数据，并直接进入各模块。</p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="border border-border bg-card p-6 hover:border-accent transition-colors group">
            <div className="flex items-start justify-between">
              <p className="text-xs uppercase tracking-widest text-stone-warm">{s.label}</p>
              <s.icon className="h-4 w-4 text-accent" />
            </div>
            <p className="serif text-4xl mt-3">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 group-hover:text-accent">
              {s.hint} <ArrowRight className="h-3 w-3"/>
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-5">
        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">最新文章</p>
            <Link to="/admin/articles" className="text-xs text-accent hover:underline">查看全部</Link>
          </div>
          {recentArticles.length === 0 ? <p className="text-sm text-muted-foreground">暂无</p> : (
            <ul className="space-y-3">
              {recentArticles.map(a => (
                <li key={a.id} className="text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                  <p className="serif line-clamp-1">{a.title_zh}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className={a.status === "published" ? "text-accent" : ""}>{a.status === "published" ? "已发布" : "草稿"}</span>
                    {" · "}{new Date(a.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">即将到来的活动</p>
            <Link to="/admin/events" className="text-xs text-accent hover:underline">查看全部</Link>
          </div>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">暂无</p> : (
            <ul className="space-y-3">
              {upcoming.map(e => (
                <li key={e.id} className="text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                  <p className="serif line-clamp-1">{e.title_zh}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(e.start_at).toLocaleString()} · {e.location || "—"}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">未读联系消息</p>
            <Link to="/admin/messages" className="text-xs text-accent hover:underline">查看全部</Link>
          </div>
          {recentMsgs.length === 0 ? <p className="text-sm text-muted-foreground">无未读</p> : (
            <ul className="space-y-3">
              {recentMsgs.map(m => (
                <li key={m.id} className="text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                  <p className="serif line-clamp-1">{m.name} <span className="text-xs text-muted-foreground">— {m.subject || "（无主题）"}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{m.email} · {new Date(m.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-10 border border-border bg-card p-8">
        <p className="eyebrow mb-3">快捷操作</p>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/articles" className="text-sm px-4 py-2 bg-primary text-primary-foreground hover:bg-accent">+ 新文章</Link>
          <Link to="/admin/events" className="text-sm px-4 py-2 border border-border hover:border-accent">+ 新活动</Link>
          <Link to="/admin/journal" className="text-sm px-4 py-2 border border-border hover:border-accent">+ 新期刊</Link>
          <Link to="/admin/settings" className="text-sm px-4 py-2 border border-border hover:border-accent">站点设置</Link>
        </div>
      </div>
    </div>
  );
}
