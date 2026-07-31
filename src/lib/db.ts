import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, any>;

export function useRows(table: string, opts?: { order?: string | undefined; ascending?: boolean | undefined; limit?: number | undefined }) {
  return useQuery({
    queryKey: ["rows", table, opts?.order, opts?.ascending, opts?.limit],
    queryFn: async (): Promise<Row[]> => {
      let q = supabase.from(table as never).select("*");
      if (opts?.order) q = q.order(opts.order, { ascending: opts.ascending ?? true, nullsFirst: false });
      else q = q.order("created_at", { ascending: false });
      if (opts?.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

export function useRow(table: string, id?: string) {
  return useQuery({
    queryKey: ["row", table, id],
    enabled: !!id,
    queryFn: async (): Promise<Row | null> => {
      const { data, error } = await supabase.from(table as never).select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as Row | null;
    },
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>, table: string) {
  qc.invalidateQueries({ queryKey: ["rows", table] });
  qc.invalidateQueries({ queryKey: ["row", table] });
}

export function useCreateRow(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Row) => {
      const { data, error } = await supabase.from(table as never).insert(values as never).select().single();
      if (error) throw error;
      return data as Row;
    },
    onSuccess: () => {
      invalidate(qc, table);
      toast.success("Élément créé");
    },
    onError: (e: Error) => toast.error("Création impossible", { description: e.message }),
  });
}

export function useUpdateRow(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Row }) => {
      const { data, error } = await supabase.from(table as never).update(values as never).eq("id", id).select().single();
      if (error) throw error;
      return data as Row;
    },
    onSuccess: () => {
      invalidate(qc, table);
      toast.success("Modifications enregistrées");
    },
    onError: (e: Error) => toast.error("Enregistrement impossible", { description: e.message }),
  });
}

export function useDeleteRow(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as never).delete().eq("id", id);
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
