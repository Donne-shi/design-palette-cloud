import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LangProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="serif text-4xl text-foreground">页面未找到 · Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center bg-accent text-accent-foreground px-4 py-2 text-sm tracking-wider uppercase">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="serif text-2xl text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again, or return home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="bg-accent text-accent-foreground px-4 py-2 text-sm tracking-wider uppercase">Try again</button>
          <a href="/" className="border border-input px-4 py-2 text-sm tracking-wider uppercase">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Multicultural Bridge Initiative" },
      { name: "description", content: "A platform for Gospel-centered, cross-cultural dialogue and public engagement." },
      { name: "author", content: "Multicultural Bridge Initiative" },
      { property: "og:site_name", content: "Multicultural Bridge Initiative" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Multicultural Bridge Initiative" },
      { name: "twitter:title", content: "Multicultural Bridge Initiative" },
      { property: "og:description", content: "A platform for Gospel-centered, cross-cultural dialogue and public engagement." },
      { name: "twitter:description", content: "A platform for Gospel-centered, cross-cultural dialogue and public engagement." },
      { property: "og:image", content: "https://bridgeaway.org/__l5e/assets-v1/62b34776-53ed-4ff0-9d36-54ec88612a7f/mbi-logo.png" },
      { name: "twitter:image", content: "https://bridgeaway.org/__l5e/assets-v1/62b34776-53ed-4ff0-9d36-54ec88612a7f/mbi-logo.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/__l5e/assets-v1/62b34776-53ed-4ff0-9d36-54ec88612a7f/mbi-logo.png" },
      { rel: "apple-touch-icon", href: "/__l5e/assets-v1/62b34776-53ed-4ff0-9d36-54ec88612a7f/mbi-logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Multicultural Bridge Initiative",
        alternateName: "多元文化桥梁计划",
        description: "Gospel-centered cross-cultural dialogue, theological reflection, and public engagement.",
      }),
    }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <Outlet />
        <Toaster />
      </LangProvider>
    </QueryClientProvider>
  );
}
