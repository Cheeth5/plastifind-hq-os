import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-5 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const TONES: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/12 text-primary border-primary/25",
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/12 text-warning border-warning/25",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
};

export function toneFor(value?: string | null): keyof typeof TONES {
  const v = (value ?? "").toLowerCase();
  if (/(terminé|validé|accepté|joined|partenaire|actif|fait|vendu|done|1re place)/.test(v)) return "success";
  if (/(en cours|revue|soumis|entretien|contacté|qualifié|préparation|à préparer|draft|brouillon)/.test(v)) return "primary";
  if (/(bloqué|attente|risque|à faire|planifié|on hold|backlog|idée|recherche|identifié)/.test(v)) return "warning";
  if (/(annulé|rejeté|perdu|non éligible|critique|ouvert)/.test(v)) return "danger";
  return "neutral";
}

export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusChip({ value }: { value?: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <Chip tone={toneFor(value)}>{value}</Chip>;
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
        <span className="text-lg font-bold">+</span>
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="panel divide-y divide-border overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-20 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-3.5 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const ring =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-destructive"
          : "text-primary";
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon && <span className={cn("shrink-0", ring)}>{icon}</span>}
      </div>
      <p className="num mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
