import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/entity-manager";
import { productsConfig } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({
    meta: [
      { title: "Produits — PlastiFind OS" },
      { name: "description", content: "Base produit PlastiFind : Labi-Bot et générations suivantes." },
      { property: "og:title", content: "Produits — PlastiFind OS" },
      { property: "og:description", content: "Base produit PlastiFind : Labi-Bot et générations suivantes." },
    ],
  }),
  component: () => <EntityManager config={productsConfig} />,
});
