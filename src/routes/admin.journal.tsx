import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/journal")({ component: () => (
  <div className="p-10"><p className="eyebrow mb-2">Admin</p><h1 className="serif text-4xl">Journal</h1><p className="mt-4 text-muted-foreground">Issue management, table of contents, and PDF uploads will live here.</p></div>
) });
