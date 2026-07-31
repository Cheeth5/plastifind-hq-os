import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { fundingConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/funding")({
  head: () => ({
    meta: [
      { title: "Financement — PlastiFind OS" },
      { name: "description", content: "Pipeline de subventions, concours et investisseurs pour Labi-Bot V2." },
      { property: "og:title", content: "Financement — PlastiFind OS" },
      { property: "og:description", content: "Pipeline de subventions, concours et investisseurs pour Labi-Bot V2." },
    ],
  }),
  component: () => <EntityManager config={fundingConfig} />,
});
