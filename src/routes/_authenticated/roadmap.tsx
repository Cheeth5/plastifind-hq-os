import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { milestonesConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — PlastiFind OS" },
      { name: "description", content: "Jalons entreprise, produit, financement et université de PlastiFind." },
      { property: "og:title", content: "Roadmap — PlastiFind OS" },
      { property: "og:description", content: "Jalons entreprise, produit, financement et université de PlastiFind." },
    ],
  }),
  component: () => <EntityManager config={milestonesConfig} />,
});
