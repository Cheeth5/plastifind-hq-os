import { useMemo, useState, type ReactNode } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
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
import { useCreateRow, useDeleteRow, useRows, useUpdateRow, dateFR, eur, type Row } from "@/lib/db";
import { cn } from "@/lib/utils";

export type FieldType = "text" | "textarea" | "number" | "date" | "datetime" | "select" | "currency" | "boolean";

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
};

export type EntityConfig = {
  table: string;
  title: string;
  description: string;
  singular: string;
  fields: Field[];
  searchKeys?: string[];
  filterKey?: string;
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

export function renderCell(field: Field, row: Row): ReactNode {
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
  if (field.type === "currency") return <span className="num">{eur(v)}</span>;
  if (field.type === "date" || field.type === "datetime") return <span className="num">{dateFR(v)}</span>;
  if (field.type === "boolean") return v ? "Oui" : "Non";
  if (field.type === "number") return <span className="num">{v}</span>;
  return <span className="line-clamp-2">{String(v)}</span>;
}

export function EntityForm({
  fields,
  value,
  onChange,
}: {
  fields: Field[];
  value: Row;
  onChange: (v: Row) => void;
}) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields
        .filter((f) => !f.formHidden)
        .map((f) => (
          <div key={f.key} className={cn("grid gap-1.5", f.type === "textarea" && "sm:col-span-2", f.className)}>
            <Label htmlFor={f.key} className="text-xs font-semibold text-muted-foreground">
              {f.label}
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
            ) : f.type === "select" ? (
              <Select value={value[f.key] || undefined} onValueChange={(v) => set(f.key, v)}>
                <SelectTrigger id={f.key}>
                  <SelectValue placeholder="Sélectionner…" />
                </SelectTrigger>
                <SelectContent>
                  {(f.options ?? []).map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
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
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={f.key}
                type={f.type === "date" ? "date" : f.type === "number" || f.type === "currency" ? "number" : "text"}
                step={f.type === "currency" ? "0.01" : undefined}
                value={
                  f.type === "date" && value[f.key] ? String(value[f.key]).slice(0, 10) : (value[f.key] ?? "")
                }
                placeholder={f.placeholder}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
    </div>
  );
}

export function EntityManager({ config, extraHeader }: { config: EntityConfig; extraHeader?: ReactNode }) {
  const { table, fields } = config;
  const { data, isLoading } = useRows(table, {
    order: config.defaultOrder?.column ?? "created_at",
    ascending: config.defaultOrder?.ascending ?? false,
  });
  const create = useCreateRow(table);
  const update = useUpdateRow(table);
  const remove = useDeleteRow(table);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>(defaultsFrom(fields));
  const [toDelete, setToDelete] = useState<Row | null>(null);

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
    return r;
  }, [data, query, filter, config.filterKey, searchKeys]);

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

  const submit = () => {
    const missing = fields.find((f) => f.required && !f.formHidden && !draft[f.key]);
    if (missing) {
      setDraft({ ...draft });
      return;
    }
    const values = coerce(fields, draft);
    if (editing) update.mutate({ id: editing['id'], values }, { onSuccess: () => setOpen(false) });
    else create.mutate(values, { onSuccess: () => setOpen(false) });
  };

  const invalid = fields.some((f) => f.required && !f.formHidden && !draft[f.key]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> {config.singular}
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
            placeholder="Rechercher…"
            className="pl-9"
          />
        </div>
        {filterField?.options && (
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {filterField.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <span className="num ml-auto text-xs text-muted-foreground">{rows.length} élément(s)</span>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          title={data && data.length > 0 ? "Aucun résultat" : `Aucun élément dans ${config.title.toLowerCase()}`}
          description={data && data.length > 0 ? "Ajustez votre recherche ou vos filtres." : config.emptyDescription}
          action={
            <Button onClick={openCreate} size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> {config.singular}
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="panel hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {listFields.map((f) => (
                    <th
                      key={f.key}
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {f.label}
                    </th>
                  ))}
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row['id']} className="group transition-colors hover:bg-accent/40">
                    {listFields.map((f, i) => (
                      <td key={f.key} className={cn("px-4 py-3 align-middle", i === 0 && "font-medium")}>
                        {renderCell(f, row)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(row)}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setToDelete(row)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <div key={row['id']} className="panel p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 truncate font-semibold">{String(row[listFields[0]?.key ?? "id"] ?? "—")}</p>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(row)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setToDelete(row)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <dl className="mt-3 grid gap-2">
                  {listFields.slice(1).map((f) => (
                    <div key={f.key} className="flex items-center justify-between gap-3 text-sm">
                      <dt className="shrink-0 text-xs text-muted-foreground">{f.label}</dt>
                      <dd className="min-w-0 text-right">{renderCell(f, row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier" : "Nouveau"} — {config.singular.replace(/^(Ajouter|Nouveau|Nouvelle)\s*/i, "")}
            </DialogTitle>
            <DialogDescription>Les champs marqués d'une astérisque sont obligatoires.</DialogDescription>
          </DialogHeader>
          <EntityForm fields={fields} value={draft} onChange={setDraft} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={invalid || create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive et ne peut pas être annulée.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) remove.mutate(toDelete['id']);
                setToDelete(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
