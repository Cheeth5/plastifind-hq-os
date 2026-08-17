import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, any>;

export const FOUNDER_EMAIL = "cheithchouk@gmail.com";

/** Company roles, ordered from most to least privileged. */
export const COMPANY_ROLES = [
  { key: "founder", label: "Fondateur / Super Admin", hint: "Accès complet et illimité" },
  { key: "administrator", label: "Administrateur", hint: "Accès large, sous le fondateur" },
  { key: "engineering", label: "Ingénieur", hint: "Ingénierie, Labi-Bot, tests, composants" },
  { key: "software_dev", label: "Développeur logiciel", hint: "Logiciel robot, projets, docs techniques" },
  { key: "ai_engineer", label: "Ingénieur IA", hint: "Modèles, vision par ordinateur, R&D" },
  { key: "designer", label: "Designer", hint: "Design produit, branding, médias" },
  { key: "business", label: "Business Developer", hint: "CRM, partenariats, financement" },
  { key: "marketing", label: "Marketing", hint: "Marketing, médias, contenus publics" },
  { key: "finance", label: "Finance", hint: "Dépenses, budgets, financement" },
  { key: "operations", label: "Opérations", hint: "Opérations, projets, logistique" },
  { key: "intern", label: "Stagiaire", hint: "Accès limité aux tâches assignées" },
  { key: "viewer", label: "Lecteur", hint: "Lecture seule" },
  { key: "mentor", label: "Mentor / Conseiller", hint: "Lecture et commentaires" },
] as const;

export type RoleKey = (typeof COMPANY_ROLES)[number]["key"];

export const roleLabel = (key?: string | null) =>
  COMPANY_ROLES.find((r) => r.key === key)?.label ?? "Membre";

/* ------------------------------- current user ------------------------------ */

export function useSessionUser() {
  return useQuery({
    queryKey: ["session-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user ?? null,
    staleTime: 5 * 60_000,
  });
}

export function useMyProfile() {
  const { data: user } = useSessionUser();
  return useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Row | null> => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return (data ?? null) as Row | null;
    },
    staleTime: 60_000,
  });
}

export function useMyRole() {
  const { data: user } = useSessionUser();
  return useQuery({
    queryKey: ["my-role", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).limit(1);
      if (error) throw error;
      return (data?.[0]?.role as string) ?? null;
    },
    staleTime: 60_000,
  });
}

export function useMyPermissions() {
  const { data: user } = useSessionUser();
  const query = useQuery({
    queryKey: ["my-permissions", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.rpc("my_permissions");
      if (error) throw error;
      return ((data ?? []) as { permission: string }[]).map((r) => r.permission);
    },
    staleTime: 5 * 60_000,
  });

  const set = useMemo(() => new Set(query.data ?? []), [query.data]);
  const can = (perm: string) => set.has("*") || set.has(perm);

  return { ...query, can, isSuperAdmin: set.has("*") };
}

/** First name for greetings — always derived from the signed-in account. */
export function firstNameOf(profile?: Row | null, email?: string | null) {
  const first = (profile?.["first_name"] as string) || "";
  if (first.trim()) return first.trim();
  const full = ((profile?.["full_name"] as string) || "").trim();
  if (full) return full.split(/\s+/)[0]!;
  const mail = (profile?.["email"] as string) || email || "";
  return mail ? mail.split("@")[0]! : "";
}

export function fullNameOf(profile?: Row | null, email?: string | null) {
  const composed = [profile?.["first_name"], profile?.["last_name"]].filter(Boolean).join(" ").trim();
  if (composed) return composed;
  return ((profile?.["full_name"] as string) || "").trim() || (profile?.["email"] as string) || email || "Membre";
}

export function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "PF"
  );
}

/* ------------------------------ administration ----------------------------- */

export function useTeamAccounts() {
  return useQuery({
    queryKey: ["team-accounts"],
    queryFn: async (): Promise<Row[]> => {
      const [{ data: profiles, error }, { data: roles, error: rErr }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: true }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (error) throw error;
      if (rErr) throw rErr;
      const byUser: Record<string, string> = {};
      for (const r of roles ?? []) byUser[(r as Row)["user_id"]] = (r as Row)["role"];
      return (profiles ?? []).map((p) => ({ ...(p as Row), role: byUser[(p as Row)["id"]] ?? "viewer" }));
    },
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delErr) throw delErr;
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as never });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-accounts"] });
      toast.success("Rôle mis à jour");
    },
    onError: (e: Error) => toast.error("Modification impossible", { description: e.message }),
  });
}

export function useSetUserDisabled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, disabled }: { userId: string; disabled: boolean }) => {
      const { error } = await supabase.from("profiles").update({ disabled }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-accounts"] });
      toast.success("Compte mis à jour");
    },
    onError: (e: Error) => toast.error("Action impossible", { description: e.message }),
  });
}
