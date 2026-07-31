import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Chip } from "@/components/ui-kit";
import { EntityForm } from "@/components/entity-manager";
import { Button } from "@/components/ui/button";
import { useRows, useUpdateRow } from "@/lib/db";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/company")({
  head: () => ({
    meta: [
      { title: "Entreprise — PlastiFind OS" },
      { name: "description", content: "Identité, mission, vision, valeurs et histoire du fondateur de PlastiFind." },
      { property: "og:title", content: "Entreprise — PlastiFind OS" },
      { property: "og:description", content: "Identité, mission, vision, valeurs et histoire du fondateur de PlastiFind." },
    ],
  }),
  component: Page,
});

const VALUES = ["Durabilité", "Innovation", "Impact réel", "Fiabilité", "Confidentialité", "IA responsable", "Accessibilité", "Collaboration"];

const FIELDS = [
  { key: "legal_name", label: "Dénomination légale" },
  { key: "commercial_name", label: "Nom commercial" },
  { key: "tagline", label: "Slogan" },
  { key: "status", label: "Statut" },
  { key: "legal_structure", label: "Forme juridique" },
  { key: "creation_date", label: "Date de création", type: "date" as const },
  { key: "siren", label: "SIREN" },
  { key: "siret", label: "SIRET" },
  { key: "address", label: "Adresse du siège" },
  { key: "website", label: "Site web" },
  { key: "email", label: "E-mail professionnel" },
  { key: "phone", label: "Téléphone" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "github", label: "GitHub" },
  { key: "mission", label: "Mission", type: "textarea" as const },
  { key: "vision", label: "Vision", type: "textarea" as const },
  { key: "founder_story", label: "Histoire du fondateur", type: "textarea" as const },
  { key: "goals_1y", label: "Objectifs à 1 an", type: "textarea" as const },
  { key: "goals_3y", label: "Objectifs à 3 ans", type: "textarea" as const },
  { key: "goals_5y", label: "Objectifs à 5 ans", type: "textarea" as const },
];

function Page() {
  const { data, isLoading } = useRows("company");
  const update = useUpdateRow("company");
  const company = (data ?? [])[0];
  const [draft, setDraft] = useState<Record<string, any>>({});
  useEffect(() => { if (company) setDraft(company); }, [company]);

  if (isLoading || !company) return <p className="text-sm text-muted-foreground">Chargement du profil entreprise…</p>;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Entreprise"
        description="Profil complet de PlastiFind. Les informations légales sont des espaces réservés jusqu'à l'immatriculation."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const { id, created_at, updated_at, ...values } = draft;
              update.mutate({ id: company["id"], values });
            }}
            disabled={update.isPending}
          >
            Enregistrer
          </Button>
        }
      />
      <div className="panel p-5">
        <EntityForm fields={FIELDS} value={draft} onChange={setDraft} />
      </div>
      <section className="panel p-5">
        <h2 className="text-sm font-bold">Valeurs</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {VALUES.map((v) => <Chip key={v} tone="primary">{v}</Chip>)}
        </div>
      </section>
    </div>
  );
}
