import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { achievementsConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "Réalisations — PlastiFind OS" },
      { name: "description", content: "Palmarès Robofest, Eurobot et jalons marquants de PlastiFind." },
      { property: "og:title", content: "Réalisations — PlastiFind OS" },
      { property: "og:description", content: "Palmarès Robofest, Eurobot et jalons marquants de PlastiFind." },
    ],
  }),
  component: () => <EntityManager config={achievementsConfig} />,
});
