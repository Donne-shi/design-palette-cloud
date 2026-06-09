import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/events")({ component: () => (
  <div className="p-10"><p className="eyebrow mb-2">Admin</p><h1 className="serif text-4xl">Events</h1><p className="mt-4 text-muted-foreground">Event scheduling, registration, and capacity will live here.</p></div>
) });
