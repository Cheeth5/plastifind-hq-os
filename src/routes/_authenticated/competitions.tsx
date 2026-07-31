import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { competitionsConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/competitions")({
  head: () => ({
    meta: [
      { title: "Concours — PlastiFind OS" },
      { name: "description", content: "Concours robotiques et startup visés par PlastiFind." },
      { property: "og:title", content: "Concours — PlastiFind OS" },
      { property: "og:description", content: "Concours robotiques et startup visés par PlastiFind." },
    ],
  }),
  component: () => <EntityManager config={competitionsConfig} />,
});
