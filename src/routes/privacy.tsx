import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — PlastiFind OS" },
      { name: "description", content: "Comment PlastiFind OS collecte, utilise et protège vos données personnelles (RGPD)." },
      { property: "og:title", content: "Politique de confidentialité — PlastiFind OS" },
      { property: "og:description", content: "Données collectées, finalités, durée de conservation et vos droits RGPD." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      kicker="Données & RGPD"
      title="Politique de confidentialité"
      updated="6 octobre 2026"
      intro="Nous collectons uniquement les données nécessaires au fonctionnement de l'espace de travail PlastiFind, et nous les protégeons conformément au RGPD."
      sections={[
        { title: "Données collectées", body: ["Identité : prénom, nom, e-mail, date de naissance, genre (facultatif), rôle dans l'entreprise.", "Activité : messages, fichiers partagés, tâches, commentaires et statut de présence."] },
        { title: "Finalités", body: ["Faire fonctionner la plateforme : connexion, collaboration, gestion des projets.", "Sécuriser l'accès selon les rôles et prévenir les usages abusifs."] },
        { title: "Base légale", body: ["Exécution de la relation de travail ou de collaboration, et intérêt légitime de PlastiFind à organiser son activité."] },
        { title: "Partage", body: ["Vos données ne sont jamais vendues. Elles sont hébergées par notre prestataire d'infrastructure dans un cadre sécurisé.", "Seuls les membres autorisés y accèdent, selon leurs permissions."] },
        { title: "Durée de conservation", body: ["Les données sont conservées pendant la durée de votre collaboration avec PlastiFind, puis supprimées ou anonymisées sous 12 mois."] },
        { title: "Vos droits", body: ["Vous pouvez accéder, rectifier, effacer ou exporter vos données, et vous opposer à certains traitements.", "Vous pouvez aussi saisir la CNIL si vous estimez vos droits non respectés."] },
        { title: "Cookies", body: ["Nous utilisons uniquement des stockages techniques nécessaires (session, thème, langue). Aucun traceur publicitaire."] },
      ]}
    />
  ),
});
