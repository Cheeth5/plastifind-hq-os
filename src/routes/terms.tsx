import { createFileRoute } from "@tanstack/react-router";
import {
  LegalHero,
  LegalSection,
  LegalUpdated,
  Placeholder,
  PublicShell,
} from "@/components/public-legal";
import { COMPANY_PLACEHOLDERS, LEGAL_UPDATED } from "@/lib/legal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation — PlastiFind" },
      {
        name: "description",
        content: "Conditions d'utilisation de PlastiFind OS : accès, comptes, usages autorisés.",
      },
      { property: "og:title", content: "Conditions d'utilisation — PlastiFind" },
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
        eyebrow="PlastiFind — Conditions"
        title="Conditions d'utilisation"
        description="Règles d'accès et d'usage de PlastiFind OS, espace interne réservé aux membres habilités."
      />
      <LegalSection id="objet" title="1. Objet">
        <p>
          PlastiFind OS est l'espace interne de {COMPANY_PLACEHOLDERS.commercialName} pour le
          pilotage produit, l'ingénierie, le financement et les opérations. L'accès est strictement
          réservé aux comptes autorisés.
        </p>
      </LegalSection>
      <LegalSection id="comptes" title="2. Comptes et sécurité">
        <p>
          Chaque membre est responsable de la confidentialité de ses identifiants et doit signaler
          sans délai tout accès suspect à {COMPANY_PLACEHOLDERS.contactEmail}. Les accès sont
          attribués selon les rôles et peuvent être suspendus en cas d'usage non conforme.
        </p>
      </LegalSection>
      <LegalSection id="usages" title="3. Usages autorisés et interdits">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Ne pas contourner les contrôles d'accès ni les permissions par rôle.</li>
          <li>Ne pas copier, diffuser ou exploiter des contenus internes sans autorisation.</li>
          <li>
            Ne pas téléverser de contenus illicites, malveillants ou portant atteinte aux droits de
            tiers.
          </li>
          <li>Ne pas perturber la disponibilité ou la sécurité du service.</li>
        </ul>
      </LegalSection>
      <LegalSection id="contenus" title="4. Contenus et propriété intellectuelle">
        <p>
          Les contenus publiés restent la propriété de leurs auteurs ou de{" "}
          {COMPANY_PLACEHOLDERS.commercialName} selon les accords applicables. La plateforme, ses
          marques et visuels sont protégés. Toute reproduction non autorisée est interdite.
        </p>
      </LegalSection>
      <LegalSection id="service" title="5. Disponibilité et responsabilité">
        <p>
          Service fourni en l'état, sans garantie d'absence d'interruption. La responsabilité est
          limitée dans les conditions prévues par la loi applicable. Droit applicable : droit
          français, à valider avec un conseil.
        </p>
        <Placeholder label="Droit et juridiction">À faire valider avant diffusion.</Placeholder>
      </LegalSection>
      <LegalUpdated date={LEGAL_UPDATED} />
    </PublicShell>
  );
}
