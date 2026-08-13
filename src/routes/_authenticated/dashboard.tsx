import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Banknote,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  Layers,
  ListChecks,
  Plus,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "PlastiFind HQ — Tableau de bord" },
      {
        name: "description",
        content:
          "PlastiFind HQ : objectif courant, avancement Labi-Bot V2, pipeline de financement, tâches prioritaires et réunions à venir.",
      },
      { property: "og:title", content: "PlastiFind HQ — Tableau de bord" },
      {
        property: "og:description",
        content: "Le quartier général numérique de PlastiFind, robotique environnementale autonome.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK: { label: string; to: string; icon: typeof Plus }[] = [
  { label: "Tâche", to: "/tasks", icon: ListChecks },
  { label: "Projet", to: "/projects", icon: FolderKanban },
  { label: "Financement", to: "/funding", icon: Banknote },
  { label: "Réunion", to: "/meetings", icon: CalendarDays },
  { label: "Dépense", to: "/finance", icon: Wallet },
  { label: "Contact", to: "/crm", icon: Users },
  { label: "Document", to: "/documents", icon: FileText },
  { label: "Jalon", to: "/roadmap", icon: Target },
];

const PRODUCT_AXES: [string, string][] = [
  ["mecanique", "Mécanique"],
  ["electronique", "Électronique"],
  ["embarque", "Embarqué"],
  ["ia_vision", "IA & vision"],
  ["navigation", "Navigation autonome"],
  ["dashboard", "Dashboard web"],
  ["tests", "Tests"],
  ["industrialisation", "Industrialisation"],
];

const CHART_TOOLTIP = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
} as const;

