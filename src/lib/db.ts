import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/** Loose row shape kept for dynamic/entity-manager usage. */
export type Row = Record<string, any>;

/** Union of every public schema table name, derived from the generated types. */
export type TableName = keyof Database["public"]["Tables"];

export function useRows<T extends TableName>(
  table: T,
  opts?: { order?: string | undefined; ascending?: boolean | undefined; limit?: number | undefined },
) {
  type R = Database["public"]["Tables"][T]["Row"];
  return useQuery({
    queryKey: ["rows", table, opts?.order, opts?.ascending, opts?.limit],
    queryFn: async (): Promise<R[]> => {
      let q = supabase.from(table).select("*");
      if (opts?.order) q = q.order(opts.order, { ascending: opts.ascending ?? true, nullsFirst: false });
      else q = (q as unknown as typeof q).order("created_at", { ascending: false });
      if (opts?.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as R[];
    },
  });
}

export function useRow<T extends TableName>(table: T, id?: string) {
  type R = Database["public"]["Tables"][T]["Row"];
  return useQuery({
    queryKey: ["row", table, id],
    enabled: !!id,
    queryFn: async (): Promise<R | null> => {
      const { data, error } = await supabase.from(table).select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as R | null;
    },
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>, table: string) {
  qc.invalidateQueries({ queryKey: ["rows", table] });
  qc.invalidateQueries({ queryKey: ["row", table] });
}

export function useCreateRow<T extends TableName>(table: T) {
  type Insert = Database["public"]["Tables"][T]["Insert"];
  type R = Database["public"]["Tables"][T]["Row"];
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Insert> & Row): Promise<R> => {
      const { data, error } = await supabase.from(table).insert(values as never).select().single();
      if (error) throw error;
      return data as R;
    },
    onSuccess: () => {
      invalidate(qc, table);
      toast.success("Élément créé");
    },
    onError: (e: Error) => toast.error("Création impossible", { description: e.message }),
  });
}

export function useUpdateRow<T extends TableName>(table: T) {
  type Update = Database["public"]["Tables"][T]["Update"];
  type R = Database["public"]["Tables"][T]["Row"];
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Update> & Row }): Promise<R> => {
      const { data, error } = await supabase.from(table).update(values as never).eq("id", id).select().single();
      if (error) throw error;
      return data as R;
    },
    onSuccess: () => {
      invalidate(qc, table);
      toast.success("Modifications enregistrées");
    },
    onError: (e: Error) => toast.error("Enregistrement impossible", { description: e.message }),
  });
}

export function useDeleteRow<T extends TableName>(table: T) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidate(qc, table);
      toast.success("Élément supprimé");
    },
    onError: (e: Error) => toast.error("Suppression impossible", { description: e.message }),
  });
}

export const eur = (n: number | null | undefined) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    Number(n ?? 0),
  );

export const dateFR = (d: string | null | undefined) =>
  d ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d)) : "—";

export const daysUntil = (d: string | null | undefined) =>
  d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000) : null;

/* ---------------------------------- Storage --------------------------------- */

export const FILES_BUCKET = "files";

/** Uploads a file to the private workspace bucket and returns its storage path. */
export async function uploadFile(file: File, folder = "general"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 60);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe || `fichier.${ext}`}`;
  const { error } = await supabase.storage.from(FILES_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

/** Resolves a stored value (storage path or absolute URL) to an openable URL. */
export async function resolveFileUrl(value: string): Promise<string> {
  if (/^https?:\/\//.test(value)) return value;
  const { data, error } = await supabase.storage.from(FILES_BUCKET).createSignedUrl(value, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeFile(path: string) {
  if (/^https?:\/\//.test(path)) return;
  const { error } = await supabase.storage.from(FILES_BUCKET).remove([path]);
  if (error) throw error;
}
