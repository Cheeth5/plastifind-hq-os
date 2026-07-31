import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { universityConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/university")({
  head: () => ({
    meta: [
      { title: "Université — PlastiFind OS" },
      { name: "description", content: "Cours, examens et actions SNEE à l’UBO." },
      { property: "og:title", content: "Université — PlastiFind OS" },
      { property: "og:description", content: "Cours, examens et actions SNEE à l’UBO." },
    ],
  }),
  component: () => <EntityManager config={universityConfig} />,
});
