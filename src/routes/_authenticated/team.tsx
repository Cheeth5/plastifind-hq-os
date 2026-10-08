import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityManager } from "@/components/entity-manager";
import { teamConfig, jobRolesConfig } from "@/lib/entities";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui-kit";
import { useProfiles, displayName, initialsOf } from "@/lib/collab";
import { useMyProfile, useSessionUser } from "@/lib/rbac";
import { useProfileExt } from "@/lib/profile-ext";
import { useResolvedFileUrl } from "@/lib/use-resolved-url";
import { ProfilePreviewModal } from "@/components/profile/profile-view";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Équipe — PlastiFind OS" },
      {
        name: "description",
        content: "Membres de l’équipe et pipeline de recrutement PlastiFind.",
      },
      { property: "og:title", content: "Équipe — PlastiFind OS" },
      {
        property: "og:description",
        content: "Membres de l’équipe et pipeline de recrutement PlastiFind.",
      },
    ],
  }),
  component: Page,
});

function MemberCard({
  profile,
  isMe,
  onClick,
}: {
  profile: Record<string, any>;
  isMe: boolean;
  onClick: () => void;
}) {
  const name = displayName(profile, "Membre");
  const { data: ext } = useProfileExt(profile["id"] as string);
  const avatar = useResolvedFileUrl((profile["avatar_url"] as string) ?? undefined);
  const role = (profile["title"] as string) || ext?.headline || "Membre PlastiFind";
  const skills = (ext?.skills ?? []).slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border border-border/70 bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-12 w-12 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface text-sm font-bold">
            {initialsOf(name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">
            {name}
            {isMe && (
              <span className="ml-1.5 rounded bg-primary/12 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Vous
              </span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
      {ext?.bio && <p className="mt-2.5 line-clamp-2 text-xs text-muted-foreground">{ext.bio}</p>}
      {skills.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {skills.map((s: string) => (
            <span
              key={s}
              className="rounded-md border border-border bg-surface/70 px-1.5 py-0.5 text-[10px] font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        {(ext?.experiences?.length ?? 0) > 0 && (
          <span>{ext!.experiences!.length} expérience(s)</span>
        )}
        {(ext?.education?.length ?? 0) > 0 && <span>· {ext!.education!.length} formation(s)</span>}
        {(ext?.certifications?.length ?? 0) > 0 && (
          <span>· {ext!.certifications!.length} certification(s)</span>
        )}
        {(ext?.projects?.length ?? 0) > 0 && <span>· {ext!.projects!.length} projet(s)</span>}
      </div>
    </button>
  );
}

function Directory() {
  const { data: profiles } = useProfiles();
  const { data: me } = useSessionUser();
  const { data: myProfile } = useMyProfile();
  const meId = (myProfile?.["id"] as string) ?? me?.id;
  const [q, setQ] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const list = useMemo(() => {
    const rows = (profiles ?? []) as Record<string, any>[];
    if (!q.trim()) return rows;
    const n = q.toLowerCase();
    return rows.filter((p) => {
      const name = displayName(p, "").toLowerCase();
      const title = String(p["title"] ?? "").toLowerCase();
      const dept = String(p["department"] ?? "").toLowerCase();
      return name.includes(n) || title.includes(n) || dept.includes(n);
    });
  }, [profiles, q]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un membre, un rôle, un département…"
          className="pl-9"
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="Aucun membre trouvé"
          description="Essayez un autre nom, rôle ou département."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <MemberCard
              key={p["id"] as string}
              profile={p}
              isMe={p["id"] === meId}
              onClick={() => {
                setPreviewId(p["id"] as string);
                setPreviewOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ProfilePreviewModal userId={previewId} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}

function Page() {
  return (
    <Tabs defaultValue="directory" className="space-y-5">
      <TabsList className="flex w-full flex-wrap justify-start">
        <TabsTrigger value="directory">Annuaire</TabsTrigger>
        <TabsTrigger value="members">Membres</TabsTrigger>
        <TabsTrigger value="hiring">Recrutement</TabsTrigger>
      </TabsList>
      <TabsContent value="directory">
        <Directory />
      </TabsContent>
      <TabsContent value="members">
        <EntityManager config={teamConfig} />
      </TabsContent>
      <TabsContent value="hiring">
        <EntityManager config={jobRolesConfig} />
      </TabsContent>
    </Tabs>
  );
}
