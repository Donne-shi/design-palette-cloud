import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Ornament } from "./Brand";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col paper-grain">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({ eyebrow, titleZh, titleEn, lead }: { eyebrow?: string; titleZh: string; titleEn?: string; lead?: string }) {
  // titleZh receives the t()-translated title and renders in the current language.
  // titleEn is kept for backward compatibility but no longer rendered.
  void titleEn;
  return (
    <section className="border-b border-border/70 bg-secondary/30">
      <div className="container-prose py-20 md:py-28">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="serif text-4xl md:text-6xl leading-[1.05] text-foreground max-w-3xl">{titleZh}</h1>
        <Ornament className="mt-8" />
        {lead && <p className="mt-6 max-w-2xl text-base md:text-lg text-foreground/80 leading-relaxed">{lead}</p>}
      </div>
    </section>
  );
}
