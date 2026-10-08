import { createFileRoute } from "@tanstack/react-router";
import {
  LegalHero,
  LegalSection,
  LegalUpdated,
  Placeholder,
  PublicShell,
} from "@/components/public-legal";
import { COMPANY_PLACEHOLDERS, LEGAL_UPDATED } from "@/lib/legal";

export const Route = createFileRoute("/legal-notice")({
  head: () => ({
    meta: [
      { title: "Mentions légales — PlastiFind" },
      {
        name: "description",
        content: "Mentions légales de PlastiFind : éditeur, hébergement, contact.",
      },
      { property: "og:title", content: "Mentions légales — PlastiFind" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PublicShell>
      <LegalHero
        eyebrow="PlastiFind — Mentions légales"
        title="Mentions légales"
        description="Identification de l'éditeur de PlastiFind OS et informations requises par la loi pour la confiance."
      />
      <LegalSection id="editeur" title="1. Éditeur">
        <p>
          {COMPANY_PLACEHOLDERS.legalName} — {COMPANY_PLACEHOLDERS.legalForm} —{" "}
          {COMPANY_PLACEHOLDERS.address}. SIREN : {COMPANY_PLACEHOLDERS.siren}. Directeur de la
          publication : {COMPANY_PLACEHOLDERS.publicationDirector}. Contact :{" "}
          {COMPANY_PLACEHOLDERS.contactEmail}.
        </p>
        <Placeholder label="Informations société">
          Aucun SIREN, adresse ou représentant n'est inventé : complétez après immatriculation.
        </Placeholder>
      </LegalSection>
      <LegalSection id="hebergeur" title="2. Hébergement">
        <p>Hébergeur : {COMPANY_PLACEHOLDERS.host}.</p>
        <Placeholder label="Hébergeur">Ajoutez nom et adresse de l'hébergeur.</Placeholder>
      </LegalSection>
      <LegalUpdated date={LEGAL_UPDATED} />
    </PublicShell>
  );
}
