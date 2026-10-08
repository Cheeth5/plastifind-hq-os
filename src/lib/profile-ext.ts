import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Row } from "@/lib/db";
import { useSessionUser } from "./rbac";

export type Experience = {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  skills?: string[];
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  fileUrl?: string;
};

export type ProjectShowcase = {
  id: string;
  name: string;
  description: string;
  role?: string;
  technologies?: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
};

export type ProfileData = {
  headline?: string;
  bio?: string;
  department?: string;
  location?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  skills?: string[];
  experiences?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  projects?: ProjectShowcase[];
  privacy?: {
    showEmail?: boolean;
    showActivity?: boolean;
    showTasks?: boolean;
  };
};

const STORAGE_KEY_PREFIX = "pf_profile_ext_";

export function loadLocalProfileExt(userId: string): ProfileData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalProfileExt(userId: string, data: ProfileData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(data));
  } catch {
    // ignore localStorage failures (private mode, quota)
  }
}

export function useProfileExt(userId?: string) {
  return useQuery({
    queryKey: ["profile-ext", userId],
    enabled: !!userId,
    queryFn: async (): Promise<ProfileData> => {
      if (!userId) return {};
      // 1. Local cache first (own profile)
      const local = loadLocalProfileExt(userId);
      // 2. Fetch basic profile + rich ext from DB (works for every member)
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      const dbExt = ((dbProfile as Row)?.["profile_ext"] ?? {}) as ProfileData;
      const merged: ProfileData = { ...dbExt, ...local };
      return {
        ...merged,
        avatarUrl: (dbProfile as Row)?.["avatar_url"] || merged.avatarUrl,
        headline: (dbProfile as Row)?.["title"] || merged.headline,
      };
    },
    staleTime: 60_000,
  });
}

export function useUpdateProfileExt() {
  const qc = useQueryClient();
  const { data: user } = useSessionUser();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<ProfileData> }) => {
      const existing = loadLocalProfileExt(userId);
      const updated = { ...existing, ...data };
      saveLocalProfileExt(userId, updated);

      // Sync rich profile (bio, skills, education, certifications, projects…) to the
      // profiles table so other members can view the full profile read-only.
      const syncable = { ...updated };
      delete syncable.privacy;
      if (user?.id === userId) {
        await supabase
          .from("profiles")
          .update({ profile_ext: syncable } as never)
          .eq("id", userId);
      }

      // Sync basic fields to DB if available
      const dbUpdates: Record<string, any> = {};
      if (data.headline !== undefined) dbUpdates["title"] = data.headline;
      if (data.avatarUrl !== undefined) dbUpdates["avatar_url"] = data.avatarUrl;

      if (Object.keys(dbUpdates).length > 0 && user?.id === userId) {
        await supabase
          .from("profiles")
          .update(dbUpdates as never)
          .eq("id", userId);
      }
      return updated;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["profile-ext", vars.userId] });
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["profiles-directory"] });
      toast.success("Profil mis à jour");
    },
    onError: (e: Error) => toast.error("Erreur d'enregistrement", { description: e.message }),
  });
}

export function calculateProfileCompletion(
  profile?: Row | null,
  ext?: ProfileData | null,
): { percent: number; missing: string[] } {
  const checks: { label: string; done: boolean }[] = [
    { label: "Photo de profil", done: !!(profile?.["avatar_url"] || ext?.avatarUrl) },
    { label: "Nom complet", done: !!(profile?.["full_name"] || profile?.["first_name"]) },
    {
      label: "Titre / Rôle professionnel",
      done: !!(profile?.["title"] || ext?.headline || profile?.["job_role"]),
    },
    { label: "Biographie / À propos", done: !!ext?.bio && ext.bio.length > 20 },
    { label: "Compétences (au moins 3)", done: (ext?.skills?.length ?? 0) >= 3 },
    { label: "Expérience professionnelle", done: (ext?.experiences?.length ?? 0) >= 1 },
    { label: "Formation / Diplôme", done: (ext?.education?.length ?? 0) >= 1 },
    {
      label: "Certification ou Projet",
      done: (ext?.certifications?.length ?? 0) >= 1 || (ext?.projects?.length ?? 0) >= 1,
    },
  ];

  const doneCount = checks.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);

  return { percent, missing };
}
