import type { EntityConfig } from "@/components/entity-manager";

const STATUS_PROJECT = ["Idée", "Planifié", "En cours", "Bloqué", "Revue", "Terminé", "Annulé"];
const PRIORITIES = ["Critique", "Haute", "Moyenne", "Basse"];
export const TASK_STATUS = ["Backlog", "À faire", "En cours", "En attente", "Revue", "Terminé", "Annulé"];

export const projectsConfig: EntityConfig = {
  table: "projects",
  title: "Projets",
  description: "Portefeuille de projets PlastiFind : création de société, financement, produit et commercialisation.",
  singular: "Nouveau projet",
  filterKey: "status",
  defaultOrder: { column: "target_date", ascending: true },
  emptyDescription:
    "Les projets structurent votre travail en chantiers pilotables. Créez votre premier projet, par exemple « Création de la société PlastiFind ».",
  fields: [
    { key: "name", label: "Nom du projet", required: true, list: true },
    { key: "status", label: "Statut", type: "select", options: STATUS_PROJECT, chip: true, list: true },
    { key: "priority", label: "Priorité", type: "select", options: PRIORITIES, chip: true, list: true },
    { key: "owner", label: "Responsable", list: true },
    { key: "progress", label: "Avancement (%)", type: "number", progress: true, list: true },
    { key: "target_date", label: "Échéance", type: "date", list: true },
    { key: "start_date", label: "Date de début", type: "date" },
    { key: "budget", label: "Budget", type: "currency" },
    { key: "objective", label: "Objectif", type: "textarea" },
  ],
};

