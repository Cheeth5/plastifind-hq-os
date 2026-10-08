import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

export const PUBLIC_LEGAL_LINKS = [
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Confidentialité" },
  { to: "/terms", label: "Conditions d'utilisation" },
  { to: "/cookies", label: "Cookies" },
  { to: "/legal-notice", label: "Mentions légales" },
] as const;

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/auth"
            className="flex items-center gap-2"
            aria-label="PlastiFind OS — connexion"
          >
            <Logo />
          </Link>
          <nav
            aria-label="Pages publiques"
            className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex"
          >
            <Link to="/about" className="transition-colors hover:text-foreground">
              À propos
            </Link>
            <Link to="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Se connecter
            </Link>
          </nav>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground sm:hidden"
          >
            Se connecter
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Logo compact />
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
              PlastiFind OS — espace interne de pilotage produit, ingénierie, financement et
              opérations de PlastiFind, robotique environnementale.
            </p>
          </div>
          <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {PUBLIC_LEGAL_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PlastiFind. Tous droits réservés. Informations société en
            cours d'immatriculation — voir mentions légales.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function LegalHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="panel mt-6 p-5 sm:p-6">
      <h2 id={id} className="text-base font-bold tracking-tight">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function Placeholder({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[13px] text-foreground">
      <strong className="font-semibold">À compléter — {label}.</strong>
      {children ? <span className="text-muted-foreground"> {children}</span> : null}
    </p>
  );
}

export function LegalUpdated({ date }: { date: string }) {
  return <p className="mt-6 text-xs text-muted-foreground">Dernière mise à jour : {date}.</p>;
}
