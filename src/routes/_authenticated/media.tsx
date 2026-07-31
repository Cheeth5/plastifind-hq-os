import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { mediaConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/media")({
  head: () => ({
    meta: [
      { title: "Médias — PlastiFind OS" },
      { name: "description", content: "Photothèque produit, tests terrain et éléments de marque PlastiFind." },
      { property: "og:title", content: "Médias — PlastiFind OS" },
      { property: "og:description", content: "Photothèque produit, tests terrain et éléments de marque PlastiFind." },
    ],
  }),
  component: () => <EntityManager config={mediaConfig} />,
});
