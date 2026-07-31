import { createFileRoute } from "@tanstack/react-router";
import { createElement } from "react";
import { PageHeader, StatusChip } from "@/components/ui-kit";
import { useRows, useUpdateRow } from "@/lib/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/legal")({
  head: () => ({
    meta: [
      { title: "Juridique & PI — PlastiFind OS" },
      { name: "description", content: "Checklist de création de société, suivi de propriété intellectuelle et conformité RGPD." },
      { property: "og:title", content: "Juridique & PI — PlastiFind OS" },
      { property: "og:description", content: "Checklist de création de société, suivi de propriété intellectuelle et conformité RGPD." },
    ],
  }),
  component: Page,
});

const GROUPS: [string, string][] = [
  ["Création", "Checklist de création de la société"],
  ["PI", "Propriété intellectuelle"],
  ["Confidentialité", "Données personnelles et RGPD"],
];

function Page() {
  const { data } = useRows("legal_items", { order: "sort_order", ascending: true });
  const update = useUpdateRow("legal_items");
  return (
    <div className="space-y-5">
      <PageHeader title="Juridique & propriété intellectuelle" description="Suivi des démarches de création, de la PI et de la conformité." />
      <div className="panel border-warning/30 bg-warning/8 p-4 text-sm">
        Ces éléments sont un outil de suivi et ne constituent pas un conseil juridique. Confirmez chaque étape auprès de
        Pépite, d'un professionnel du droit qualifié et de l'administration compétente.
      </div>
      {GROUPS.map(([kind, title]) => (
        <section key={kind} className="panel overflow-hidden">
          <h2 className="border-b border-border px-4 py-3 text-sm font-bold">{title}</h2>
          <ul className="divide-y divide-border">
            {(data ?? []).filter((i) => i["kind"] === kind).map((item) => (
              <li key={item["id"]} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                <span className="min-w-0 truncate text-sm">{item["title"]}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusChip value={item["status"]} />
                  <Select
                    value={item["status"]}
                    onValueChange={(v) => update.mutate({ id: item["id"], values: { status: v } })}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["À faire", "En cours", "Terminé", "Bloqué"].map((s) => createElement(SelectItem, { key: s, value: s }, s))}
                    </SelectContent>
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
