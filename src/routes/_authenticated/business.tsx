import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityManager } from "@/components/entity-manager";
import { competitorsConfig } from "@/lib/entities";
import { PageHeader } from "@/components/ui-kit";
import { useRows, useUpdateRow } from "@/lib/db";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/business")({
  head: () => ({
    meta: [
      { title: "Business — PlastiFind OS" },
      { name: "description", content: "Business Model Canvas, Lean Canvas, SWOT et veille concurrentielle de PlastiFind." },
      { property: "og:title", content: "Business — PlastiFind OS" },
      { property: "og:description", content: "Business Model Canvas, Lean Canvas, SWOT et veille concurrentielle de PlastiFind." },
    ],
  }),
  component: Page,
});

function CanvasGrid({ canvas }: { canvas: string }) {
  const { data, isLoading } = useRows("business_canvas", { order: "created_at", ascending: true });
  const update = useUpdateRow("business_canvas");
  const rows = (data ?? []).filter((r) => r["canvas"] === canvas);
  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground">Aucune section renseignée pour ce canevas.</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => (
        <div key={r["id"]} className="panel p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{r["section"]}</p>
          <Textarea
            className="mt-2 min-h-28 border-none bg-transparent px-0 focus-visible:ring-0"
            defaultValue={r["content"] ?? ""}
            onBlur={(e) => {
              if (e.target.value !== (r["content"] ?? ""))
                update.mutate({ id: r["id"], values: { content: e.target.value } });
            }}
          />
        </div>
      ))}
    </div>
  );
}

function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Business"
        description="Canevas stratégiques éditables, analyse SWOT et veille concurrentielle. Cliquez dans un bloc pour l'éditer."
      />
      <Tabs defaultValue="bmc" className="space-y-5">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="bmc">Business Model Canvas</TabsTrigger>
          <TabsTrigger value="lean">Lean Canvas</TabsTrigger>
          <TabsTrigger value="swot">SWOT</TabsTrigger>
          <TabsTrigger value="competitors">Concurrents</TabsTrigger>
        </TabsList>
        <TabsContent value="bmc"><CanvasGrid canvas="BMC" /></TabsContent>
        <TabsContent value="lean"><CanvasGrid canvas="LEAN" /></TabsContent>
        <TabsContent value="swot"><CanvasGrid canvas="SWOT" /></TabsContent>
        <TabsContent value="competitors"><EntityManager config={competitorsConfig} /></TabsContent>
      </Tabs>
    </div>
  );
}