export const tasksConfig: EntityConfig = {
  table: "tasks",
  title: "Tâches",
  description: "Toutes les tâches opérationnelles, par projet, priorité et échéance.",
  singular: "Nouvelle tâche",
  filterKey: "status",
  defaultOrder: { column: "deadline", ascending: true },
  emptyDescription:
    "Aucune tâche pour l'instant. Ajoutez les prochaines actions concrètes : pitch deck, business plan, dossier de financement.",
  fields: [
    { key: "name", label: "Tâche", required: true, list: true },
    { key: "status", label: "Statut", type: "select", options: TASK_STATUS, chip: true, list: true },
    { key: "priority", label: "Priorité", type: "select", options: PRIORITIES, chip: true, list: true },
    { key: "assignee", label: "Assigné à", list: true },
    { key: "deadline", label: "Échéance", type: "date", list: true },
    { key: "category", label: "Catégorie", list: true },
    { key: "estimated_effort", label: "Charge estimée (h)", type: "number" },
    { key: "actual_effort", label: "Charge réelle (h)", type: "number" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const milestonesConfig: EntityConfig = {
  table: "milestones",
  title: "Roadmap",
  description: "Jalons de l'entreprise, du produit, du financement et de l'université, par horizon.",
  singular: "Nouveau jalon",
  filterKey: "category",
  defaultOrder: { column: "date", ascending: true },
  emptyDescription:
    "La roadmap réunit les jalons majeurs de PlastiFind. Ajoutez un premier jalon, par exemple « Création juridique de PlastiFind ».",
  fields: [
    { key: "title", label: "Jalon", required: true, list: true },
    {
      key: "category",
      label: "Catégorie",
      type: "select",
      options: ["Entreprise", "Produit", "Ingénierie", "Financement", "Ventes", "Marketing", "Juridique", "Équipe", "Concours", "Université"],
      chip: true,
      list: true,
    },
    { key: "horizon", label: "Horizon", type: "select", options: ["30 jours", "90 jours", "12 mois", "3 ans"], list: true },
    { key: "date", label: "Date cible", type: "date", list: true },
    { key: "status", label: "Statut", type: "select", options: ["Planifié", "En cours", "Terminé", "Bloqué"], chip: true, list: true },
    { key: "progress", label: "Avancement (%)", type: "number", progress: true, list: true },
    { key: "owner", label: "Responsable" },
    { key: "dependencies", label: "Dépendances" },
    { key: "evidence", label: "Preuve / livrable", type: "textarea" },
  ],
};

export const fundingConfig: EntityConfig = {
  table: "funding_opportunities",
  title: "Financement",
  description: "Subventions, concours, prêts et investisseurs : pipeline complet de financement de Labi-Bot V2.",
  singular: "Nouvelle opportunité",
  filterKey: "status",
  defaultOrder: { column: "deadline", ascending: true },
  emptyDescription:
    "Aucune opportunité de financement pour l'instant. Ajoutez des subventions, concours, sponsors ou investisseurs pour construire votre pipeline.",
  fields: [
    { key: "program_name", label: "Programme", required: true, list: true },
    { key: "organization", label: "Organisme", list: true },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["Subvention", "Prix de concours", "Investissement", "Prêt", "Sponsoring", "Aide matérielle", "Incubation", "Aide universitaire", "Programme européen"],
      list: true,
    },
    { key: "amount", label: "Montant", type: "currency", list: true },
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: ["Recherche", "Éligible", "Non éligible", "À préparer", "Brouillon", "Soumis", "Entretien", "Accepté", "Rejeté", "En attente"],
      chip: true,
      list: true,
    },
    { key: "deadline", label: "Date limite", type: "date", list: true },
    { key: "probability", label: "Probabilité (%)", type: "number", progress: true, list: true },
    { key: "region", label: "Région" },
    { key: "link", label: "Lien" },
    { key: "owner", label: "Responsable" },
    { key: "next_action", label: "Prochaine action" },
    { key: "company_required", label: "Société requise", type: "boolean" },
    { key: "prototype_required", label: "Prototype requis", type: "boolean" },
    { key: "eligibility", label: "Éligibilité", type: "textarea" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const contactsConfig: EntityConfig = {
  table: "contacts",
  title: "CRM — Contacts",
  description: "Clients, partenaires pilotes, mentors, financeurs, incubateurs, fournisseurs et médias.",
  singular: "Nouveau contact",
  filterKey: "stage",
  emptyDescription:
    "Aucun contact enregistré. Ajoutez les communes, gestionnaires de plages, mentors et financeurs que vous souhaitez suivre.",
  fields: [
    { key: "full_name", label: "Nom", required: true, list: true },
    { key: "organization_name", label: "Organisation", list: true },
    { key: "role", label: "Fonction", list: true },
    {
      key: "stage",
      label: "Étape",
      type: "select",
      options: ["Identifié", "Contact planifié", "Contacté", "Rendez-vous planifié", "Qualifié", "Proposition", "Négociation", "Pilote", "Partenaire", "Perdu"],
      chip: true,
      list: true,
    },
    { key: "category", label: "Catégorie", list: true },
    { key: "email", label: "E-mail", list: true },
    { key: "phone", label: "Téléphone" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "owner", label: "Responsable" },
    { key: "next_action", label: "Prochaine action" },
    { key: "last_interaction", label: "Dernière interaction", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const organizationsConfig: EntityConfig = {
  table: "organizations",
  title: "CRM — Organisations",
  description: "Collectivités, financeurs, incubateurs et universités suivis par PlastiFind.",
  singular: "Nouvelle organisation",
  filterKey: "type",
  emptyDescription: "Ajoutez les organisations cibles : communes littorales, incubateurs, financeurs, universités.",
  fields: [
    { key: "name", label: "Organisation", required: true, list: true },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["Collectivité", "Organisme public", "Accompagnement", "Financeur", "Université", "Incubateur", "Entreprise", "Média", "Fournisseur"],
      chip: true,
      list: true,
    },
    { key: "city", label: "Ville", list: true },
    { key: "country", label: "Pays", list: true },
    { key: "relevance", label: "Pertinence", type: "select", options: ["Élevée", "Moyenne", "Faible"], chip: true, list: true },
    { key: "relationship", label: "Relation", list: true },
    { key: "website", label: "Site web" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const expensesConfig: EntityConfig = {
  table: "expenses",
  title: "Dépenses",
  description: "Suivi des dépenses par catégorie, projet et fournisseur.",
  singular: "Nouvelle dépense",
  filterKey: "category",
  defaultOrder: { column: "date", ascending: false },
  emptyDescription:
    "Aucune dépense enregistrée. Suivez les achats de composants, frais juridiques, déplacements et abonnements pour piloter votre trésorerie.",
  fields: [
    { key: "description", label: "Description", required: true, list: true },
    {
      key: "category",
      label: "Catégorie",
      type: "select",
      options: ["Composants", "Fabrication", "Logiciel", "Juridique", "Comptabilité", "Marketing", "Déplacements", "Concours", "Assurance", "Bureau", "Prototypage", "Abonnements"],
      chip: true,
      list: true,
    },
    { key: "supplier", label: "Fournisseur", list: true },
    { key: "amount", label: "Montant", type: "currency", list: true },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "status", label: "Statut", type: "select", options: ["Payé", "À payer", "Remboursé"], chip: true, list: true },
    { key: "tax", label: "TVA", type: "currency" },
    { key: "payment_method", label: "Moyen de paiement", type: "select", options: ["Carte", "Virement", "Espèces", "Prélèvement"] },
    { key: "reimbursable", label: "Remboursable", type: "boolean" },
    { key: "receipt_url", label: "Lien du justificatif" },
  ],
};

export const meetingsConfig: EntityConfig = {
  table: "meetings",
  title: "Réunions",
  description: "Comptes rendus structurés : contexte, objectifs, décisions et actions.",
  singular: "Nouvelle réunion",
  filterKey: "type",
  defaultOrder: { column: "date", ascending: false },
  emptyDescription:
    "Aucune réunion enregistrée. Documentez vos échanges avec les mentors, financeurs et collectivités pour ne perdre aucune décision.",
  fields: [
    { key: "title", label: "Titre", required: true, list: true },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "organization", label: "Organisation", list: true },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["Mentor", "Investisseur", "Financement", "Client", "Fournisseur", "Équipe", "Université", "Juridique", "Technique", "Concours"],
      chip: true,
      list: true,
    },
    {
      key: "preparation_status",
      label: "Préparation",
      type: "select",
      options: ["À préparer", "En préparation", "Prêt", "Terminé"],
      chip: true,
      list: true,
    },
    { key: "participants", label: "Participants" },
    { key: "objective", label: "Objectif", type: "textarea" },
    { key: "agenda", label: "Ordre du jour", type: "textarea" },
    { key: "notes", label: "Notes de discussion", type: "textarea" },
    { key: "decisions", label: "Décisions", type: "textarea" },
    { key: "next_meeting", label: "Prochaine réunion", type: "date" },
  ],
};

export const documentsConfig: EntityConfig = {
  table: "documents",
  title: "Documents",
  description: "Bibliothèque documentaire structurée avec versions et niveaux de confidentialité.",
  singular: "Nouveau document",
  filterKey: "category",
  emptyDescription:
    "Aucun document. Centralisez pitch deck, business plan, spécifications, certificats et documents juridiques.",
  fields: [
    { key: "title", label: "Titre", required: true, list: true },
    {
      key: "category",
      label: "Catégorie",
      type: "select",
      options: ["Pitch deck", "Business plan", "Résumé exécutif", "Manuel technique", "Spécification produit", "Prévisionnel financier", "Dossier de financement", "Juridique", "Contrats", "Certificats", "Documents de concours", "Marketing", "Factures", "Assurance", "Immigration", "Université", "Autre"],
      chip: true,
      list: true,
    },
    { key: "version", label: "Version", list: true },
    { key: "status", label: "Statut", type: "select", options: ["Brouillon", "En revue", "Validé", "Obsolète"], chip: true, list: true },
    {
      key: "confidentiality",
      label: "Confidentialité",
      type: "select",
      options: ["Public", "Interne", "Confidentiel", "Restreint"],
      chip: true,
      list: true,
    },
    { key: "owner", label: "Responsable", list: true },
    { key: "file_url", label: "Lien du fichier" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const engineeringConfig: EntityConfig = {
  table: "engineering_records",
  title: "Ingénierie",
  description: "Base de connaissances technique : spécifications, architectures, expérimentations et décisions.",
  singular: "Nouvelle fiche",
  filterKey: "discipline",
  emptyDescription:
    "Aucune fiche d'ingénierie. Documentez architectures, expérimentations, rapports de test et décisions de conception de Labi-Bot.",
  fields: [
    { key: "title", label: "Titre", required: true, list: true },
    {
      key: "discipline",
      label: "Discipline",
      type: "select",
      options: ["Conception mécanique", "Électronique", "Systèmes d'alimentation", "Systèmes embarqués", "IA et vision par ordinateur", "Navigation autonome", "Application web", "Contrôle mobile", "Fabrication", "Tests et validation", "Sécurité", "Cybersécurité", "Confidentialité"],
      chip: true,
      list: true,
    },
    {
      key: "doc_type",
      label: "Type",
      type: "select",
      options: ["Spécification", "Architecture", "Expérimentation", "Rapport de test", "Décision de conception", "Bug", "Risque", "Retour d'expérience", "Fiche composant", "Guide d'intégration", "Guide d'assemblage"],
      list: true,
    },
    { key: "status", label: "Statut", type: "select", options: ["Brouillon", "En revue", "Validé", "Obsolète"], chip: true, list: true },
    { key: "version", label: "Version", list: true },
    { key: "author", label: "Auteur", list: true },
    { key: "related_component", label: "Composant lié" },
    { key: "related_requirement", label: "Exigence liée" },
    { key: "notes", label: "Notes", type: "textarea" },
    { key: "decision", label: "Décision", type: "textarea" },
    { key: "file_url", label: "Lien du fichier" },
  ],
};

export const requirementsConfig: EntityConfig = {
  table: "requirements",
  title: "Exigences",
  description: "Base d'exigences produit avec méthode de vérification et statut.",
  singular: "Nouvelle exigence",
  filterKey: "status",
  defaultOrder: { column: "ref", ascending: true },
  emptyDescription: "Ajoutez les exigences produit (ENV, NAV, AI, PWR, SAF, WEB, PRIV) pour piloter la validation de Labi-Bot V2.",
  fields: [
    { key: "ref", label: "Référence", required: true, list: true },
    { key: "title", label: "Titre", required: true, list: true },
    { key: "category", label: "Catégorie", list: true },
    { key: "priority", label: "Priorité", type: "select", options: PRIORITIES, chip: true, list: true },
    { key: "status", label: "Statut", type: "select", options: ["Proposée", "En cours", "Validée", "Rejetée"], chip: true, list: true },
    { key: "verification", label: "Vérification", list: true },
    { key: "source", label: "Source" },
    { key: "related_component", label: "Composant lié" },
    { key: "version", label: "Version" },
    { key: "description", label: "Description", type: "textarea" },
  ],
};

export const componentsConfig: EntityConfig = {
  table: "components",
  title: "Composants (BOM)",
  description: "Nomenclature Labi-Bot V2 : fournisseurs, prix unitaires et disponibilité.",
  singular: "Nouveau composant",
  filterKey: "category",
  emptyDescription: "Ajoutez les composants du prototype pour construire une nomenclature chiffrée et estimer le budget.",
  fields: [
    { key: "name", label: "Composant", required: true, list: true },
    { key: "category", label: "Catégorie", list: true, chip: true },
    { key: "supplier", label: "Fournisseur", list: true },
    { key: "quantity", label: "Quantité", type: "number", list: true },
    { key: "unit_price", label: "Prix unitaire", type: "currency", list: true },
    { key: "status", label: "Statut", type: "select", options: ["À étudier", "À commander", "Commandé", "Reçu"], chip: true, list: true },
    { key: "reference", label: "Référence" },
    { key: "weight", label: "Poids (g)", type: "number" },
    { key: "power_consumption", label: "Consommation (W)", type: "number" },
    { key: "availability", label: "Disponibilité" },
    { key: "lead_time", label: "Délai" },
    { key: "alternative", label: "Alternative" },
    { key: "datasheet_url", label: "Datasheet" },
  ],
};

export const risksConfig: EntityConfig = {
  table: "risks",
  title: "Risques",
  description: "Registre des risques produit et projet avec probabilité, impact et mitigation.",
  singular: "Nouveau risque",
  filterKey: "category",
  emptyDescription: "Identifiez les risques techniques, réglementaires et financiers pour les traiter avant qu'ils ne surviennent.",
  fields: [
    { key: "title", label: "Risque", required: true, list: true },
    { key: "category", label: "Catégorie", list: true, chip: true },
    { key: "probability", label: "Probabilité (1-5)", type: "number", list: true },
    { key: "impact", label: "Impact (1-5)", type: "number", list: true },
    { key: "status", label: "Statut", type: "select", options: ["Ouvert", "Maîtrisé", "Fermé"], chip: true, list: true },
    { key: "owner", label: "Responsable", list: true },
    { key: "review_date", label: "Date de revue", type: "date" },
    { key: "mitigation", label: "Mitigation", type: "textarea" },
  ],
};

export const testsConfig: EntityConfig = {
  table: "tests",
  title: "Tests",
  description: "Plan de tests et résultats de validation de Labi-Bot.",
  singular: "Nouveau test",
  filterKey: "status",
  emptyDescription: "Aucun test enregistré. Décrivez les procédures de validation terrain et leurs résultats attendus.",
  fields: [
    { key: "ref", label: "Référence", list: true },
    { key: "title", label: "Titre", required: true, list: true },
    { key: "status", label: "Statut", type: "select", options: ["Planifié", "En cours", "Réussi", "Échoué"], chip: true, list: true },
    { key: "environment", label: "Environnement", list: true },
    { key: "requirement_ref", label: "Exigence", list: true },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "responsible", label: "Responsable" },
    { key: "procedure", label: "Procédure", type: "textarea" },
    { key: "expected_result", label: "Résultat attendu", type: "textarea" },
    { key: "actual_result", label: "Résultat obtenu", type: "textarea" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const decisionsConfig: EntityConfig = {
  table: "decisions",
  title: "Journal des décisions",
  description: "Décisions de conception importantes, alternatives et justifications.",
  singular: "Nouvelle décision",
  defaultOrder: { column: "date", ascending: false },
  emptyDescription: "Consignez vos décisions techniques majeures pour garder la trace du raisonnement et de ses conséquences.",
  fields: [
    { key: "title", label: "Décision", required: true, list: true },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "chosen", label: "Option retenue", list: true },
    { key: "owner", label: "Responsable", list: true },
    { key: "context", label: "Contexte", type: "textarea" },
    { key: "alternatives", label: "Alternatives", type: "textarea" },
    { key: "rationale", label: "Justification", type: "textarea" },
    { key: "consequences", label: "Conséquences", type: "textarea" },
  ],
};

export const researchConfig: EntityConfig = {
  table: "research_notes",
  title: "Recherche",
  description: "Veille technique, réglementaire et marché pour la robotique environnementale.",
  singular: "Nouvelle note",
  filterKey: "relevance",
  emptyDescription:
    "Aucune note de recherche. Capitalisez votre veille : vision par ordinateur, edge AI, RGPD, marché de la propreté urbaine.",
  fields: [
    { key: "title", label: "Titre", required: true, list: true },
    { key: "category", label: "Catégorie", list: true, chip: true },
    { key: "relevance", label: "Pertinence", type: "select", options: ["Élevée", "Moyenne", "Faible"], chip: true, list: true },
    { key: "source", label: "Source", list: true },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "link", label: "Lien" },
    { key: "author", label: "Auteur" },
    { key: "summary", label: "Résumé", type: "textarea" },
    { key: "key_insight", label: "Enseignement clé", type: "textarea" },
  ],
};

export const teamConfig: EntityConfig = {
  table: "team_members",
  title: "Membres de l'équipe",
  description: "Équipe PlastiFind : rôles, compétences et disponibilité.",
  singular: "Nouveau membre",
  filterKey: "department",
  emptyDescription: "Ajoutez les membres de l'équipe et leurs compétences pour piloter la charge et les responsabilités.",
  fields: [
    { key: "name", label: "Nom", required: true, list: true },
    { key: "role", label: "Rôle", list: true },
    {
      key: "department",
      label: "Département",
      type: "select",
      options: ["Fondateur", "Mécanique", "Électronique", "Embarqué", "IA", "Logiciel", "Business", "Marketing", "Finance", "Juridique"],
      chip: true,
      list: true,
    },
    { key: "status", label: "Statut", type: "select", options: ["Actif", "Inactif", "Stage", "Freelance"], chip: true, list: true },
    { key: "email", label: "E-mail", list: true },
    { key: "availability", label: "Disponibilité", list: true },
    { key: "phone", label: "Téléphone" },
    { key: "start_date", label: "Date d'arrivée", type: "date" },
    { key: "skills", label: "Compétences", type: "textarea" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const jobRolesConfig: EntityConfig = {
  table: "job_roles",
  title: "Pipeline de recrutement",
  description: "Postes prévus et suivi des candidatures.",
  singular: "Nouveau poste",
  filterKey: "status",
  emptyDescription: "Décrivez les postes à pourvoir pour préparer le recrutement des premiers contributeurs.",
  fields: [
    { key: "title", label: "Poste", required: true, list: true },
    { key: "department", label: "Département", list: true, chip: true },
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: ["Poste prévu", "Candidat identifié", "Contacté", "Entretien", "Projet test", "Offre", "Recruté", "Refusé"],
      chip: true,
      list: true,
    },
    { key: "candidate", label: "Candidat", list: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const marketingConfig: EntityConfig = {
  table: "marketing_posts",
  title: "Calendrier de contenu",
  description: "Publications, campagnes et relations presse.",
  singular: "Nouveau contenu",
  filterKey: "platform",
  defaultOrder: { column: "date", ascending: true },
  emptyDescription: "Aucun contenu planifié. Programmez vos publications LinkedIn, Instagram et vos relations presse.",
  fields: [
    { key: "title", label: "Titre", required: true, list: true },
    {
      key: "platform",
      label: "Plateforme",
      type: "select",
      options: ["LinkedIn", "Instagram", "Facebook", "TikTok", "YouTube", "Site web", "Presse"],
      chip: true,
      list: true,
    },
    { key: "format", label: "Format", list: true },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "status", label: "Statut", type: "select", options: ["Idée", "Planifié", "En rédaction", "Publié"], chip: true, list: true },
    { key: "objective", label: "Objectif", list: true },
    { key: "caption", label: "Texte", type: "textarea" },
    { key: "link", label: "Lien" },
    { key: "metrics", label: "Résultats" },
  ],
};

export const mediaConfig: EntityConfig = {
  table: "media_assets",
  title: "Médias",
  description: "Photothèque produit, tests terrain, concours et éléments de marque.",
  singular: "Nouveau média",
  filterKey: "category",
  emptyDescription:
    "Aucun média. Ajoutez photos de tests, rendus CAO, visuels de concours et éléments de marque, avec leurs droits d'usage.",
  fields: [
    { key: "title", label: "Titre", required: true, list: true },
    {
      key: "category",
      label: "Catégorie",
      type: "select",
      options: ["Produit Labi-Bot", "Tests plage", "Assemblage", "Fabrication", "Électronique", "Dashboard IA", "Concours", "Récompenses", "Fondateur", "Équipe", "Rendus CAO", "Presse", "Logo et marque"],
      chip: true,
      list: true,
    },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "source", label: "Source", list: true },
    { key: "usage_rights", label: "Droits d'usage", list: true },
    { key: "is_public", label: "Public", type: "boolean", list: true },
    { key: "file_url", label: "Lien du fichier" },
    { key: "description", label: "Description", type: "textarea" },
  ],
};

export const achievementsConfig: EntityConfig = {
  table: "achievements",
  title: "Réalisations",
  description: "Palmarès et jalons marquants : Robofest, Eurobot, Forum DSI, vente du premier prototype.",
  singular: "Nouvelle réalisation",
  filterKey: "category",
  defaultOrder: { column: "date", ascending: false },
  emptyDescription: "Consignez vos prix, participations et jalons marquants : ils crédibilisent chaque dossier de financement.",
  fields: [
    { key: "title", label: "Réalisation", required: true, list: true },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "category", label: "Catégorie", list: true, chip: true },
    { key: "event", label: "Événement", list: true },
    { key: "location", label: "Lieu", list: true },
    { key: "result", label: "Résultat", chip: true, list: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "evidence", label: "Preuve" },
  ],
};

export const competitionsConfig: EntityConfig = {
  table: "competitions",
  title: "Concours",
  description: "Concours robotiques et startup : échéances, éligibilité et résultats.",
  singular: "Nouveau concours",
  filterKey: "status",
  defaultOrder: { column: "date", ascending: true },
  emptyDescription: "Aucun concours suivi. Ajoutez les compétitions robotiques et concours startup visés par PlastiFind.",
  fields: [
    { key: "name", label: "Concours", required: true, list: true },
    { key: "organization", label: "Organisateur", list: true },
    { key: "category", label: "Catégorie", list: true, chip: true },
    { key: "location", label: "Lieu", list: true },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "status", label: "Statut", type: "select", options: ["Identifiée", "À préparer", "Inscrit", "Participé", "Terminé"], chip: true, list: true },
    { key: "registration_deadline", label: "Clôture des inscriptions", type: "date" },
    { key: "cost", label: "Coût", type: "currency" },
    { key: "robot", label: "Robot" },
    { key: "team", label: "Équipe" },
    { key: "objectives", label: "Objectifs", type: "textarea" },
    { key: "result", label: "Résultat" },
  ],
};

export const universityConfig: EntityConfig = {
  table: "university_items",
  title: "Université",
  description: "Cours, examens, devoirs et actions SNEE à l'UBO.",
  singular: "Nouvel élément",
  filterKey: "type",
  defaultOrder: { column: "date", ascending: true },
  emptyDescription: "Ajoutez vos cours, examens et rendez-vous SNEE pour équilibrer la charge études / startup.",
  fields: [
    { key: "title", label: "Intitulé", required: true, list: true },
    { key: "type", label: "Type", type: "select", options: ["Cours", "Examen", "Devoir", "Action SNEE", "Rendez-vous"], chip: true, list: true },
    { key: "course", label: "Matière", list: true },
    { key: "date", label: "Date", type: "date", list: true },
    { key: "status", label: "Statut", type: "select", options: ["À venir", "En cours", "Terminé"], chip: true, list: true },
    { key: "hours", label: "Heures estimées", type: "number", list: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const competitorsConfig: EntityConfig = {
  table: "competitors",
  title: "Concurrents",
  description: "Veille concurrentielle sur la robotique de nettoyage.",
  singular: "Nouveau concurrent",
  emptyDescription: "Aucun concurrent référencé. Documentez les acteurs existants pour affiner votre positionnement.",
  fields: [
    { key: "company", label: "Entreprise", required: true, list: true },
    { key: "country", label: "Pays", list: true },
    { key: "product", label: "Produit", list: true },
    { key: "segment", label: "Segment", list: true },
    { key: "technology", label: "Technologie", list: true },
    { key: "price", label: "Prix" },
    { key: "website", label: "Site web" },
    { key: "strengths", label: "Forces", type: "textarea" },
    { key: "weaknesses", label: "Faiblesses", type: "textarea" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const productsConfig: EntityConfig = {
  table: "products",
  title: "Produits",
  description: "Base produit PlastiFind. Labi-Bot est le premier produit de la gamme.",
  singular: "Nouveau produit",
  filterKey: "status",
  emptyDescription: "Aucun produit. Créez la fiche produit de Labi-Bot pour centraliser spécifications, coûts et jalons.",
  fields: [
    { key: "name", label: "Nom", required: true, list: true },
    { key: "code_name", label: "Nom de code", list: true },
    { key: "category", label: "Catégorie", list: true },
    { key: "status", label: "Statut", type: "select", options: ["Idée", "En développement", "En test", "Commercialisé", "Arrêté"], chip: true, list: true },
    { key: "stage", label: "Phase", list: true },
    { key: "progress", label: "Avancement (%)", type: "number", progress: true, list: true },
    { key: "estimated_cost", label: "Coût estimé", type: "currency" },
    { key: "target_price", label: "Prix cible", type: "currency" },
    { key: "expected_launch", label: "Lancement visé", type: "date" },
    { key: "owner", label: "Responsable produit" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "target_users", label: "Clients cibles", type: "textarea" },
    { key: "privacy_note", label: "Note confidentialité", type: "textarea" },
  ],
};
