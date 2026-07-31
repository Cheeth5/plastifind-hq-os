import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityManager } from "@/components/entity-manager";
import { engineeringConfig, requirementsConfig, componentsConfig, testsConfig, risksConfig, decisionsConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/engineering")({
  head: () => ({
    meta: [
      { title: "Ingénierie — PlastiFind OS" },
      { name: "description", content: "Base de connaissances ingénierie Labi-Bot : fiches, exigences, composants, tests, risques et décisions." },
      { property: "og:title", content: "Ingénierie — PlastiFind OS" },
      { property: "og:description", content: "Base de connaissances ingénierie Labi-Bot : fiches, exigences, composants, tests, risques et décisions." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Tabs defaultValue="records" className="space-y-5">
      <TabsList className="flex w-full flex-wrap justify-start">
        <TabsTrigger value="records">Fiches</TabsTrigger>
        <TabsTrigger value="requirements">Exigences</TabsTrigger>
        <TabsTrigger value="components">Composants</TabsTrigger>
        <TabsTrigger value="tests">Tests</TabsTrigger>
        <TabsTrigger value="risks">Risques</TabsTrigger>
        <TabsTrigger value="decisions">Décisions</TabsTrigger>
      </TabsList>
      <TabsContent value="records"><EntityManager config={engineeringConfig} /></TabsContent>
      <TabsContent value="requirements"><EntityManager config={requirementsConfig} /></TabsContent>
      <TabsContent value="components"><EntityManager config={componentsConfig} /></TabsContent>
      <TabsContent value="tests"><EntityManager config={testsConfig} /></TabsContent>
      <TabsContent value="risks"><EntityManager config={risksConfig} /></TabsContent>
      <TabsContent value="decisions"><EntityManager config={decisionsConfig} /></TabsContent>
    </Tabs>
  );
}
