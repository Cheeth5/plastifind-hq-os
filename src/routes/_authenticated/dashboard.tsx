import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Banknote,
  CheckCircle2,
  Clock,
  FileText,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, StatCard, StatusChip, Progress, Chip, TableSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
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
      { property: "og:description", content: "Le quartier général numérique de PlastiFind, robotique environnementale autonome." },
    ],
  }),
  component: Dashboard,
});

const QUICK = [
  { label: "Ajouter une tâche", to: "/tasks" },
  { label: "Financement", to: "/funding" },
  { label: "Réunion", to: "/meetings" },
  { label: "Dépense", to: "/finance" },
  { label: "Contact", to: "/crm" },
  { label: "Note de recherche", to: "/research" },
  { label: "Document", to: "/documents" },
  { label: "Jalon produit", to: "/roadmap" },
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

function Dashboard() {
  const tasks = useRows("tasks", { order: "deadline", ascending: true });
  const milestones = useRows("milestones", { order: "date", ascending: true });
  const funding = useRows("funding_opportunities", { order: "deadline", ascending: true });
  const expenses = useRows("expenses", { order: "date", ascending: false });
  const meetings = useRows("meetings", { order: "date", ascending: true });
  const products = useRows("products");
  const contacts = useRows("contacts");
  const achievements = useRows("achievements");
  const activity = useRows("activity_log", { order: "created_at", ascending: false, limit: 6 });

  const loading = tasks.isLoading || funding.isLoading || milestones.isLoading;

  const labi = (products.data ?? []).find((p) => p["name"] === "Labi-Bot") ?? (products.data ?? [])[0];
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

  const openTasks = (tasks.data ?? []).filter((t) => !["Terminé", "Annulé"].includes(t["status"]));
  const priorityTasks = openTasks
    .filter((t) => ["Critique", "Haute"].includes(t["priority"]))
    .slice(0, 6);

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

  const PIE = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

  const upcoming = (meetings.data ?? []).filter((m) => new Date(m["date"]) >= new Date()).slice(0, 4);

  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="PlastiFind HQ"
        description="La robotique autonome au service d'un environnement plus propre."
      />

      <section className="panel relative overflow-hidden p-5 sm:p-6">
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight sm:text-xl">Bonjour Cheith</p>
              <p className="mt-0.5 text-sm capitalize text-muted-foreground">{today}</p>
            </div>
            <Chip tone="primary">Stade : pré-création</Chip>
          </div>
          <div className="mt-5 rounded-xl border border-primary/25 bg-primary/8 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Objectif actuel</p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed">
              Structurer PlastiFind, créer légalement l'entreprise et préparer le financement de Labi-Bot V2.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <Button key={q.label} asChild size="sm" variant="outline">
                <Link to={q.to}>{q.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          hint={`Budget prototype estimé ${eur(prototypeBudget)}`}
          icon={<Wallet className="h-4 w-4" />}
          tone="danger"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Avancement produit — Labi-Bot V2</h2>
            <Chip tone="primary">{Number(labi?.["progress"] ?? 0)} %</Chip>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
        </div>

        <div className="panel p-5">
          <h2 className="text-sm font-bold">Pipeline de financement</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
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
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Prototypes construits" value={1} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Produits vendus" value={1} hint="Premier prototype Labi-Bot" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Contacts actifs" value={(contacts.data ?? []).length} icon={<Users className="h-4 w-4" />} />
        <StatCard
          label="Distinctions"
          value={(achievements.data ?? []).filter((a) => /place/i.test(String(a["result"] ?? ""))).length}
          hint="Robofest Tunisie & International"
          icon={<Trophy className="h-4 w-4" />}
          tone="warning"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-sm font-bold">Tâches par statut</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-sm font-bold">Dépenses par catégorie</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spendByCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {spendByCategory.map((_, i) => (
                    <Cell key={i} fill={PIE[i % PIE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => eur(v)}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Tâches prioritaires</h2>
            <Button asChild size="sm" variant="ghost">
              <Link to="/tasks">Tout voir</Link>
            </Button>
          </div>
          {loading ? (
            <div className="mt-4">
              <TableSkeleton rows={4} />
            </div>
          ) : priorityTasks.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Aucune tâche prioritaire ouverte. Ajoutez vos prochaines actions.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {priorityTasks.map((t) => (
                <li key={t["id"]} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
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
        </div>

        <div className="panel p-5">
          <h2 className="text-sm font-bold">Réunions à venir</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune réunion planifiée.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {upcoming.map((m) => (
                <li key={m["id"]} className="rounded-lg border border-border p-3">
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
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Activité récente</h2>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <ul className="mt-3 divide-y divide-border">
          {(activity.data ?? []).map((a) => (
            <li key={a["id"]} className="flex flex-wrap items-center gap-x-1.5 gap-y-1 py-2.5 text-sm">
              <span className="font-medium">{a["actor"]}</span>
              <span className="text-muted-foreground">{a["action"]}</span>
              <span className="font-medium">« {a["entity_label"]} »</span>
              <span className="ml-auto text-xs text-muted-foreground">{dateFR(a["created_at"])}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
