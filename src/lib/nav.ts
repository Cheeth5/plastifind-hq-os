import {
  LayoutDashboard,
  Radar,
  Building2,
  Bot,
  Wrench,
  FolderKanban,
  CheckSquare,
  Map,
  Briefcase,
  Users,
  Banknote,
  Wallet,
  CalendarDays,
  UserPlus,
  Megaphone,
  Images,
  Trophy,
  BookOpen,
  FileText,
  Scale,
  Medal,
  GraduationCap,
  Settings,
  UserCircle,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  group: string;
};

export const NAV_PERMISSIONS: Record<string, string> = {
  "/finance": "finance.view",
  "/funding": "funding.view",
  "/team": "team.view",
  "/settings": "settings.manage",
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Mission Control", to: "/mission-control", icon: Radar, group: "Pilotage" },
  { label: "Tableau de bord", to: "/dashboard", icon: LayoutDashboard, group: "Pilotage" },
  { label: "Entreprise", to: "/company", icon: Building2, group: "Pilotage" },
  { label: "Roadmap", to: "/roadmap", icon: Map, group: "Pilotage" },

  { label: "Produits", to: "/products", icon: Bot, group: "Produit & ingénierie" },
  { label: "Ingénierie", to: "/engineering", icon: Wrench, group: "Produit & ingénierie" },
  { label: "Projets", to: "/projects", icon: FolderKanban, group: "Produit & ingénierie" },
  { label: "Tâches", to: "/tasks", icon: CheckSquare, group: "Produit & ingénierie" },
  { label: "Recherche", to: "/research", icon: BookOpen, group: "Produit & ingénierie" },

  { label: "Business", to: "/business", icon: Briefcase, group: "Business" },
  { label: "CRM", to: "/crm", icon: Users, group: "Business" },
  { label: "Financement", to: "/funding", icon: Banknote, group: "Business" },
  { label: "Finance", to: "/finance", icon: Wallet, group: "Business" },
  { label: "Réunions", to: "/meetings", icon: CalendarDays, group: "Business" },
  { label: "Marketing", to: "/marketing", icon: Megaphone, group: "Business" },

  { label: "Équipe", to: "/team", icon: UserPlus, group: "Organisation" },
  { label: "Médias", to: "/media", icon: Images, group: "Organisation" },
  { label: "Réalisations", to: "/achievements", icon: Trophy, group: "Organisation" },
  { label: "Documents", to: "/documents", icon: FileText, group: "Organisation" },
  { label: "Juridique & PI", to: "/legal", icon: Scale, group: "Organisation" },
  { label: "Concours", to: "/competitions", icon: Medal, group: "Organisation" },
  { label: "Université", to: "/university", icon: GraduationCap, group: "Organisation" },
  { label: "Profil", to: "/profile", icon: UserCircle, group: "Organisation" },
  { label: "Messages", to: "/messages", icon: MessageSquare, group: "Organisation" },
  { label: "Paramètres", to: "/settings", icon: Settings, group: "Organisation" },
];

export const NAV_GROUPS = ["Pilotage", "Produit & ingénierie", "Business", "Organisation"];

const byPath = (path: string) => NAV_ITEMS.find((i) => i.to === path)!;

export const MOBILE_NAV: NavItem[] = [
  byPath("/mission-control"),
  byPath("/dashboard"),
  byPath("/tasks"),
  byPath("/funding"),
  byPath("/engineering"),
];
