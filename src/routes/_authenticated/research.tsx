import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { researchConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({
    meta: [
      { title: "Recherche — PlastiFind OS" },
      { name: "description", content: "Veille technique, réglementaire et marché en robotique environnementale." },
      { property: "og:title", content: "Recherche — PlastiFind OS" },
      { property: "og:description", content: "Veille technique, réglementaire et marché en robotique environnementale." },
    ],
  }),
  component: () => <EntityManager config={researchConfig} />,
});
