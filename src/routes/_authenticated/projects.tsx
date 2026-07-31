import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { projectsConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Projets — PlastiFind OS" },
      { name: "description", content: "Portefeuille de projets PlastiFind : société, financement, produit et commercialisation." },
      { property: "og:title", content: "Projets — PlastiFind OS" },
      { property: "og:description", content: "Portefeuille de projets PlastiFind : société, financement, produit et commercialisation." },
    ],
  }),
  component: () => <EntityManager config={projectsConfig} />,
});
