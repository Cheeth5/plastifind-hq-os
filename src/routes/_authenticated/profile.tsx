import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Bot,
  Building2,
  Compass,
  Github,
  Linkedin,
  Mail,
  Sparkles,
  Target,
  Briefcase,
  GraduationCap,
  Pencil,
  FileCheck,
  FolderGit2,
  MapPin,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Clock,
  User,
  Shield,
  Layers,
} from "lucide-react";
import { Chip, PageHeader, Progress, StatCard, StatusChip, Widget } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useRows, dateFR, type Row } from "@/lib/db";
import {
  fullNameOf,
  initialsOf,
  roleLabel,
  useMyProfile,
  useMyRole,
  useSessionUser,
} from "@/lib/rbac";
import {
  useProfileExt,
  calculateProfileCompletion,
  type Experience,
  type Education,
  type Certification,
  type ProjectShowcase,
} from "@/lib/profile-ext";
import { ProfileEditorModal } from "@/components/profile/profile-editor";
import { FeedComposer, ProfileFeed } from "@/components/profile/profile-feed";
import { useResolvedFileUrl } from "@/lib/use-resolved-url";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Mon Profil Professionnel — PlastiFind OS" },
      {
        name: "description",
        content:
          "Profil professionnel individuel, parcours, compétences et contributions PlastiFind OS.",
      },
      { property: "og:title", content: "Profil Professionnel — PlastiFind OS" },
      {
        property: "og:description",
        content: "Profil d'équipe de la robotique environnementale PlastiFind.",
      },
    ],
  }),
  component: ProfilePage,
});

const DEFAULT_SKILLS = [
  "Robotique & Embarqué",
  "IA & Vision par Ordinateur",
  "CAO & Conception 3D",
  "ROS2 / Linux",
  "Product Engineering",
  "Gestion de Projet",
];

