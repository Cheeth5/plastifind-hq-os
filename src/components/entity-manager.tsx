import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Upload, ExternalLink, X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState, PageHeader, StatusChip, TableSkeleton, Progress } from "@/components/ui-kit";
import {
  useCreateRow,
  useDeleteRow,
  useRows,
  useUpdateRow,
  dateFR,
  eur,
  uploadFile,
  resolveFileUrl,
  type Row,
  type TableName,
} from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "currency"
  | "boolean"
  | "ref"
  | "file";

export type Field = {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  required?: boolean;
  /** Show in the list view */
  list?: boolean;
  /** Rendered as a status chip in list view */
  chip?: boolean;
  /** Rendered as a progress bar */
  progress?: boolean;
  placeholder?: string;
  className?: string;
  /** Hidden from the form */
  formHidden?: boolean;
  /** For type "ref": the related table and the column used as label */
  refTable?: string;
  refLabelKey?: string;
  /** For type "file": storage folder */
  folder?: string;
};

export type EntityConfig = {
  table: string;
  title: string;
  description: string;
  singular: string;
  fields: Field[];
  searchKeys?: string[];
  filterKey?: string;
  /** Adds a deadline/date range filter on this date column */
  dateFilterKey?: string;
  defaultOrder?: { column: string; ascending?: boolean };
  emptyDescription: string;
};

function defaultsFrom(fields: Field[]): Row {
  const o: Row = {};
  for (const f of fields) o[f.key] = f.type === "boolean" ? false : "";
  return o;
}

function coerce(fields: Field[], values: Row): Row {
  const out: Row = {};
  for (const f of fields) {
    if (f.formHidden) continue;
    const raw = values[f.key];
    if (f.type === "number" || f.type === "currency") out[f.key] = raw === "" || raw == null ? null : Number(raw);
    else if (f.type === "boolean") out[f.key] = !!raw;
    else out[f.key] = raw === "" ? null : raw;
  }
  return out;
}

/* ------------------------------- Relations -------------------------------- */

