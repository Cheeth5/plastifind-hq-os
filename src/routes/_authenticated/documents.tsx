import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { documentsConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents — PlastiFind OS" },
      { name: "description", content: "Bibliothèque documentaire de PlastiFind avec versions et confidentialité." },
      { property: "og:title", content: "Documents — PlastiFind OS" },
      { property: "og:description", content: "Bibliothèque documentaire de PlastiFind avec versions et confidentialité." },
    ],
  }),
  component: () => <EntityManager config={documentsConfig} />,
});
