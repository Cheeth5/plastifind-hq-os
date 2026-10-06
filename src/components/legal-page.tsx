import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export type LegalSection = { title: string; body: string[] };

export function LegalPage({
  kicker,
  title,
  updated,
  intro,
  sections,
}: {
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="atmosphere min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/"><Logo /></Link>
        <Link to="/auth" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </Link>
      </header>
      <main className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-10 lg:grid-cols-[1fr_2fr]">
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <p className="eyebrow">{kicker}</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">{title}</h1>
          <div className="mt-6 h-1.5 w-16 rounded-full bg-accent-lime" />
          <p className="mt-6 font-mono text-xs text-muted-foreground">Dernière mise à jour : {updated}</p>
          <nav className="mt-8 hidden space-y-2 lg:block">
            {sections.map((s, i) => (
              <a key={s.title} href={`#s${i}`} className="block text-sm text-muted-foreground hover:text-primary">
                <span className="mr-2 font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </a>
            ))}
          </nav>
        </aside>
        <article className="space-y-10">
          <p className="text-lg leading-relaxed">{intro}</p>
          {sections.map((s, i) => (
            <section key={s.title} id={`s${i}`} className="panel scroll-mt-10 p-6 sm:p-8">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm font-bold text-secondary-accent">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="font-display text-xl font-bold">{s.title}</h2>
              </div>
              <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
                {s.body.map((p, j) => <p key={j}>{p}</p>)}
              </div>
            </section>
          ))}
          <p className="text-sm text-muted-foreground">
            Questions ? Contactez-nous : <a className="text-primary underline" href="mailto:cheithchouk@gmail.com">cheithchouk@gmail.com</a>
          </p>
        </article>
      </main>
    </div>
  );
}
