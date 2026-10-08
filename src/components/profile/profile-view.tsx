import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  ExternalLink,
  FileCheck,
  FolderGit2,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Chip } from "@/components/ui-kit";
import { fullNameOf, initialsOf, roleLabel } from "@/lib/rbac";
import { useProfileExt } from "@/lib/profile-ext";
import { useResolvedFileUrl } from "@/lib/use-resolved-url";
import { ProfileFeed, FeedComposer } from "./profile-feed";
import { cn } from "@/lib/utils";

export function ProfileAvatar({
  url,
  name,
  size = "md",
}: {
  url?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const resolved = useResolvedFileUrl(url ?? undefined);
  const cls =
    size === "lg"
      ? "h-24 w-24 text-2xl"
      : size === "sm"
        ? "h-9 w-9 text-[11px]"
        : "h-14 w-14 text-lg";
  if (resolved)
    return (
      <img
        src={resolved}
        alt={name}
        className={cn(
          cls,
          "shrink-0 rounded-2xl border-4 border-background object-cover shadow-xl",
        )}
      />
    );
  return (
    <div
      className={cn(
        cls,
        "grid shrink-0 place-items-center rounded-2xl border-4 border-background bg-primary/20 font-bold text-primary shadow-xl",
      )}
    >
      {initialsOf(name)}
    </div>
  );
}

export function ProfileBanner({ bannerUrl }: { bannerUrl?: string | null }) {
  const resolved = useResolvedFileUrl(bannerUrl ?? undefined);
  const style = bannerUrl?.startsWith("linear-gradient")
    ? { background: bannerUrl }
    : resolved
      ? {
          backgroundImage: `url(${resolved})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { background: "linear-gradient(135deg, #091a28 0%, #0d283f 50%, #064060 100%)" };
  return <div className="h-28 w-full" style={style} />;
}

/** Read-only profile view used for previews of other members. */
export function ReadOnlyProfileView({
  userId,
  profile,
  isMe,
}: {
  userId: string;
  profile: Record<string, any>;
  isMe: boolean;
}) {
  const { data: ext } = useProfileExt(userId);
  const name = fullNameOf(profile, profile["email"] ?? "Membre");
  const skills = ext?.skills ?? [];
  const experiences = ext?.experiences ?? [];
  const education = ext?.education ?? [];
  const certifications = ext?.certifications ?? [];
  const projects = ext?.projects ?? [];

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border/70">
        <ProfileBanner bannerUrl={ext?.bannerUrl} />
        <div className="space-y-2 p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <ProfileAvatar url={profile?.["avatar_url"] || ext?.avatarUrl} name={name} size="lg" />
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold">{name}</h3>
              <p className="truncate text-sm font-medium text-primary">
                {ext?.headline || `${roleLabel(null)} chez PlastiFind OS`}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {profile?.["department"] && (
                  <Chip tone="primary">{String(profile["department"])}</Chip>
                )}
                {ext?.location && (
                  <Chip tone="neutral">
                    <MapPin className="mr-1 inline h-3 w-3" />
                    {ext.location}
                  </Chip>
                )}
              </div>
            </div>
          </div>
          {ext?.bio && <p className="text-sm leading-relaxed text-muted-foreground">{ext.bio}</p>}
          {!isMe && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" asChild>
                <Link to="/messages">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Message
                </Link>
              </Button>
              {profile?.["email"] && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={`mailto:${String(profile["email"])}`}>
                    <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: <Briefcase className="h-4 w-4" />,
            title: "Expérience",
            items: experiences.map((e: any) => `${e.role} · ${e.company}`),
          },
          {
            icon: <GraduationCap className="h-4 w-4" />,
            title: "Formation",
            items: education.map((e: any) => `${e.degree} · ${e.school}`),
          },
          {
            icon: <FileCheck className="h-4 w-4" />,
            title: "Certifications",
            items: certifications.map((c: any) => `${c.name} · ${c.issuer}`),
          },
          {
            icon: <FolderGit2 className="h-4 w-4" />,
            title: "Projets",
            items: projects.map((p: any) => `${p.name}${p.role ? ` (${p.role})` : ""}`),
          },
        ].map((section) => (
          <div key={section.title} className="rounded-xl border border-border/70 bg-card p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <span className="text-primary">{section.icon}</span>
              {section.title}
            </p>
            {section.items.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Aucune donnée.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {section.items.map((item: string, i: number) => (
                  <li key={i} className="truncate text-xs text-foreground">
                    • {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {skills.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <Sparkles className="h-4 w-4 text-primary" /> Compétences
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.map((s: string) => (
              <span
                key={s}
                className="rounded-lg border border-border bg-surface/80 px-2.5 py-1 text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Feed — always visible; interaction only when viewing someone else's or own wall */}
      <ProfileFeed authorId={userId} compact />
      {isMe && <FeedComposer authorId={userId} />}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/collab";

export function ProfilePreviewModal({
  userId,
  open,
  onOpenChange,
}: {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: me } = useCurrentUser();

  const { data: profile } = useQuery({
    queryKey: ["profile-preview", userId],
    enabled: !!userId && open,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      return (data as Record<string, any>) ?? null;
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        {profile ? (
          <ReadOnlyProfileView userId={userId!} profile={profile} isMe={userId === me} />
        ) : (
          <p className="p-6 text-sm text-muted-foreground">Chargement du profil…</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
