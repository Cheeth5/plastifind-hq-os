import { createFileRoute } from "@tanstack/react-router";
import {
  LegalHero,
  LegalSection,
  LegalUpdated,
  Placeholder,
  PublicShell,
} from "@/components/public-legal";
import { COMPANY_PLACEHOLDERS, LEGAL_UPDATED } from "@/lib/legal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — PlastiFind" },
      {
        name: "description",
        content:
          "Données collectées par PlastiFind OS, finalités, conservation, droits et contact.",
      },
      { property: "og:title", content: "Politique de confidentialité — PlastiFind" },
      {
        property: "og:description",
        content: "Données, finalités, conservation et droits des utilisateurs.",
      },
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
        eyebrow="PlastiFind — Confidentialité"
        title="Politique de confidentialité"
        description="Quelles données sont traitées dans PlastiFind OS, pourquoi, combien de temps et comment exercer vos droits. Document informatif, sans valeur de conseil juridique."
      />
      <LegalSection id="responsable" title="1. Responsable du traitement">
        <p>
          Le responsable du traitement est {COMPANY_PLACEHOLDERS.legalName},{" "}
          {COMPANY_PLACEHOLDERS.legalForm}, {COMPANY_PLACEHOLDERS.address}. Contact vie privée :{" "}
          {COMPANY_PLACEHOLDERS.contactEmail}.
        </p>
        <Placeholder label="Identité du responsable">
          Renseignez dénomination, adresse et contact DPO avant diffusion externe.
        </Placeholder>
      </LegalSection>
      <LegalSection id="donnees" title="2. Données collectées">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Compte et authentification : e-mail, mot de passe chiffré, téléphone si SMS, journaux de
            connexion.
          </li>
          <li>
            Profil : identité, poste, département, bio, compétences, parcours, liens, photo et
            bannière.
          </li>
          <li>Activité : publications, commentaires, réactions, repartages.</li>
          <li>Messagerie : conversations, messages, pièces jointes, accusés de lecture.</li>
          <li>Fichiers téléversés dans l'espace de stockage privé du projet.</li>
          <li>
            Technique : préférences (thème, langue), état fonctionnel local, journaux de sécurité.
          </li>
        </ul>
      </LegalSection>
      <LegalSection id="finalites" title="3. Finalités">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Fournir l'espace de travail (comptes, profils, projets, tâches, documents).</li>
          <li>Permettre la collaboration (messagerie, publications, notifications).</li>
          <li>Assurer sécurité, accès par rôles et prévention des abus.</li>
        </ul>
        <Placeholder label="Bases légales">À valider avec un conseil juridique.</Placeholder>
      </LegalSection>
      <LegalSection id="cookies" title="4. Cookies et stockage local">
        <p>
          Aucun cookie publicitaire ni mesure d'audience tierce. Uniquement : session Supabase,
          thème, langue, état fonctionnel et brouillons locaux. Détail dans la{" "}
          <a href="/cookies" className="text-primary underline">
            politique cookies
          </a>
          .
        </p>
      </LegalSection>
      <LegalSection id="partage" title="5. Destinataires et sous-traitants">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Membres habilités selon rôles et permissions.</li>
          <li>Supabase (authentification, base, stockage).</li>
          <li>{COMPANY_PLACEHOLDERS.host}.</li>
        </ul>
        <Placeholder label="Sous-traitants">
          Listez hébergeur, e-mail, SMS avec pays et DPA.
        </Placeholder>
      </LegalSection>
      <LegalSection id="conservation" title="6. Conservation et suppression">
        <p>
          Données conservées pendant l'usage du service, puis archivées ou supprimées selon les
          obligations applicables. Export, rectification ou suppression sur demande à{" "}
          {COMPANY_PLACEHOLDERS.contactEmail}.
        </p>
        <Placeholder label="Durées par catégorie">
          À définir avant validation juridique.
        </Placeholder>
      </LegalSection>
      <LegalSection id="droits" title="7. Vos droits">
        <p>
          Accès, rectification, effacement, limitation, opposition, portabilité. Écrivez à{" "}
          {COMPANY_PLACEHOLDERS.contactEmail}. Réclamation possible auprès de la CNIL.
        </p>
      </LegalSection>
      <LegalSection id="securite" title="8. Sécurité">
        <p>
          HTTPS, accès par rôles, politiques Row Level Security, stockage privé avec URLs signées
          temporaires. Signalez tout incident à {COMPANY_PLACEHOLDERS.contactEmail}.
        </p>
      </LegalSection>
      <LegalUpdated date={LEGAL_UPDATED} />
    </PublicShell>
  );
}
