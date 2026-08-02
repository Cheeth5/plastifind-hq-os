import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutList, Columns3, Plus } from "lucide-react";
import { EntityManager, EntityForm, useRefMaps } from "@/components/entity-manager";
import { KanbanBoard } from "@/components/kanban";
import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
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
import { tasksConfig, TASK_STATUS } from "@/lib/entities";
import { useCreateRow, useDeleteRow, useUpdateRow, type Row } from "@/lib/db";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tâches — PlastiFind OS" },
      { name: "description", content: "Gestion des tâches PlastiFind par projet, priorité et échéance." },
      { property: "og:title", content: "Tâches — PlastiFind OS" },
      { property: "og:description", content: "Gestion des tâches PlastiFind par projet, priorité et échéance." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const t = useT();
  const [view, setView] = useState<"board" | "list">("board");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>({});
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const refs = useRefMaps(tasksConfig.fields);
  const create = useCreateRow("tasks");
  const update = useUpdateRow("tasks");
  const remove = useDeleteRow("tasks");

  const startCreate = (status: string) => {
    setEditing(null);
    setDraft({ status, priority: "Moyenne" });
    setOpen(true);
  };

  const save = () => {
    if (!draft["name"]) return;
    const values: Row = {};
    for (const f of tasksConfig.fields) {
      const raw = draft[f.key];
      values[f.key] = f.type === "number" ? (raw === "" || raw == null ? null : Number(raw)) : raw === "" ? null : (raw ?? null);
    }
    if (editing) update.mutate({ id: editing["id"], values }, { onSuccess: () => setOpen(false) });
    else create.mutate(values, { onSuccess: () => setOpen(false) });
  };

  const toggle = (
    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
      {(["board", "list"] as const).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
            view === v ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {v === "board" ? <Columns3 className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
          {v === "board" ? t("Tableau") : t("Liste")}
        </button>
      ))}
    </div>
  );

  if (view === "list") {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">{toggle}</div>
        <EntityManager config={tasksConfig} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t(tasksConfig.title)}
        description={t("Glissez une carte pour changer son statut.")}
        actions={
          <div className="flex items-center gap-2">
            {toggle}
            <Button size="sm" onClick={() => startCreate("À faire")}>
              <Plus className="mr-1.5 h-4 w-4" /> {t(tasksConfig.singular)}
            </Button>
          </div>
        }
      />

      <KanbanBoard
        table="tasks"
        statuses={TASK_STATUS}
        titleKey="name"
        onCreate={startCreate}
        onEdit={(row) => {
          setEditing(row);
          setDraft({ ...row });
          setOpen(true);
        }}
        onDelete={setToDelete}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("Modifier") : t("Nouvelle tâche")}</DialogTitle>
            <DialogDescription>Les champs marqués d'une astérisque sont obligatoires.</DialogDescription>
          </DialogHeader>
          <EntityForm fields={tasksConfig.fields} value={draft} onChange={setDraft} refs={refs} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("Annuler")}
            </Button>
            <Button onClick={save} disabled={!draft["name"] || create.isPending || update.isPending}>
              {t("Enregistrer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
