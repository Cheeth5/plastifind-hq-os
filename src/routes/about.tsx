import { createFileRoute } from "@tanstack/react-router";
import { LegalHero, LegalSection, LegalUpdated, PublicShell } from "@/components/public-legal";
import { LEGAL_UPDATED } from "@/lib/legal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — PlastiFind" },
      {
        name: "description",
        content: "PlastiFind : robotique environnementale autonome, Labi-Bot et espace OS.",
      },
      { property: "og:title", content: "À propos — PlastiFind" },
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
        eyebrow="PlastiFind — Robotique environnementale"
        title="À propos de PlastiFind"
        description="PlastiFind développe des solutions robotiques autonomes pour protéger l'environnement, autour de Labi-Bot, robot de détection et de collecte des déchets."
      />
      <LegalSection id="mission" title="Mission">
        <p>
          Concevoir une robotique fiable, utile et sobre pour les espaces publics et littoraux :
          perception, navigation autonome et opérations pilotées depuis PlastiFind OS.
        </p>
      </LegalSection>
      <LegalSection id="os" title="PlastiFind OS">
        <p>
          PlastiFind OS est l'espace interne qui centralise stratégie, ingénierie, financement et
          opérations. L'accès est réservé aux membres habilités.
        </p>
      </LegalSection>
      <LegalUpdated date={LEGAL_UPDATED} />
    </PublicShell>
  );
}
