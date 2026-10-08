import { createFileRoute } from "@tanstack/react-router";
import {
  LegalHero,
  LegalSection,
  LegalUpdated,
  Placeholder,
  PublicShell,
} from "@/components/public-legal";
import { COMPANY_PLACEHOLDERS, LEGAL_UPDATED } from "@/lib/legal";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Politique cookies — PlastiFind" },
      {
        name: "description",
        content: "Cookies et stockages utilisés par PlastiFind OS : uniquement le nécessaire.",
      },
      { property: "og:title", content: "Politique cookies — PlastiFind" },
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
        eyebrow="PlastiFind — Cookies"
        title="Politique cookies"
        description="PlastiFind OS n'utilise ni publicité, ni mesure d'audience tierce : uniquement des stockages strictement nécessaires au fonctionnement."
      />
      <LegalSection id="liste" title="1. Ce qui est utilisé">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Session d'authentification (Supabase) — mantener la connexion.</li>
          <li>Préférences : thème (pf-theme), langue (pf-lang).</li>
          <li>Fonctionnel : état de l'interface, brouillons locaux de profil.</li>
        </ul>
      </LegalSection>
      <LegalSection id="choix" title="2. Votre choix">
        <p>
          Le bandeau cookies permet de continuer avec le nécessaire uniquement. Le choix est stocké
          localement (pf-cookie-choice) et modifiable en effaçant les données du site. Sans ces
          stockages nécessaires, la connexion ne peut pas fonctionner.
        </p>
      </LegalSection>
      <LegalUpdated date={LEGAL_UPDATED} />
    </PublicShell>
  );
}
