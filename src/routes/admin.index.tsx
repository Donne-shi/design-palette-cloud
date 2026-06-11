import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, BookOpen, Mail, Users, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const [counts, setCounts] = useState({ articles: 0, events: 0, journal: 0, subs: 0, roles: 0, pubArticles: 0 });

  useEffect(() => {
    (async () => {
      const head = { count: "exact" as const, head: true };
      const [a, ap, e, j, s, u] = await Promise.all([
        supabase.from("articles").select("*", head),
        supabase.from("articles").select("*", head).eq("status", "published"),
        supabase.from("events").select("*", head),
        supabase.from("journal_issues").select("*", head),
        supabase.from("subscribers").select("*", head),
        supabase.from("user_roles").select("*", head),
      ]);
      setCounts({
        articles: a.count ?? 0,
        pubArticles: ap.count ?? 0,
        events: e.count ?? 0,
        journal: j.count ?? 0,
        subs: s.count ?? 0,
        roles: u.count ?? 0,
      });
    })();
  }, []);

  const stats = [
    { label: "文章总数 Articles", value: counts.articles, hint: `${counts.pubArticles} 已发布`, icon: FileText, to: "/admin/articles" },
    { label: "活动 Events", value: counts.events, hint: "全部排程", icon: Calendar, to: "/admin/events" },
    { label: "期刊 Journal", value: counts.journal, hint: "所有期次", icon: BookOpen, to: "/admin/journal" },
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

      <div className="mt-14 grid md:grid-cols-2 gap-5">
        <div className="border border-border bg-card p-8">
          <p className="eyebrow mb-3">快捷操作</p>
          <h2 className="serif text-2xl">开始创作</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/admin/articles" className="text-sm px-4 py-2 bg-primary text-primary-foreground hover:bg-accent">+ 新文章</Link>
            <Link to="/admin/events" className="text-sm px-4 py-2 border border-border hover:border-accent">+ 新活动</Link>
            <Link to="/admin/journal" className="text-sm px-4 py-2 border border-border hover:border-accent">+ 新期刊</Link>
          </div>
        </div>
        <div className="border border-border bg-card p-8">
          <p className="eyebrow mb-3">系统提示</p>
          <ul className="mt-2 space-y-2 text-sm text-foreground/80 list-disc pl-5">
            <li>所有内容支持中英双语字段，前台会根据语言自动切换。</li>
            <li>仅状态为「已发布」的内容会显示在公开页面。</li>
            <li>角色与权限存储于独立 <code className="text-xs">user_roles</code> 表，防止越权。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
