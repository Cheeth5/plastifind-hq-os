import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { meetingsConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({
    meta: [
      { title: "Réunions — PlastiFind OS" },
      { name: "description", content: "Comptes rendus structurés des réunions PlastiFind." },
      { property: "og:title", content: "Réunions — PlastiFind OS" },
      { property: "og:description", content: "Comptes rendus structurés des réunions PlastiFind." },
    ],
  }),
  component: () => <EntityManager config={meetingsConfig} />,
});
