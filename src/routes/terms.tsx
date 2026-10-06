import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation — PlastiFind OS" },
      { name: "description", content: "Conditions générales d'utilisation de PlastiFind OS, l'espace de travail interne de PlastiFind." },
      { property: "og:title", content: "Conditions d'utilisation — PlastiFind OS" },
      { property: "og:description", content: "Règles d'accès et d'usage de la plateforme interne PlastiFind OS." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      kicker="Cadre légal"
      title="Conditions d'utilisation"
      updated="6 octobre 2026"
      intro="PlastiFind OS est l'espace de travail interne de PlastiFind, startup de robotique environnementale. En accédant à la plateforme, vous acceptez les conditions ci-dessous."
      sections={[
        { title: "Accès à la plateforme", body: ["L'accès est réservé aux membres de l'équipe, partenaires et invités autorisés par PlastiFind.", "Chaque compte est personnel. Vous êtes responsable de la confidentialité de vos identifiants."] },
        { title: "Rôles et autorisations", body: ["Les fonctionnalités disponibles dépendent du rôle attribué (ingénieur, designer, finance, etc.).", "Toute tentative de contourner les permissions est interdite et peut entraîner la suspension du compte."] },
        { title: "Confidentialité des informations", body: ["Les données techniques, financières et stratégiques (dont le robot Labi-Bot) sont confidentielles.", "Il est interdit de les partager hors de PlastiFind sans accord écrit préalable."] },
        { title: "Propriété intellectuelle", body: ["Les travaux réalisés dans le cadre de PlastiFind (code, designs, modèles 3D, documents) restent la propriété de PlastiFind, sauf accord contraire."] },
        { title: "Usage acceptable", body: ["Pas de contenu illégal, offensant ou malveillant dans les messages, fichiers ou commentaires.", "Les fichiers partagés doivent être exempts de virus et respecter les droits d'auteur."] },
        { title: "Disponibilité et responsabilité", body: ["La plateforme est fournie « en l'état ». Nous faisons de notre mieux pour assurer sa disponibilité, sans garantie absolue.", "PlastiFind ne saurait être tenue responsable des pertes indirectes liées à une interruption de service."] },
        { title: "Modifications", body: ["Ces conditions peuvent évoluer. Les changements importants seront annoncés dans la plateforme."] },
      ]}
    />
  ),
});
