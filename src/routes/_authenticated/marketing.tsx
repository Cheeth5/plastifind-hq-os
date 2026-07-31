import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { marketingConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing — PlastiFind OS" },
      { name: "description", content: "Calendrier de contenu et campagnes PlastiFind." },
      { property: "og:title", content: "Marketing — PlastiFind OS" },
      { property: "og:description", content: "Calendrier de contenu et campagnes PlastiFind." },
    ],
  }),
  component: () => <EntityManager config={marketingConfig} />,
});
