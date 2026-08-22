import { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  Activity,
  Boxes,
  Camera,
  Crosshair,
  Expand,
  Info,
  Maximize2,
  Minimize2,
  RotateCcw,
  ScanLine,
  X,
} from "lucide-react";
import { useProgress } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import {
  CAMERA_PRESETS,
  HOTSPOTS,
  TELEMETRY,
  VIEW_MODES,
  type CameraPresetId,
  type ViewMode,
} from "@/lib/robot-twin";

const RobotScene = lazy(() => import("./robot-scene"));

function Ring({ value, label, unit }: { value: number; label: string; unit: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-2.5">
      <svg width={44} height={44} viewBox="0 0 44 44" className="shrink-0 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-border)" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="min-w-0">
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
        <p className="num text-sm font-semibold">
          {value}
          {unit}
        </p>
      </div>
    </div>
  );
}

function SceneFallback() {
  const { progress } = useProgress();
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-14 w-14">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
          <span className="absolute inset-2 rounded-full border-2 border-primary/60 border-t-transparent motion-safe:animate-spin" />
        </div>
        <Logo className="h-7 w-auto opacity-80" />
        <p className="text-xs font-medium text-muted-foreground">Labi-Bot Digital Twin</p>
        <p className="num text-sm font-semibold text-primary">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

export function DigitalTwin({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("normal");
  const [preset, setPreset] = useState<CameraPresetId>("hero");
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [mission, setMission] = useState(false);
  const [panelOpen, setPanelOpen] = useState(!compact);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry?.isIntersecting ?? false;
      setVisible(isVisible);
      if (isVisible) setShouldLoad(true);
    }, { threshold: 0.01 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mission) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMission(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mission]);

  const hotspot = HOTSPOTS.find((h) => h.id === active) ?? null;

  const shell = (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden border border-border/70 bg-[#060b12]",
        mission ? "h-full w-full rounded-none" : "rounded-2xl",
        !mission && (compact ? "h-[360px]" : "h-[520px] sm:h-[620px]"),
        className,
      )}
    >
      {mounted && shouldLoad ? (
        <Suspense fallback={<SceneFallback />}>
          <RobotScene
            viewMode={viewMode}
            preset={preset}
            scanning={scanning}
            cinematic={mission}
            active={visible}
            activeHotspot={active}
            onHotspot={setActive}
            onScanDone={() => {
              setScanning(false);
              setScanDone(true);
              setTimeout(() => setScanDone(false), 3200);
            }}
          />
        </Suspense>
      ) : (
        <SceneFallback />
      )}

      {/* top-left identity */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-primary/30 bg-background/60 px-3 py-1.5 backdrop-blur-xl">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-xs font-semibold tracking-tight">Labi-Bot V2</span>
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Digital twin
          </span>
        </div>
        {scanDone && (
          <div className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-[11px] font-medium text-success backdrop-blur">
            System Ready — diagnostic complet
          </div>
        )}
      </div>

      {/* top-right actions */}
      <div className="absolute right-4 top-4 z-10 flex flex-wrap items-center justify-end gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-primary/30 bg-background/60 backdrop-blur-xl"
          onClick={() => {
            setScanning(true);
            setScanDone(false);
          }}
          disabled={scanning}
        >
          <ScanLine className="mr-1.5 h-3.5 w-3.5 text-primary" />
          {scanning ? "Scan…" : "Scanner"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-border/60 bg-background/60 backdrop-blur-xl"
          onClick={() => setPreset("hero")}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-border/60 bg-background/60 backdrop-blur-xl"
          onClick={() => setMission((m) => !m)}
        >
          {mission ? <Minimize2 className="h-3.5 w-3.5" /> : <Expand className="h-3.5 w-3.5" />}
          <span className="ml-1.5 hidden sm:inline">{mission ? "Quitter" : "Mission"}</span>
        </Button>
        {mission && (
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setMission(false)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* telemetry rail */}
      {(mission || !compact) && (
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
          <div className="pointer-events-auto w-52 rounded-2xl border border-border/60 bg-background/55 p-3.5 backdrop-blur-xl">
            <p className="eyebrow mb-2.5 flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-primary" /> Télémétrie
            </p>
            <div className="grid gap-2.5">
              {TELEMETRY.slice(0, mission ? 10 : 6).map((t) => (
                <Ring key={t.id} value={t.value} label={t.label} unit={t.unit} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* bottom bar: view modes + camera presets */}
      <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-background/55 p-1 backdrop-blur-xl">
          <span className="px-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <Boxes className="mr-1 inline h-3 w-3" />
            Vue
          </span>
          {VIEW_MODES.map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all",
                viewMode === v.id
                  ? "bg-primary text-primary-foreground shadow-[0_0_18px_-4px_var(--color-primary)]"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-background/55 p-1 backdrop-blur-xl">
          <span className="px-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <Camera className="mr-1 inline h-3 w-3" />
            Caméra
          </span>
          {CAMERA_PRESETS.map((c) => (
            <button
              key={c.id}
              onClick={() => setPreset(c.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all",
                preset === c.id
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* hotspot info panel */}
      {hotspot && (
        <div className="absolute inset-y-4 right-4 z-20 w-[min(340px,calc(100%-2rem))] animate-[scale-in_.2s_ease-out] overflow-y-auto rounded-2xl border border-primary/25 bg-background/80 p-4 backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow text-primary">Composant</p>
              <h3 className="text-base font-bold tracking-tight">{hotspot.label}</h3>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setActive(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip tone="primary">{hotspot.version}</Chip>
            <Chip tone={hotspot.status === "Opérationnel" ? "success" : "warning"}>
              {hotspot.status}
            </Chip>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{hotspot.description}</p>

          <dl className="mt-3 space-y-1.5 rounded-xl border border-border/60 bg-surface/40 p-3 text-xs">
            {hotspot.specs.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="num text-right font-medium">{v}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-1.5">
              <dt className="text-muted-foreground">Coût estimé</dt>
              <dd className="num font-semibold text-primary">
                {hotspot.cost ? `${hotspot.cost.toLocaleString("fr-FR")} €` : "Interne"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Fournisseur</dt>
              <dd className="text-right font-medium">{hotspot.supplier}</dd>
            </div>
          </dl>

          <div className="mt-3 space-y-2 text-xs">
            <div>
              <p className="eyebrow">Maintenance</p>
              <p className="mt-0.5 text-muted-foreground">{hotspot.maintenance}</p>
            </div>
            <div>
              <p className="eyebrow">Documents liés</p>
              <ul className="mt-1 space-y-1">
                {hotspot.documents.map((d) => (
                  <li
                    key={d}
                    className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface/40 px-2 py-1"
                  >
                    <Info className="h-3 w-3 text-primary" /> {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">Évolutions prévues</p>
              <p className="mt-0.5 text-muted-foreground">{hotspot.upgrades}</p>
            </div>
          </div>
        </div>
      )}

      {/* hotspot index */}
      {panelOpen && !hotspot && !mission && (
        <div className="pointer-events-none absolute right-4 top-16 z-10 hidden w-52 xl:block">
          <div className="pointer-events-auto rounded-2xl border border-border/60 bg-background/55 p-3 backdrop-blur-xl">
            <p className="eyebrow mb-2 flex items-center gap-1.5">
              <Crosshair className="h-3 w-3 text-primary" /> Points d'intérêt
            </p>
            <div className="flex flex-wrap gap-1">
              {HOTSPOTS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setActive(h.id)}
                  className="rounded-lg border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {compact && (
        <button
          onClick={() => setPanelOpen((p) => !p)}
          className="absolute bottom-3 right-3 z-10 hidden"
          aria-hidden
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  if (mission) {
    return <div className="fixed inset-0 z-[100] bg-[#060b12]">{shell}</div>;
  }
  return shell;
}

export default DigitalTwin;
