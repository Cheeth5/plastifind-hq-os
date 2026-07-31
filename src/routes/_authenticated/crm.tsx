import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityManager } from "@/components/entity-manager";
import { contactsConfig, organizationsConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/crm")({
  head: () => ({
    meta: [
      { title: "CRM — PlastiFind OS" },
      { name: "description", content: "Contacts, organisations et pipeline commercial de PlastiFind." },
      { property: "og:title", content: "CRM — PlastiFind OS" },
      { property: "og:description", content: "Contacts, organisations et pipeline commercial de PlastiFind." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Tabs defaultValue="contacts" className="space-y-5">
      <TabsList className="flex w-full flex-wrap justify-start">
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
        <TabsTrigger value="orgs">Organisations</TabsTrigger>
      </TabsList>
      <TabsContent value="contacts"><EntityManager config={contactsConfig} /></TabsContent>
      <TabsContent value="orgs"><EntityManager config={organizationsConfig} /></TabsContent>
    </Tabs>
  );
}
