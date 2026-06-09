import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/articles")({ component: () => <Placeholder title="Articles" /> });

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-10">
      <p className="eyebrow mb-2">Admin</p>
      <h1 className="serif text-4xl">{title}</h1>
      <p className="mt-4 text-muted-foreground">CMS module placeholder. Ask Lovable to wire up the table, editor, and publishing workflow.</p>
    </div>
  );
}
