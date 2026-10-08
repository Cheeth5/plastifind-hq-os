import { cn } from "@/lib/utils";

/** PlastiFind bottle mark — deep-navy badge, brand-blue bottle. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-8 w-8", className)} role="img" aria-label="PlastiFind">
      <rect x="1.5" y="1.5" width="45" height="45" rx="12" className="fill-primary/12 stroke-primary/40" strokeWidth="1.5" />
      <path
        d="M20 9h8v3.2c0 1.1.5 2.1 1.4 2.8l1.6 1.3c1.3 1.1 2 2.7 2 4.4V34a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5V20.7c0-1.7.7-3.3 2-4.4l1.6-1.3c.9-.7 1.4-1.7 1.4-2.8V9Z"
        className="fill-primary/25 stroke-primary"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M17 26h14v8a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-8Z" className="fill-primary" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={compact ? "h-7 w-7" : "h-8 w-8"} />
      {!compact && (
        <div className="min-w-0 leading-none">
          <div className="truncate text-[15px] font-extrabold tracking-tight">
            Plasti<span className="text-primary">Find</span>
          </div>
          <div className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            OS
          </div>
        </div>
      )}
    </div>
  );
}
