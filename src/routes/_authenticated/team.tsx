import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityManager } from "@/components/entity-manager";
import { teamConfig, jobRolesConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Équipe — PlastiFind OS" },
      { name: "description", content: "Membres de l’équipe et pipeline de recrutement PlastiFind." },
      { property: "og:title", content: "Équipe — PlastiFind OS" },
      { property: "og:description", content: "Membres de l’équipe et pipeline de recrutement PlastiFind." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Tabs defaultValue="members" className="space-y-5">
      <TabsList className="flex w-full flex-wrap justify-start">
        <TabsTrigger value="members">Membres</TabsTrigger>
        <TabsTrigger value="hiring">Recrutement</TabsTrigger>
      </TabsList>
      <TabsContent value="members"><EntityManager config={teamConfig} /></TabsContent>
      <TabsContent value="hiring"><EntityManager config={jobRolesConfig} /></TabsContent>
    </Tabs>
  );
}