function Dashboard() {
  const tasks = useRows("tasks", { order: "deadline", ascending: true });
  const milestones = useRows("milestones", { order: "date", ascending: true });
  const funding = useRows("funding_opportunities", { order: "deadline", ascending: true });
  const expenses = useRows("expenses", { order: "date", ascending: false });
  const meetings = useRows("meetings", { order: "date", ascending: true });
  const products = useRows("products");
  const contacts = useRows("contacts");
  const achievements = useRows("achievements");
  const documents = useRows("documents", { order: "created_at", ascending: false, limit: 5 });
  const engineering = useRows("engineering_records", { order: "created_at", ascending: false, limit: 5 });
  const activity = useRows("activity_log", { order: "created_at", ascending: false, limit: 6 });

  const loading = tasks.isLoading || funding.isLoading || milestones.isLoading || products.isLoading;

  const labi = (products.data ?? []).find((p) => String(p["name"] ?? "").includes("Labi")) ?? (products.data ?? [])[0];
  const detail = (labi?.["progress_detail"] ?? {}) as Record<string, number>;

  const nextMilestone = (milestones.data ?? []).find((m) => m["date"] && new Date(m["date"]) >= new Date());
  const countdown = daysUntil(nextMilestone?.["date"]);

  const launchAxes = (milestones.data ?? []).filter((m) => m["horizon"] === "30 jours" || m["horizon"] === "90 jours");
  const launchProgress = launchAxes.length
    ? Math.round(launchAxes.reduce((s, m) => s + Number(m["progress"] ?? 0), 0) / launchAxes.length)
    : 0;

  const f = funding.data ?? [];
  const sum = (rows: Record<string, any>[]) => rows.reduce((s, r) => s + Number(r["amount"] ?? 0), 0);
  const submitted = f.filter((o) => ["Soumis", "Entretien"].includes(o["status"]));
  const accepted = f.filter((o) => o["status"] === "Accepté");

  const spent = (expenses.data ?? []).reduce((s, e) => s + Number(e["amount"] ?? 0), 0);
  const prototypeBudget = Number(labi?.["estimated_cost"] ?? 0);
  const budgetPct = prototypeBudget ? Math.min(100, Math.round((spent / prototypeBudget) * 100)) : 0;

  const openTasks = (tasks.data ?? []).filter((t) => !["Terminé", "Annulé"].includes(t["status"]));
  const priorityTasks = openTasks.filter((t) => ["Critique", "Haute"].includes(t["priority"])).slice(0, 6);

  const tasksByStatus = Object.entries(
    (tasks.data ?? []).reduce<Record<string, number>>((acc, t) => {
      acc[t["status"]] = (acc[t["status"]] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const spendByCategory = Object.entries(
    (expenses.data ?? []).reduce<Record<string, number>>((acc, e) => {
      acc[e["category"]] = (acc[e["category"]] ?? 0) + Number(e["amount"] ?? 0);
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const fundingTrend = f.slice(0, 8).map((o) => ({
    name: String(o["name"] ?? o["title"] ?? "").slice(0, 12),
    value: Number(o["amount"] ?? 0),
  }));

  const PIE = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ];

  const upcoming = (meetings.data ?? []).filter((m) => new Date(m["date"]) >= new Date()).slice(0, 4);
  const upcomingFunding = f.filter((o) => o["deadline"] && new Date(o["deadline"]) >= new Date()).slice(0, 5);

  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="CEO Overview"
        title="PlastiFind HQ"
        icon={<Layers className="h-5 w-5" />}
        description="La robotique autonome au service d'un environnement plus propre."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/mission-control">Mission Control</Link>
          </Button>
        }
      />

      {/* CEO overview hero */}
      <section className="glass rise relative overflow-hidden p-6 sm:p-8">
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -left-20 -top-28 h-64 w-64 rounded-full bg-primary/18 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xl font-bold tracking-tight sm:text-2xl">Bonjour Cheith</p>
                <p className="mt-0.5 text-sm capitalize text-muted-foreground">{today}</p>
              </div>
              <Chip tone="primary" dot>
                Stade : pré-création
              </Chip>
            </div>
            <div className="mt-5 rounded-xl border border-primary/25 bg-primary/8 p-4">
              <p className="eyebrow text-primary">Objectif actuel</p>
              <p className="mt-1.5 text-sm font-medium leading-relaxed">
                Structurer PlastiFind, créer légalement l'entreprise et préparer le financement de Labi-Bot V2.
              </p>
            </div>
            <div className="mt-5">
              <p className="eyebrow mb-2">Actions rapides</p>
              <div className="flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <Button key={q.label} asChild size="sm" variant="outline" className="group">
                    <Link to={q.to}>
                      <q.icon className="mr-1.5 h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110" />
                      {q.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <RadialProgress
              value={Number(labi?.["progress"] ?? 0)}
              size={150}
              stroke={11}
              sublabel="Labi-Bot V2"
            />
          </div>
        </div>
      </section>

      <DigitalTwin compact />



      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Prochain jalon"
          value={countdown != null ? `J-${Math.max(countdown, 0)}` : "—"}
          hint={nextMilestone ? `${nextMilestone["title"]} · ${dateFR(nextMilestone["date"])}` : "Aucun jalon planifié"}
          icon={<Clock className="h-4 w-4" />}
          tone="warning"
        />
        <StatCard
          label="Avancement du lancement"
          value={`${launchProgress} %`}
          hint="Juridique, marque, business plan, financement"
          icon={<Target className="h-4 w-4" />}
          progress={launchProgress}
        />
        <StatCard
          label="Financement potentiel"
          value={eur(sum(f))}
          hint={`${f.length} opportunités · ${submitted.length} soumise(s)`}
          icon={<Banknote className="h-4 w-4" />}
          tone="success"
        />
        <StatCard
          label="Dépenses engagées"
          value={eur(spent)}
          hint={`Budget prototype ${eur(prototypeBudget)}`}
          icon={<Wallet className="h-4 w-4" />}
          tone="danger"
          progress={budgetPct}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Widget
          className="lg:col-span-2"
          title="Avancement produit — Labi-Bot V2"
          subtitle="8 axes d'ingénierie"
          icon={<Bot className="h-4 w-4" />}
          status={<Chip tone="primary">{Number(labi?.["progress"] ?? 0)} %</Chip>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {PRODUCT_AXES.map(([key, label]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="num font-semibold">{detail[key] ?? 0} %</span>
                </div>
                <Progress value={detail[key] ?? 0} className="mt-1.5" />
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="Pipeline de financement" subtitle="Par statut" icon={<Banknote className="h-4 w-4" />}>
          <dl className="space-y-2.5 text-sm">
            {[
              ["Identifiées", f.filter((o) => o["status"] === "Recherche").length],
              ["En préparation", f.filter((o) => ["À préparer", "Brouillon", "Éligible"].includes(o["status"])).length],
              ["Soumises", submitted.length],
              ["Acceptées", accepted.length],
              ["Rejetées", f.filter((o) => o["status"] === "Rejeté").length],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex items-center justify-between">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="num font-semibold">{v as number}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Montant potentiel</span>
              <span className="num font-bold text-primary">{eur(sum(f))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Financement obtenu</span>
              <span className="num font-bold text-success">{eur(sum(accepted))}</span>
            </div>
          </div>
        </Widget>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Prototypes construits" value={1} hint="Labi-Bot V1" icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard
          label="Produits vendus"
          value={1}
          hint="Premier prototype Labi-Bot"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard label="Contacts actifs" value={(contacts.data ?? []).length} icon={<Users className="h-4 w-4" />} />
        <StatCard
          label="Distinctions"
          value={(achievements.data ?? []).filter((a) => /place/i.test(String(a["result"] ?? ""))).length}
          hint="Robofest Tunisie & International"
          icon={<Trophy className="h-4 w-4" />}
          tone="warning"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Widget title="Tâches par statut" subtitle="Répartition du backlog" icon={<ListChecks className="h-4 w-4" />}>
          {tasksByStatus.length === 0 ? (
            <EmptyState
              title="Aucune tâche"
              description="Créez votre première tâche pour piloter l'exécution de PlastiFind."
              icon={<ListChecks className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/tasks">Créer une tâche</Link>
                </Button>
              }
            />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByStatus} margin={{ top: 8, right: 4, bottom: 0, left: -26 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} contentStyle={CHART_TOOLTIP} />
                  <Bar dataKey="value" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Widget>

        <Widget title="Dépenses par catégorie" subtitle="Répartition du budget" icon={<Wallet className="h-4 w-4" />}>
          {spendByCategory.length === 0 ? (
            <EmptyState
              title="Aucune dépense"
              description="Enregistrez les coûts du prototype pour suivre le budget Labi-Bot."
              icon={<Wallet className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/finance">Ajouter une dépense</Link>
                </Button>
              }
            />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={82}
                    paddingAngle={3}
                    animationDuration={800}
                  >
                    {spendByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE[i % PIE.length]} stroke="var(--color-card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => eur(v)} contentStyle={CHART_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Widget>

        <Widget title="Montants de financement" subtitle="Par opportunité" icon={<TrendingUp className="h-4 w-4" />}>
          {fundingTrend.length === 0 ? (
            <EmptyState
              title="Aucune opportunité"
              description="Ajoutez subventions, concours et investisseurs pour construire le pipeline."
              icon={<Banknote className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/funding">Ajouter</Link>
                </Button>
              }
            />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fundingTrend} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <defs>
                    <linearGradient id="fundArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v: number) => eur(v)} contentStyle={CHART_TOOLTIP} />
                  <Area type="monotone" dataKey="value" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#fundArea)" animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Widget>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Widget
          className="lg:col-span-2"
          title="Tâches prioritaires"
          subtitle="Critique & haute priorité"
          icon={<ListChecks className="h-4 w-4" />}
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link to="/tasks">Tout voir</Link>
            </Button>
          }
        >
          {priorityTasks.length === 0 ? (
            <EmptyState
              title="Aucune tâche prioritaire"
              description="Le backlog critique est vide. Planifiez la prochaine avancée de Labi-Bot V2."
              icon={<ListChecks className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/tasks">Créer une tâche</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {priorityTasks.map((t) => (
                <li
                  key={t["id"]}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 transition-colors first:pt-0 hover:bg-accent/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t["name"]}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {t["assignee"] ?? "Non assigné"} · {t["category"] ?? "—"} · {dateFR(t["deadline"])}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusChip value={t["priority"]} />
                    <StatusChip value={t["status"]} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget title="Réunions à venir" subtitle="Agenda" icon={<CalendarDays className="h-4 w-4" />}>
          {upcoming.length === 0 ? (
            <EmptyState
              title="Aucune réunion"
              description="Planifiez vos rendez-vous incubateurs, mentors et partenaires."
              icon={<CalendarDays className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/meetings">Planifier</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {upcoming.map((m) => (
                <li key={m["id"]} className="rounded-xl border border-border p-3 transition-colors hover:border-primary/35">
                  <p className="truncate text-sm font-medium">{m["title"]}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {dateFR(m["date"])} · {m["organization"] ?? "—"}
                  </p>
                  <div className="mt-2">
                    <StatusChip value={m["preparation_status"]} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Widget
          title="Documents récents"
          subtitle="Derniers fichiers"
          icon={<FileText className="h-4 w-4" />}
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link to="/documents">Ouvrir</Link>
            </Button>
          }
        >
          {(documents.data ?? []).length === 0 ? (
            <EmptyState
              title="Aucun document"
              description="Téléversez business plan, schémas et dossiers de financement."
              icon={<FileText className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/documents">Téléverser</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {(documents.data ?? []).map((d) => (
                <li key={d["id"]} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-sm">{d["name"] ?? d["title"]}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{dateFR(d["created_at"])}</span>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget
          title="Mises à jour ingénierie"
          subtitle="Derniers enregistrements"
          icon={<Wrench className="h-4 w-4" />}
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link to="/engineering">Ouvrir</Link>
            </Button>
          }
        >
          {(engineering.data ?? []).length === 0 ? (
            <EmptyState
              title="Aucune fiche"
              description="Documentez sous-systèmes, tests et décisions de Labi-Bot V2."
              icon={<Wrench className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/engineering">Créer une fiche</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {(engineering.data ?? []).map((r) => (
                <li key={r["id"]} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="truncate text-sm font-medium">{r["title"] ?? r["name"]}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusChip value={r["status"]} />
                    <span className="ml-auto text-[11px] text-muted-foreground">{dateFR(r["created_at"])}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget
          title="Financements à échéance"
          subtitle="Prochaines deadlines"
          icon={<Banknote className="h-4 w-4" />}
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link to="/funding">Ouvrir</Link>
            </Button>
          }
        >
          {upcomingFunding.length === 0 ? (
            <EmptyState
              title="Aucune échéance"
              description="Aucune opportunité à date. Explorez subventions et concours régionaux."
              icon={<Banknote className="h-6 w-6" />}
              action={
                <Button asChild size="sm">
                  <Link to="/funding">Ajouter</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {upcomingFunding.map((o) => (
                <li key={o["id"]} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium">{o["name"] ?? o["title"]}</p>
                    <span className="num shrink-0 text-xs font-semibold text-primary">{eur(Number(o["amount"] ?? 0))}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusChip value={o["status"]} />
                    <span className="ml-auto text-[11px] text-muted-foreground">{dateFR(o["deadline"])}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </section>

      <Widget title="Activité récente" subtitle="Journal de l'espace de travail" icon={<Activity className="h-4 w-4" />}>
        {(activity.data ?? []).length === 0 ? (
          <EmptyState
            title="Pas encore d'activité"
            description="Chaque création ou mise à jour apparaîtra dans ce journal."
            icon={<Activity className="h-6 w-6" />}
            action={
              <Button asChild size="sm">
                <Link to="/tasks">Commencer</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {(activity.data ?? []).map((a) => (
              <li key={a["id"]} className="flex flex-wrap items-center gap-x-1.5 gap-y-1 py-2.5 text-sm first:pt-0 last:pb-0">
                <span className="font-medium">{a["actor"]}</span>
                <span className="text-muted-foreground">{a["action"]}</span>
                <span className="font-medium">« {a["entity_label"]} »</span>
                <span className="ms-auto text-xs text-muted-foreground">{dateFR(a["created_at"])}</span>
              </li>
            ))}
          </ul>
        )}
      </Widget>
    </div>
  );
}