export function useRefMaps(fields: Field[]) {
  const refs = fields.filter((f) => f.type === "ref" && f.refTable);
  const tableKey = Array.from(new Set(refs.map((f) => f.refTable!))).join("|");
  const tables = useMemo(() => tableKey.split("|").filter(Boolean), [tableKey]);

  // One query per referenced table, created dynamically — no cap on table count.
  const queries = useQueries({
    queries: tables.map((tbl) => ({
      queryKey: ["rows", tbl, undefined, undefined, undefined] as const,
      queryFn: async (): Promise<Row[]> => {
        const { data, error } = await supabase
          .from(tbl as never)
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []) as Row[];
      },
      enabled: tables.length > 0,
    })),
  });

  return useMemo(() => {
    const map: Record<string, { id: string; label: string }[]> = {};
    tables.forEach((tbl, i) => {
      const labelKey = refs.find((f) => f.refTable === tbl)?.refLabelKey ?? "name";
      map[tbl] = (queries[i]?.data ?? []).map((r) => ({
        id: String(r["id"]),
        label: String(r[labelKey] ?? r["title"] ?? r["name"] ?? "—"),
      }));
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries.map((q) => q.data).join("|"), tableKey]);
}

/* ------------------------------ Field widgets ------------------------------ */

function FileField({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  const t = useT();
  const [busy, setBusy] = useState(false);

  const open = async () => {
    try {
      const url = await resolveFileUrl(value);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error("Fichier indisponible", { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <div className="grid gap-2">
      {value ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-xs">{value.split("/").pop()}</span>
          <Button type="button" size="sm" variant="ghost" onClick={open}>
            <ExternalLink className="mr-1 h-3.5 w-3.5" /> {t("Ouvrir le fichier")}
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => onChange("")}>
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">{t("Retirer")}</span>
          </Button>
        </div>
      ) : null}
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
        <Upload className="h-4 w-4" />
        {busy ? t("Téléversement…") : t("Téléverser un fichier")}
        <input
          type="file"
          className="sr-only"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              const path = await uploadFile(file, field.folder ?? "general");
              onChange(path);
              toast.success("Fichier téléversé");
            } catch (err) {
              toast.error("Téléversement impossible", {
                description: err instanceof Error ? err.message : undefined,
              });
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
    </div>
  );
}

export function renderCell(field: Field, row: Row, refs?: Record<string, { id: string; label: string }[]>): ReactNode {
  const v = row[field.key];
  if (field.chip) return <StatusChip value={v} />;
  if (field.progress)
    return (
      <div className="flex min-w-24 items-center gap-2">
        <Progress value={Number(v ?? 0)} className="w-16" />
        <span className="num text-xs text-muted-foreground">{Number(v ?? 0)}%</span>
      </div>
    );
  if (v == null || v === "") return <span className="text-muted-foreground">—</span>;
  if (field.type === "ref") {
    const label = refs?.[field.refTable ?? ""]?.find((o) => o.id === String(v))?.label;
    return label ? (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <Link2 className="h-3 w-3 text-primary" />
        {label}
      </span>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }
  if (field.type === "file") return <FileCell value={String(v)} />;
  if (field.type === "currency") return <span className="num">{eur(v)}</span>;
  if (field.type === "date" || field.type === "datetime") return <span className="num">{dateFR(v)}</span>;
  if (field.type === "boolean") return v ? "Oui" : "Non";
  if (field.type === "number") return <span className="num">{v}</span>;
  return <span className="line-clamp-2">{String(v)}</span>;
}

function FileCell({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      onClick={async () => {
        try {
          window.open(await resolveFileUrl(value), "_blank", "noopener");
        } catch (e) {
          toast.error("Fichier indisponible", { description: e instanceof Error ? e.message : undefined });
        }
      }}
    >
      <ExternalLink className="h-3.5 w-3.5" />
      {value.split("/").pop()}
    </button>
  );
}

export function EntityForm({
  fields,
  value,
  onChange,
  refs,
}: {
  fields: Field[];
  value: Row;
  onChange: (v: Row) => void;
  refs?: Record<string, { id: string; label: string }[]>;
}) {
  const t = useT();
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields
        .filter((f) => !f.formHidden)
        .map((f) => (
          <div
            key={f.key}
            className={cn("grid gap-1.5", (f.type === "textarea" || f.type === "file") && "sm:col-span-2", f.className)}
          >
            <Label htmlFor={f.key} className="text-xs font-semibold text-muted-foreground">
              {t(f.label)}
              {f.required && <span className="text-destructive"> *</span>}
            </Label>
            {f.type === "textarea" ? (
              <Textarea
                id={f.key}
                rows={4}
                value={value[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => set(f.key, e.target.value)}
              />
            ) : f.type === "file" ? (
              <FileField field={f} value={value[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
            ) : f.type === "ref" ? (
              <Select
                value={value[f.key] || "__none__"}
                onValueChange={(v) => set(f.key, v === "__none__" ? "" : v)}
              >
                <SelectTrigger id={f.key}>
                  <SelectValue placeholder={t("Sélectionner…")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t("Aucun")}</SelectItem>
                  {(refs?.[f.refTable ?? ""] ?? []).map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : f.type === "select" ? (
              <Select value={value[f.key] || undefined} onValueChange={(v) => set(f.key, v)}>
                <SelectTrigger id={f.key}>
                  <SelectValue placeholder={t("Sélectionner…")} />
                </SelectTrigger>
                <SelectContent>
                  {(f.options ?? []).map((o) => (
                    <SelectItem key={o} value={o}>
                      {t(o)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : f.type === "boolean" ? (
              <Select value={value[f.key] ? "Oui" : "Non"} onValueChange={(v) => set(f.key, v === "Oui")}>
                <SelectTrigger id={f.key}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oui">{t("Oui")}</SelectItem>
                  <SelectItem value="Non">{t("Non")}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={f.key}
                type={f.type === "date" ? "date" : f.type === "number" || f.type === "currency" ? "number" : "text"}
                step={f.type === "currency" ? "0.01" : undefined}
                value={f.type === "date" && value[f.key] ? String(value[f.key]).slice(0, 10) : (value[f.key] ?? "")}
                placeholder={f.placeholder}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
    </div>
  );
}

const DATE_FILTERS = ["Échéance dépassée", "Sous 30 jours", "Sous 90 jours", "Sans date"] as const;

type Refs = Record<string, { id: string; label: string }[]>;

/* --------------------------- Extracted renderers --------------------------- */

function EntityTable({ rows, listFields, refs, onEdit, onDelete }: {
  rows: Row[];
  listFields: Field[];
  refs?: Refs;
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
}) {
  const t = useT();
  return (
    <div className="panel hidden overflow-x-auto md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {listFields.map((f) => (
              <th
                key={f.key}
                className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {t(f.label)}
              </th>
            ))}
            <th className="w-20 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row["id"]} className="group transition-colors hover:bg-accent/40">
              {listFields.map((f, i) => (
                <td key={f.key} className={cn("px-4 py-3 align-middle", i === 0 && "font-medium")}>
                  {renderCell(f, row, refs)}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(row)}>
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">{t("Modifier")}</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">{t("Supprimer")}</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EntityCards({ rows, listFields, refs, onEdit, onDelete }: {
  rows: Row[];
  listFields: Field[];
  refs?: Refs;
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
}) {
  const t = useT();
  return (
    <div className="grid gap-3 md:hidden">
      {rows.map((row) => (
        <div key={row["id"]} className="panel p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <p className="min-w-0 truncate font-semibold">{String(row[listFields[0]?.key ?? "id"] ?? "—")}</p>
            <div className="flex shrink-0 gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(row)}>
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">{t("Modifier")}</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(row)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">{t("Supprimer")}</span>
              </Button>
            </div>
          </div>
          <dl className="mt-3 grid gap-2">
            {listFields.slice(1).map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3 text-sm">
                <dt className="shrink-0 text-xs text-muted-foreground">{t(f.label)}</dt>
                <dd className="min-w-0 text-right">{renderCell(f, row, refs)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

function EntityDialog({ open, onOpenChange, editing, singularLabel, fields, value, onChange, refs, submitError, invalid, pending, onSubmit, onCancel }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: boolean;
  singularLabel: string;
  fields: Field[];
  value: Row;
  onChange: (v: Row) => void;
  refs?: Refs;
  submitError: string | null;
  invalid: boolean;
  pending: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("Modifier") : t("Créer")} — {singularLabel.replace(/^(Ajouter|Nouveau|Nouvelle|New)\s*/i, "")}
          </DialogTitle>
          <DialogDescription>Les champs marqués d'une astérisque sont obligatoires.</DialogDescription>
        </DialogHeader>
        <EntityForm fields={fields} value={value} onChange={onChange} refs={refs} />
        {submitError ? (
          <p className="rounded-md border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {submitError}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("Annuler")}
          </Button>
          <Button onClick={onSubmit} disabled={invalid || pending}>
            {pending ? "…" : t("Enregistrer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EntityManager({ config, extraHeader }: { config: EntityConfig; extraHeader?: ReactNode }) {
  const t = useT();
  const { table, fields } = config;
  const tableName = table as TableName;
  const { data, isLoading } = useRows(tableName, {
    order: config.defaultOrder?.column ?? "created_at",
    ascending: config.defaultOrder?.ascending ?? false,
  });
  const refs = useRefMaps(fields);
  const create = useCreateRow(tableName);
  const update = useUpdateRow(tableName);
  const remove = useDeleteRow(tableName);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>(defaultsFrom(fields));
  const [toDelete, setToDelete] = useState<Row | null>(null);

  useEffect(() => {
    setFilter("all");
    setDateFilter("all");
    setQuery("");
  }, [table]);

  const searchKeys = config.searchKeys ?? fields.filter((f) => (f.type ?? "text") === "text").map((f) => f.key);
  const listFields = fields.filter((f) => f.list);
  const filterField = fields.find((f) => f.key === config.filterKey);

  const rows = useMemo(() => {
    let r = data ?? [];
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((row) => searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)));
    }
    if (filter !== "all" && config.filterKey) r = r.filter((row) => row[config.filterKey as string] === filter);
    if (dateFilter !== "all" && config.dateFilterKey) {
      const key = config.dateFilterKey;
      const now = Date.now();
      r = r.filter((row) => {
        const raw = row[key];
        if (!raw) return dateFilter === "Sans date";
        const diff = (new Date(raw).getTime() - now) / 86_400_000;
        if (dateFilter === "Échéance dépassée") return diff < 0;
        if (dateFilter === "Sous 30 jours") return diff >= 0 && diff <= 30;
        if (dateFilter === "Sous 90 jours") return diff >= 0 && diff <= 90;
        return false;
      });
    }
    return r;
  }, [data, query, filter, dateFilter, config.filterKey, config.dateFilterKey, searchKeys]);

  const openCreate = () => {
    setEditing(null);
    setDraft(defaultsFrom(fields));
    setOpen(true);
  };
  const openEdit = (row: Row) => {
    setEditing(row);
    setDraft({ ...defaultsFrom(fields), ...row });
    setOpen(true);
  };

  // Required booleans are valid when false; only truly empty text/select/date values block submit.
  const invalid = fields.some(
    (f) => f.required && !f.formHidden && f.type !== "boolean" && !draft[f.key],
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = () => {
    setSubmitError(null);
    if (invalid) return;
    const values = coerce(fields, draft);
    const onError = (e: Error) => setSubmitError(e.message);
    if (editing) update.mutate({ id: editing["id"], values }, { onSuccess: () => setOpen(false), onError });
    else create.mutate(values, { onSuccess: () => setOpen(false), onError });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t(config.title)}
        description={t(config.description)}
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> {t(config.singular)}
          </Button>
        }
      />

      {extraHeader}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Rechercher…")}
            className="pl-9"
          />
        </div>
        {filterField?.options && (
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("Tous les statuts")}</SelectItem>
              {filterField.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {t(o)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {config.dateFilterKey && (
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("Toutes les échéances")}</SelectItem>
              {DATE_FILTERS.map((o) => (
                <SelectItem key={o} value={o}>
                  {t(o)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <span className="num ms-auto text-xs text-muted-foreground">
          {rows.length} {t("élément(s)")}
        </span>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          title={data && data.length > 0 ? t("Aucun résultat") : t(config.title)}
          description={data && data.length > 0 ? t("Ajustez votre recherche ou vos filtres.") : t(config.emptyDescription)}
          action={
            <Button onClick={openCreate} size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> {t(config.singular)}
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <EntityTable rows={rows} listFields={listFields} refs={refs} onEdit={openEdit} onDelete={setToDelete} />

          {/* Mobile cards */}
          <EntityCards rows={rows} listFields={listFields} refs={refs} onEdit={openEdit} onDelete={setToDelete} />
        </>
      )}

      <EntityDialog
        open={open}
        onOpenChange={setOpen}
        editing={!!editing}
        singularLabel={t(config.singular)}
        fields={fields}
        value={draft}
        onChange={setDraft}
        refs={refs}
        submitError={submitError}
        invalid={invalid}
        pending={create.isPending || update.isPending}
        onSubmit={submit}
        onCancel={() => setOpen(false)}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Supprimer cet élément ?")}</AlertDialogTitle>
            <AlertDialogDescription>{t("Cette action est irréversible.")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Annuler")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) remove.mutate(toDelete["id"]);
                setToDelete(null);
              }}
            >
              {t("Supprimer")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
