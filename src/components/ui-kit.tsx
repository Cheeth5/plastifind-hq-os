import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  icon,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
  icon?: ReactNode;
}) {
  return (
    <header className="rise relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-6 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        {icon && (
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1.5 text-primary">{eyebrow}</p>}
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
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
  if (/(terminé|complet|validé|accepté|joined|partenaire|actif|fait|vendu|done|complete|1re place|gagné)/.test(v))
    return "success";
  if (/(en cours|in progress|revue|review|soumis|entretien|contacté|qualifié|préparation|à préparer|draft|brouillon)/.test(v))
    return "primary";
  if (/(bloqué|blocked|attente|risque|à faire|todo|planifié|planning|on hold|backlog|idée|recherche|identifié)/.test(v))
    return "warning";
  if (/(annulé|cancelled|rejeté|perdu|non éligible|critique|critical|ouvert|retard)/.test(v)) return "danger";
  return "neutral";
}

export function Chip({
  children,
  tone = "neutral",
  className,
  dot,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusChip({ value }: { value?: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <Chip tone={toneFor(value)} dot>
      {value}
    </Chip>
  );
}

export function Progress({ value, className, tone }: { value: number; className?: string; tone?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tone ?? "bg-primary")}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

/** Animated radial progress ring. */
export function RadialProgress({
  value,
  size = 120,
  stroke = 9,
  label,
  sublabel,
  color = "var(--color-primary)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="num text-xl font-bold tracking-tight">{label ?? `${v}%`}</p>
          {sublabel && <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

/** Premium content card: icon + title + subtitle + actions + hover lift. */
export function Widget({
  title,
  subtitle,
  icon,
  actions,
  status,
  children,
  className,
  contentClassName,
}: {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn("panel card-hover rise overflow-hidden", className)}>
      {(title || actions || status) && (
        <header className="flex items-center gap-3 border-b border-border/70 px-5 py-3.5">
          {icon && (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {title && <h2 className="truncate text-sm font-bold tracking-tight">{title}</h2>}
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {status}
          {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
        </header>
      )}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="panel relative flex flex-col items-center justify-center gap-3 overflow-hidden px-6 py-16 text-center">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-[0_0_36px_-12px_var(--color-primary)]">
        {icon ?? <span className="text-2xl font-bold leading-none">+</span>}
      </div>
      <h3 className="relative text-base font-semibold">{title}</h3>
      <p className="relative max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="relative mt-1">{action}</div>}
    </div>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded bg-muted", className)}>
      <div className="scan-line absolute inset-0 opacity-25 [animation:pf-sweep_1.6s_ease-in-out_infinite]" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="panel divide-y divide-border overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Shimmer className="h-3.5 w-1/3" />
          <Shimmer className="h-3.5 w-20" />
          <Shimmer className="ml-auto h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("panel space-y-3 p-5", className)}>
      <Shimmer className="h-3 w-24" />
      <Shimmer className="h-7 w-32" />
      <Shimmer className="h-3 w-40" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Shimmer className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Shimmer className="h-64 rounded-2xl lg:col-span-2" />
        <Shimmer className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
  progress,
  delta,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger";
  progress?: number;
  delta?: string;
}) {
  const accent =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-destructive"
          : "text-primary";
  const bar =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-destructive"
          : "bg-primary";
  return (
    <div className="panel card-hover rise group relative overflow-hidden p-5">
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.13] blur-2xl transition-opacity group-hover:opacity-25",
          bar,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {icon && (
          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-current/10", accent)}>{icon}</span>
        )}
      </div>
      <p className="num relative mt-3 text-[26px] font-bold leading-none tracking-tight">{value}</p>
      <div className="relative mt-2 flex items-center gap-2">
        {delta && <span className={cn("text-xs font-semibold", accent)}>{delta}</span>}
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
      {progress != null && <Progress value={progress} tone={bar} className="mt-3" />}
    </div>
  );
}
