import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Bot, Building2, Compass, Github, Linkedin, Mail, Sparkles, Target } from "lucide-react";
import { Chip, PageHeader, Progress, StatCard, StatusChip, Widget } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useRows, dateFR } from "@/lib/db";
import { fullNameOf, initialsOf, roleLabel, useMyProfile, useMyRole, useSessionUser } from "@/lib/rbac";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profil fondateur — PlastiFind OS" },
      {
        name: "description",
        content: "Profil du fondateur PlastiFind : rôle, compétences, distinctions, objectifs en cours et activité.",
      },
      { property: "og:title", content: "Profil fondateur — PlastiFind OS" },
      { property: "og:description", content: "Le profil du fondateur de PlastiFind, robotique environnementale." },
    ],
  }),
  component: ProfilePage,
});

const SKILLS = [
  "Robotique",
  "IA & vision par ordinateur",
  "Systèmes embarqués",
  "CAO / mécanique",
  "Product management",
  "Levée de fonds",
  "Design industriel",
  "Pilotage d'équipe",
];

function ProfilePage() {
  const { data: profile } = useMyProfile();
  const { data: role } = useMyRole();
  const { data: user } = useSessionUser();
  const achievements = useRows("achievements");
  const tasks = useRows("tasks", { order: "deadline", ascending: true });
  const activity = useRows("activity_log", { order: "created_at", ascending: false, limit: 8 });
  const products = useRows("products");

  const open = (tasks.data ?? []).filter((t) => !["Terminé", "Annulé"].includes(t["status"]));
  const objectives = open.filter((t) => ["Critique", "Haute"].includes(t["priority"])).slice(0, 5);
  const labi = (products.data ?? []).find((p) => String(p["name"] ?? "").includes("Labi")) ?? (products.data ?? [])[0];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Équipe"
        title="Profil fondateur"
        icon={<Compass className="h-5 w-5" />}
        description="Identité, expertise et objectifs du fondateur de PlastiFind."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/settings">Paramètres</Link>
          </Button>
        }
      />

      <section className="glass rise relative overflow-hidden p-6 sm:p-8">
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-primary/12 text-3xl font-bold text-primary shadow-[0_0_50px_-16px_var(--color-primary)]">
            {initialsOf(fullNameOf(profile, user?.email))}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight">{fullNameOf(profile, user?.email)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{roleLabel(role)} — PlastiFind</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone="primary" dot>
                Robotique environnementale
              </Chip>
              <Chip tone="success">Pre-Seed</Chip>
              <Chip tone="neutral">Brest, France</Chip>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href="mailto:contact@plastifind.com">
                  <Mail className="mr-1.5 h-4 w-4" /> Contact
                </a>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                  <Linkedin className="mr-1.5 h-4 w-4" /> LinkedIn
                </a>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <Github className="mr-1.5 h-4 w-4" /> GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entreprise" value="PlastiFind" hint="Robotique environnementale" icon={<Building2 className="h-4 w-4" />} />
        <StatCard
          label="Produit piloté"
          value={labi?.["name"] ?? "Labi-Bot V2"}
          hint={`${Number(labi?.["progress"] ?? 0)} % d'avancement`}
          icon={<Bot className="h-4 w-4" />}
          progress={Number(labi?.["progress"] ?? 0)}
        />
        <StatCard label="Objectifs ouverts" value={open.length} hint="Tâches en cours" icon={<Target className="h-4 w-4" />} tone="warning" />
        <StatCard
          label="Distinctions"
          value={(achievements.data ?? []).length}
          hint="Concours & reconnaissances"
          icon={<Award className="h-4 w-4" />}
          tone="success"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Widget title="Compétences" subtitle="Expertise principale" icon={<Sparkles className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <span
                key={s}
                className="rounded-lg border border-border bg-surface/60 px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        </Widget>

        <Widget title="Objectifs en cours" subtitle="Priorités du fondateur" icon={<Target className="h-4 w-4" />} className="lg:col-span-2">
          {objectives.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun objectif prioritaire.{" "}
              <Link to="/tasks" className="font-semibold text-primary underline-offset-4 hover:underline">
                Créer une tâche
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {objectives.map((t) => (
                <li key={t["id"]} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium">{t["name"]}</p>
                    <StatusChip value={t["status"]} />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={Number(t["progress"] ?? 0)} />
                    <span className="shrink-0 text-[11px] text-muted-foreground">{dateFR(t["deadline"])}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Widget title="Réalisations" subtitle="Concours & reconnaissances" icon={<Award className="h-4 w-4" />}>
          {(achievements.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune réalisation enregistrée.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(achievements.data ?? []).map((a) => (
                <li key={a["id"]} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Award className="h-4 w-4 shrink-0 text-warning" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a["title"] ?? a["name"]}</p>
                    <p className="truncate text-xs text-muted-foreground">{a["result"] ?? a["description"] ?? "—"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget title="Activité" subtitle="Dernières actions" icon={<Sparkles className="h-4 w-4" />}>
          {(activity.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune activité récente.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(activity.data ?? []).map((a) => (
                <li key={a["id"]} className="flex flex-wrap items-center gap-x-1.5 py-2.5 text-sm">
                  <span className="font-medium">{a["actor"]}</span>
                  <span className="text-muted-foreground">{a["action"]}</span>
                  <span className="font-medium">« {a["entity_label"]} »</span>
                  <span className="ms-auto text-xs text-muted-foreground">{dateFR(a["created_at"])}</span>
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </section>
    </div>
  );
}
