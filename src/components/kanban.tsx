import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip, toneFor } from "@/components/ui-kit";
import { useRows, useUpdateRow, dateFR, daysUntil, type Row } from "@/lib/db";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function KanbanBoard({
  table,
  statuses,
  titleKey = "name",
  onEdit,
  onDelete,
  onCreate,
}: {
  table: string;
  statuses: string[];
  titleKey?: string;
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
  onCreate: (status: string) => void;
}) {
  const t = useT();
  const { data } = useRows(table, { order: "deadline", ascending: true });
  const update = useUpdateRow(table);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<string, Row[]> = {};
    for (const s of statuses) g[s] = [];
    for (const row of data ?? []) {
      const s = String(row["status"] ?? statuses[0]);
      (g[s] ??= []).push(row);
    }
    return g;
  }, [data, statuses]);

  const drop = (status: string) => {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const row = (data ?? []).find((r) => String(r["id"]) === id);
    if (!row || row["status"] === status) return;
    update.mutate({ id, values: { status } });
  };

  return (
    <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:px-0">
      {statuses.map((status) => {
        const rows = grouped[status] ?? [];
        return (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status);
            }}
            onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
            onDrop={() => drop(status)}
            className={cn(
              "flex w-[264px] shrink-0 flex-col rounded-xl border border-border bg-surface/60 transition-colors",
              overCol === status && "border-primary/60 bg-primary/5",
            )}
          >
            <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <Chip tone={toneFor(status)}>{t(status)}</Chip>
                <span className="num text-xs text-muted-foreground">{rows.length}</span>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onCreate(status)}>
                <Plus className="h-3.5 w-3.5" />
                <span className="sr-only">{t("Créer")}</span>
              </Button>
            </header>

            <div className="flex min-h-24 flex-1 flex-col gap-2 p-2">
              {rows.length === 0 && (
                <button
                  onClick={() => onCreate(status)}
                  className="rounded-lg border border-dashed border-border px-3 py-6 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  + {t("Créer")}
                </button>
              )}
              {rows.map((row) => {
                const d = daysUntil(row["deadline"]);
                return (
                  <article
                    key={String(row["id"])}
                    draggable
                    onDragStart={() => setDragId(String(row["id"]))}
                    onDragEnd={() => setDragId(null)}
                    className={cn(
                      "group cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
                      dragId === String(row["id"]) && "opacity-50",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <p className="min-w-0 flex-1 text-sm font-medium leading-snug">{String(row[titleKey] ?? "—")}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 ps-5">
                      {row["priority"] && <Chip tone={toneFor(String(row["priority"]))}>{t(String(row["priority"]))}</Chip>}
                      {row["deadline"] && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-medium",
                            d !== null && d < 0 ? "text-destructive" : "text-muted-foreground",
                          )}
                        >
                          <CalendarDays className="h-3 w-3" />
                          {dateFR(row["deadline"])}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between ps-5">
                      <span className="truncate text-[11px] text-muted-foreground">{row["assignee"] ?? ""}</span>
                      <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(row)}>
                          <Pencil className="h-3 w-3" />
                          <span className="sr-only">{t("Modifier")}</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => onDelete(row)}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">{t("Supprimer")}</span>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
