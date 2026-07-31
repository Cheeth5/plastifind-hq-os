import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { tasksConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tâches — PlastiFind OS" },
      { name: "description", content: "Gestion des tâches PlastiFind par projet, priorité et échéance." },
      { property: "og:title", content: "Tâches — PlastiFind OS" },
      { property: "og:description", content: "Gestion des tâches PlastiFind par projet, priorité et échéance." },
    ],
  }),
  component: () => <EntityManager config={tasksConfig} />,
});
