import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Banknote,
  Bot,
  CalendarClock,
  Flag,
  Gauge,
  ListChecks,
  Radar,
  Rocket,
  Target,
  Zap,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Chip,
  DashboardSkeleton,
  EmptyState,
  PageHeader,
  Progress,
  RadialProgress,
  StatCard,
  StatusChip,
  Widget,
} from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { DigitalTwin } from "@/components/robot/digital-twin";
import { useRows, eur, dateFR, daysUntil } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/mission-control")({
  head: () => ({
    meta: [
      { title: "Mission Control — PlastiFind OS" },
      {
        name: "description",
        content:
          "Salle de contrôle PlastiFind : statut de l'entreprise, objectif de financement, avancement Labi-Bot, sprint courant, roadmap et décisions récentes.",
      },
      { property: "og:title", content: "Mission Control — PlastiFind OS" },
      {
        property: "og:description",
        content: "La salle de contrôle de la robotique environnementale PlastiFind.",
      },
    ],
  }),
  component: MissionControl,
});

const FUNDING_GOAL = 150000;

function MissionControl() {
  const tasks = useRows("tasks", { order: "deadline", ascending: true });
  const milestones = useRows("milestones", { order: "date", ascending: true });
  const funding = useRows("funding_opportunities", { order: "deadline", ascending: true });
  const products = useRows("products");
  const decisions = useRows("decisions", { order: "created_at", ascending: false, limit: 5 });
  const activity = useRows("activity_log", { order: "created_at", ascending: false, limit: 8 });

  const loading = tasks.isLoading || milestones.isLoading || funding.isLoading || products.isLoading;

  const labi = (products.data ?? []).find((p) => String(p["name"] ?? "").includes("Labi")) ?? (products.data ?? [])[0];
  const detail = (labi?.["progress_detail"] ?? {}) as Record<string, number>;
  const prototypeProgress = Number(labi?.["progress"] ?? 0);

  const f = funding.data ?? [];
  const sum = (rows: Record<string, any>[]) => rows.reduce((s, r) => s + Number(r["amount"] ?? 0), 0);
  const secured = sum(f.filter((o) => o["status"] === "Accepté"));
  const pipeline = sum(f);
  const goalPct = Math.min(100, Math.round((secured / FUNDING_GOAL) * 100));

  const open = (tasks.data ?? []).filter((t) => !["Terminé", "Annulé"].includes(t["status"]));
  const done = (tasks.data ?? []).filter((t) => t["status"] === "Terminé");
  const sprintPct = (tasks.data ?? []).length
    ? Math.round((done.length / (tasks.data ?? []).length) * 100)
    : 0;
  const todayObjectives = open
    .filter((t) => ["Critique", "Haute"].includes(t["priority"]))
    .slice(0, 5);

  const upcomingMilestones = (milestones.data ?? [])
    .filter((m) => m["date"] && new Date(m["date"]) >= new Date())
    .slice(0, 5);
  const nextMilestone = upcomingMilestones[0];
  const countdown = daysUntil(nextMilestone?.["date"]);

  const timeline = (milestones.data ?? []).slice(0, 8).map((m) => ({
    name: String(m["title"] ?? "").slice(0, 14),
    value: Number(m["progress"] ?? 0),
  }));

  const health = Math.round((prototypeProgress + goalPct + sprintPct) / 3);

  if (loading) {
    return (
      <div className="space-y-7">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Salle de contrôle"
        title="Mission Control"
        icon={<Radar className="h-5 w-5" />}
        description="État en direct de PlastiFind : mission, financement, prototype Labi-Bot V2 et exécution."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/roadmap">
                <Flag className="mr-1.5 h-4 w-4" /> Roadmap
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/tasks">
                <Zap className="mr-1.5 h-4 w-4" /> Exécuter
              </Link>
            </Button>
          </>
        }
      />

      {/* Command deck */}
      <section className="glass rise relative overflow-hidden p-6 sm:p-8">
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-25" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-success/15 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="success" dot>
                Systèmes nominaux
              </Chip>
              <Chip tone="primary">Stade : Pre-Seed</Chip>
              <Chip tone="warning">
                {countdown != null ? `Prochain jalon J-${Math.max(countdown, 0)}` : "Jalon à planifier"}
              </Chip>
            </div>
            <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              Rendre les océans mesurables, puis propres — par la robotique autonome.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Labi-Bot V2 est le vaisseau. Cette console suit la trajectoire : financement sécurisé, avancement
              d'ingénierie, sprint courant et décisions structurantes.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["Objectif de financement", `${goalPct}%`, `${eur(secured)} / ${eur(FUNDING_GOAL)}`, goalPct],
                ["Prototype Labi-Bot V2", `${prototypeProgress}%`, "8 axes d'ingénierie", prototypeProgress],
                ["Sprint courant", `${sprintPct}%`, `${open.length} tâches ouvertes`, sprintPct],
              ].map(([label, value, hint, pct]) => (
                <div key={String(label)} className="rounded-xl border border-border/70 bg-surface/50 p-3.5">
                  <p className="eyebrow">{label}</p>
                  <p className="num mt-1.5 text-xl font-bold">{value}</p>
                  <Progress value={Number(pct)} className="mt-2" />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RadialProgress value={health} size={168} stroke={12} sublabel="Santé startup" />
            <p className="max-w-[180px] text-center text-[11px] leading-relaxed text-muted-foreground">
              Indice composite : financement, prototype et exécution.
            </p>
          </div>
        </div>
      </section>

      {/* Digital twin — signature feature */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-primary">Jumeau numérique</p>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Labi-Bot V2 — modèle 3D live</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Explorez le robot, inspectez chaque sous-système via les points d'intérêt, lancez un scan
              de diagnostic ou passez en mode Mission plein écran pour une démonstration.
            </p>
          </div>
          <Chip tone="primary" dot>
            Télémétrie simulée
          </Chip>
        </div>
        <DigitalTwin />
      </section>



      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Financement sécurisé"
          value={eur(secured)}
          hint={`Pipeline ${eur(pipeline)}`}
          icon={<Banknote className="h-4 w-4" />}
          tone="success"
          progress={goalPct}
        />
        <StatCard
          label="Prototype"
          value={`${prototypeProgress} %`}
          hint={labi?.["name"] ?? "Labi-Bot V2"}
          icon={<Bot className="h-4 w-4" />}
          progress={prototypeProgress}
        />
        <StatCard
          label="Tâches ouvertes"
          value={open.length}
          hint={`${done.length} terminées`}
          icon={<ListChecks className="h-4 w-4" />}
          tone="warning"
        />
        <StatCard
          label="Prochain jalon"
          value={countdown != null ? `J-${Math.max(countdown, 0)}` : "—"}
          hint={nextMilestone ? String(nextMilestone["title"]) : "Aucun jalon planifié"}
          icon={<CalendarClock className="h-4 w-4" />}
          tone="danger"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Widget
          className="lg:col-span-2"
          title="Trajectoire de la roadmap"
          subtitle="Avancement par jalon"
          icon={<Gauge className="h-4 w-4" />}
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link to="/roadmap">Ouvrir</Link>
            </Button>
          }
        >
          {timeline.length === 0 ? (
            <EmptyState
              title="Aucun jalon défini"
              description="Ajoutez vos jalons pour visualiser la trajectoire de PlastiFind sur 30, 90 et 365 jours."
              icon={<Flag className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/roadmap">Créer un jalon</Link>
                </Button>
              }
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
                  <defs>
                    <linearGradient id="mcArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    fill="url(#mcArea)"
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Widget>

        <Widget title="Objectifs du jour" subtitle="Priorité critique & haute" icon={<Target className="h-4 w-4" />}>
          {todayObjectives.length === 0 ? (
            <EmptyState
              title="Rien de critique aujourd'hui"
              description="Aucune tâche prioritaire ouverte. Planifiez la prochaine avancée de Labi-Bot."
              icon={<Target className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/tasks">Créer une tâche</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2.5">
              {todayObjectives.map((t) => (
                <li
                  key={t["id"]}
                  className="rounded-xl border border-border bg-surface/50 p-3 transition-colors hover:border-primary/35"
                >
                  <p className="truncate text-sm font-medium">{t["name"]}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusChip value={t["priority"]} />
                    <span className="ml-auto text-[11px] text-muted-foreground">{dateFR(t["deadline"])}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Widget title="Sous-systèmes Labi-Bot" subtitle="Avancement par axe" icon={<Bot className="h-4 w-4" />} className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(detail).length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun détail d'avancement enregistré pour le produit.</p>
            )}
            {Object.entries(detail).map(([k, v]) => (
              <div key={k}>
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize text-muted-foreground">{k.replace(/_/g, " ")}</span>
                  <span className="num font-semibold">{v} %</span>
                </div>
                <Progress value={Number(v)} className="mt-1.5" />
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Jalons à venir" subtitle="Prochaines échéances" icon={<Flag className="h-4 w-4" />}>
          {upcomingMilestones.length === 0 ? (
            <EmptyState
              title="Aucun jalon planifié"
              description="Fixez la prochaine étape clé pour garder l'équipe alignée."
              icon={<Flag className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/roadmap">Planifier</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {upcomingMilestones.map((m) => (
                <li key={m["id"]} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium">{m["title"]}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{dateFR(m["date"])}</span>
                  </div>
                  <Progress value={Number(m["progress"] ?? 0)} className="mt-2" />
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Widget title="Décisions récentes" subtitle="Journal de bord technique" icon={<Rocket className="h-4 w-4" />}>
          {(decisions.data ?? []).length === 0 ? (
            <EmptyState
              title="Aucune décision consignée"
              description="Documentez vos arbitrages techniques pour garder une trace des choix d'architecture."
              icon={<Rocket className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/engineering">Ajouter une décision</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {(decisions.data ?? []).map((d) => (
                <li key={d["id"]} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium">{d["title"] ?? d["name"]}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {d["decision"] ?? d["rationale"] ?? d["context"] ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget title="Timeline entreprise" subtitle="Activité récente" icon={<Activity className="h-4 w-4" />}>
          {(activity.data ?? []).length === 0 ? (
            <EmptyState
              title="Pas encore d'activité"
              description="Chaque création ou mise à jour dans PlastiFind OS apparaîtra ici."
              icon={<Activity className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/tasks">Commencer</Link>
                </Button>
              }
            />
          ) : (
            <ol className="relative space-y-4 ps-5">
              <span className="absolute inset-y-1 left-[5px] w-px bg-border" />
              {(activity.data ?? []).map((a) => (
                <li key={a["id"]} className="relative">
                  <span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                  <p className="text-sm">
                    <span className="font-semibold">{a["actor"]}</span>{" "}
                    <span className="text-muted-foreground">{a["action"]}</span>{" "}
                    <span className="font-medium">« {a["entity_label"]} »</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{dateFR(a["created_at"])}</p>
                </li>
              ))}
            </ol>
          )}
        </Widget>
      </section>
    </div>
  );
}
