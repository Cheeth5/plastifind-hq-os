import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityManager } from "@/components/entity-manager";
import { expensesConfig, componentsConfig } from "@/lib/entities";
import { PageHeader, StatCard } from "@/components/ui-kit";
import { useRows, eur } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({
    meta: [
      { title: "Finance — PlastiFind OS" },
      { name: "description", content: "Dépenses, budgets et calculateur de coût du prototype Labi-Bot V2." },
      { property: "og:title", content: "Finance — PlastiFind OS" },
      { property: "og:description", content: "Dépenses, budgets et calculateur de coût du prototype Labi-Bot V2." },
    ],
  }),
  component: Page,
});

function Page() {
  const expenses = useRows("expenses");
  const budgets = useRows("budgets");
  const components = useRows("components");

  const spent = (expenses.data ?? []).reduce((s, e) => s + Number(e["amount"] ?? 0), 0);
  const planned = (budgets.data ?? []).reduce((s, b) => s + Number(b["planned"] ?? 0), 0);
  const bom = (components.data ?? []).reduce((s, c) => s + Number(c["unit_price"] ?? 0) * Number(c["quantity"] ?? 1), 0);
  const contingency = bom * 0.15;

  return (
    <div className="space-y-5">
      <PageHeader title="Finance" description="Trésorerie, dépenses, budgets et estimation du coût du prototype." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Budget planifié" value={eur(planned)} />
        <StatCard label="Dépenses réalisées" value={eur(spent)} tone="danger" />
        <StatCard label="Budget restant" value={eur(planned - spent)} tone="success" />
        <StatCard label="Coût BOM V2 estimé" value={eur(bom + contingency)} hint="Nomenclature + 15 % d'aléas" />
      </div>
      <Tabs defaultValue="expenses" className="space-y-5">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          <TabsTrigger value="bom">Coût prototype (BOM)</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses"><EntityManager config={expensesConfig} /></TabsContent>
        <TabsContent value="bom"><EntityManager config={componentsConfig} /></TabsContent>
      </Tabs>
    </div>
  );
}