function ProfilePage() {
  const { data: profile } = useMyProfile();
  const { data: role } = useMyRole();
  const { data: user } = useSessionUser();
  const userId = user?.id || "";

  const { data: ext } = useProfileExt(userId);
  const [editorOpen, setEditorOpen] = useState(false);

  const achievements = useRows("achievements");
  const allTasks = useRows("tasks", { order: "deadline", ascending: true });
  const allActivity = useRows("activity_log", { order: "created_at", ascending: false, limit: 30 });
  const products = useRows("products");

  const myName = fullNameOf(profile, user?.email);
  const myEmail = user?.email || "";

  // Data isolation: only calculate user-relevant tasks and activity
  const myTasks = useMemo(() => {
    const list = (allTasks.data ?? []) as Row[];
    if (!userId) return [];
    return list.filter((t) => {
      const assignee = String(t["assignee"] ?? "").toLowerCase();
      const creator = String(t["created_by"] ?? "");
      const emailPrefix = myEmail ? myEmail.split("@")[0]!.toLowerCase() : "";
      return (
        creator === userId ||
        (myEmail && assignee === myEmail.toLowerCase()) ||
        (myName && assignee.includes(myName.toLowerCase())) ||
        (emailPrefix && assignee.includes(emailPrefix))
      );
    });
  }, [allTasks.data, userId, myEmail, myName]);

  const openTasks = myTasks.filter((t) => !["Terminé", "Annulé"].includes(t["status"]));
  const completedTasks = myTasks.filter((t) => t["status"] === "Terminé");

  const myActivity = useMemo(() => {
    const list = (allActivity.data ?? []) as Row[];
    if (!userId) return [];
    return list.filter((a) => {
      const actor = String(a["actor"] ?? "").toLowerCase();
      const userRef = String(a["user_id"] ?? "");
      const emailPrefix = myEmail ? myEmail.split("@")[0]!.toLowerCase() : "";
      return (
        userRef === userId ||
        (myName && actor.includes(myName.toLowerCase())) ||
        (emailPrefix && actor.includes(emailPrefix))
      );
    });
  }, [allActivity.data, userId, myName, myEmail]);

  const labi =
    (products.data ?? []).find((p) => String(p["name"] ?? "").includes("Labi")) ??
    (products.data ?? [])[0];

  const skills = ext?.skills && ext.skills.length > 0 ? ext.skills : DEFAULT_SKILLS;
  const experiences = ext?.experiences ?? [];
  const education = ext?.education ?? [];
  const certifications = ext?.certifications ?? [];
  const projects = ext?.projects ?? [];

  const { percent: completionPct, missing } = calculateProfileCompletion(profile, ext);

  const rawAvatar = profile?.["avatar_url"] || ext?.avatarUrl;
  const avatarUrl = useResolvedFileUrl(rawAvatar);
  const rawBanner = ext?.bannerUrl;
  const bannerResolved = useResolvedFileUrl(rawBanner);

  const bannerStyle = ext?.bannerUrl?.startsWith("linear-gradient")
    ? { background: ext.bannerUrl }
    : bannerResolved
      ? {
          backgroundImage: `url(${bannerResolved})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { background: "linear-gradient(135deg, #091a28 0%, #0d283f 50%, #064060 100%)" };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Identité professionnelle"
        title="Mon Profil"
        icon={<User className="h-5 w-5" />}
        description="Gérez votre vitrine professionnelle, vos expertises et vos contributions PlastiFind."
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setEditorOpen(true)} size="sm">
              <Pencil className="mr-1.5 h-4 w-4" /> Modifier le profil
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/settings">Paramètres</Link>
            </Button>
          </div>
        }
      />

      {/* LinkedIn-style Cover Banner & Header Card */}
      <section className="glass rise relative overflow-hidden rounded-2xl border border-border/70 p-0 shadow-lg">
        {/* Banner */}
        <div className="h-44 w-full relative sm:h-56" style={bannerStyle}>
          <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-20" />
          <Button
            size="sm"
            variant="secondary"
            className="absolute right-4 top-4 h-8 bg-background/70 backdrop-blur hover:bg-background/90"
            onClick={() => setEditorOpen(true)}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Personnaliser la bannière
          </Button>
        </div>

        {/* Profile info overlap */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end -mt-16 sm:-mt-20">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={myName}
                className="h-28 w-28 shrink-0 rounded-2xl border-4 border-background object-cover shadow-2xl sm:h-32 sm:w-32"
              />
            ) : (
              <div className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl border-4 border-background bg-primary/20 text-3xl font-bold text-primary shadow-2xl sm:h-32 sm:w-32">
                {initialsOf(myName)}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1.5 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{myName}</h2>
                  <p className="text-sm font-medium text-primary">
                    {ext?.headline || `${roleLabel(role)} chez PlastiFind OS`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip tone="primary" dot>
                    {ext?.department || "Ingénierie & Produit"}
                  </Chip>
                  <Chip tone="neutral">
                    <MapPin className="mr-1 inline h-3 w-3" />
                    {ext?.location || "Brest, France"}
                  </Chip>
                </div>
              </div>

              {ext?.bio ? (
                <p className="pt-2 text-sm leading-relaxed text-muted-foreground">{ext.bio}</p>
              ) : (
                <p className="pt-2 text-xs italic text-muted-foreground">
                  Aucune biographie rédigée. Cliquez sur « Modifier le profil » pour ajouter votre
                  parcours.
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-3">
                <Button size="sm" variant="outline" asChild>
                  <a href={`mailto:${myEmail}`}>
                    <Mail className="mr-1.5 h-4 w-4" /> {myEmail}
                  </a>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/messages">
                    <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> Message direct
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion Checklist */}
      {completionPct < 100 && (
        <section className="glass rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-foreground">
                Complétion du profil : <span className="text-primary">{completionPct}%</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Complétez ces éléments pour renforcer votre visibilité dans l'annuaire PlastiFind.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditorOpen(true)}>
              Compléter mon profil
            </Button>
          </div>
          <Progress value={completionPct} className="mt-3" />
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.map((item) => (
              <span
                key={item}
                className="rounded-md border border-border/80 bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                ○ {item}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* KPI Stats Row (Isolated to user) */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tâches actives"
          value={openTasks.length}
          hint="Assignées ou créées"
          icon={<Target className="h-4 w-4" />}
          tone="warning"
        />
        <StatCard
          label="Tâches terminées"
          value={completedTasks.length}
          hint="Contributions réalisées"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success"
        />
        <StatCard
          label="Compétences validées"
          value={skills.length}
          hint="Domaines d'expertise"
          icon={<Sparkles className="h-4 w-4" />}
          tone="primary"
        />
        <StatCard
          label="Expériences & Projets"
          value={experiences.length + projects.length}
          hint="Parcours documenté"
          icon={<Briefcase className="h-4 w-4" />}
        />
      </section>

      {/* Main Grid: Left Column (Experience/Education/Projects), Right Column (Skills/Tasks/Activity) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Career Timeline & Projects */}
        <div className="space-y-6 lg:col-span-2">
          {/* Experience Section */}
          <Widget
            title="Expérience Professionnelle"
            subtitle="Parcours & réalisations"
            icon={<Briefcase className="h-4 w-4" />}
            actions={
              <Button size="sm" variant="ghost" onClick={() => setEditorOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            }
          >
            {experiences.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune expérience ajoutée.{" "}
                <button onClick={() => setEditorOpen(true)} className="text-primary underline">
                  Ajouter une expérience
                </button>
              </p>
            ) : (
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="relative border-l-2 border-primary/30 pl-4 space-y-1"
                  >
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground">{exp.role}</h4>
                      <span className="text-xs text-muted-foreground">
                        {exp.startDate} — {exp.current ? "Aujourd'hui" : exp.endDate || "—"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary">
                      {exp.company} {exp.location ? `· ${exp.location}` : ""}
                    </p>
                    {exp.description && (
                      <p className="text-xs leading-relaxed text-muted-foreground pt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Widget>

          {/* Education Section */}
          <Widget
            title="Formation & Diplômes"
            subtitle="Parcours académique"
            icon={<GraduationCap className="h-4 w-4" />}
            actions={
              <Button size="sm" variant="ghost" onClick={() => setEditorOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            }
          >
            {education.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune formation renseignée.{" "}
                <button onClick={() => setEditorOpen(true)} className="text-primary underline">
                  Ajouter une formation
                </button>
              </p>
            ) : (
              <div className="space-y-4">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="rounded-xl border border-border/70 bg-surface/40 p-3.5 space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground">
                        {edu.degree} {edu.field ? `en ${edu.field}` : ""}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {edu.startDate} — {edu.endDate || "—"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary">{edu.school}</p>
                    {edu.description && (
                      <p className="text-xs text-muted-foreground pt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Widget>

          {/* Projects Showcase */}
          <Widget
            title="Projets & Portfolio"
            subtitle="Réalisations techniques et innovations"
            icon={<FolderGit2 className="h-4 w-4" />}
            actions={
              <Button size="sm" variant="ghost" onClick={() => setEditorOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            }
          >
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun projet mis en avant.{" "}
                <button onClick={() => setEditorOpen(true)} className="text-primary underline">
                  Mettre en avant un projet
                </button>
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-xl border border-border/70 bg-surface/50 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground">{proj.name}</h4>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {proj.description}
                    </p>
                    {proj.role && (
                      <p className="text-[11px] font-medium text-primary">Rôle : {proj.role}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Widget>
        </div>

        {/* Right Column: Skills, Certifications, Tasks, Activity */}
        <div className="space-y-6">
          {/* Skills Widget */}
          <Widget
            title="Compétences Clés"
            subtitle="Expertises techniques"
            icon={<Sparkles className="h-4 w-4" />}
            actions={
              <Button size="sm" variant="ghost" onClick={() => setEditorOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            }
          >
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-border bg-surface/80 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          </Widget>

          {/* Certifications Widget */}
          <Widget
            title="Certifications"
            subtitle="Accréditations et diplômes"
            icon={<FileCheck className="h-4 w-4" />}
            actions={
              <Button size="sm" variant="ghost" onClick={() => setEditorOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            }
          >
            {certifications.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune certification enregistrée.</p>
            ) : (
              <ul className="space-y-2.5">
                {certifications.map((cert) => (
                  <li
                    key={cert.id}
                    className="rounded-lg border border-border/70 bg-card p-3 space-y-1"
                  >
                    <p className="text-xs font-bold text-foreground">{cert.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {cert.issuer} · {cert.issueDate}
                    </p>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[11px] text-primary hover:underline pt-0.5"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" /> Voir le justificatif
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Widget>

          {/* User's Isolated Tasks */}
          <Widget
            title="Mes Tâches en cours"
            subtitle="Priorités personnelles"
            icon={<Target className="h-4 w-4" />}
            actions={
              <Button asChild size="sm" variant="ghost">
                <Link to="/tasks">Voir tout</Link>
              </Button>
            }
          >
            {openTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucune tâche ouverte assignée.{" "}
                <Link to="/tasks" className="text-primary hover:underline">
                  Créer une tâche
                </Link>
              </p>
            ) : (
              <ul className="space-y-2.5">
                {openTasks.slice(0, 4).map((t) => (
                  <li
                    key={t["id"]}
                    className="rounded-lg border border-border/70 bg-surface/50 p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-xs font-medium">{t["name"]}</p>
                      <StatusChip value={t["status"]} />
                    </div>
                    {t["deadline"] && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Échéance : {dateFR(t["deadline"])}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Widget>

          {/* User's Isolated Activity Timeline */}
          <Widget
            title="Mon Activité Récente"
            subtitle="Journal personnel"
            icon={<Clock className="h-4 w-4" />}
          >
            {myActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucune activité enregistrée pour votre compte.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {myActivity.slice(0, 5).map((a) => (
                  <li key={a["id"]} className="py-2 text-xs first:pt-0 last:pb-0 space-y-0.5">
                    <p className="text-foreground font-medium">
                      {a["action"]}{" "}
                      <span className="text-primary">« {a["entity_label"] || a["entity"]} »</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{dateFR(a["created_at"])}</p>
                  </li>
                ))}
              </ul>
            )}
          </Widget>
        </div>
      </div>

      {/* Activity Feed (LinkedIn-style) */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <FeedComposer authorId={userId} />
          <ProfileFeed authorId={userId} />
        </div>
      </section>

      {/* Profile Editor Modal */}
      {editorOpen && (
        <ProfileEditorModal
          open={editorOpen}
          onOpenChange={setEditorOpen}
          userId={userId}
          profile={profile}
        />
      )}
    </div>
  );
}
