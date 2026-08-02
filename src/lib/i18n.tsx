import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "fr" | "en" | "ar";

export const LANGS: { code: Lang; label: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇹🇳", dir: "rtl" },
];

/** Dictionaries keyed by the canonical French string. Missing keys fall back to French. */
const EN: Record<string, string> = {
  // chrome
  "Tableau de bord": "Dashboard",
  Entreprise: "Company",
  Roadmap: "Roadmap",
  Produits: "Products",
  Ingénierie: "Engineering",
  Projets: "Projects",
  Tâches: "Tasks",
  Recherche: "Research",
  Business: "Business",
  CRM: "CRM",
  Financement: "Funding",
  Finance: "Finance",
  Réunions: "Meetings",
  Marketing: "Marketing",
  Équipe: "Team",
  Médias: "Media",
  Réalisations: "Achievements",
  Documents: "Documents",
  "Juridique & PI": "Legal & IP",
  Concours: "Competitions",
  Université: "University",
  Paramètres: "Settings",
  Pilotage: "Command",
  "Produit & ingénierie": "Product & engineering",
  Organisation: "Organisation",
  "Rechercher dans PlastiFind OS…": "Search PlastiFind OS…",
  "Rechercher…": "Search…",
  Créer: "Create",
  Thème: "Theme",
  Notifications: "Notifications",
  "Aucune notification.": "No notifications.",
  "Se déconnecter": "Sign out",
  Réduire: "Collapse",
  Menu: "Menu",
  Navigation: "Navigation",
  "Aucun résultat.": "No results.",
  "Actions rapides": "Quick actions",
  Modules: "Modules",
  "Changer de thème": "Toggle theme",
  "Rechercher un module ou une action…": "Search a module or action…",
  // generic UI
  Modifier: "Edit",
  Supprimer: "Delete",
  Annuler: "Cancel",
  Enregistrer: "Save",
  Créer: "Create",
  "Tous les statuts": "All statuses",
  "Toutes les échéances": "All deadlines",
  "Échéance dépassée": "Overdue",
  "Sous 30 jours": "Within 30 days",
  "Sous 90 jours": "Within 90 days",
  "Sans date": "No date",
  "élément(s)": "item(s)",
  "Aucun résultat": "No results",
  "Ajustez votre recherche ou vos filtres.": "Adjust your search or filters.",
  "Sélectionner…": "Select…",
  Oui: "Yes",
  Non: "No",
  Aucun: "None",
  "Téléverser un fichier": "Upload a file",
  "Téléversement…": "Uploading…",
  "Ouvrir le fichier": "Open file",
  Retirer: "Remove",
  "Cette action est irréversible.": "This action cannot be undone.",
  "Supprimer cet élément ?": "Delete this item?",
  Statut: "Status",
  Priorité: "Priority",
  Échéance: "Deadline",
  Liste: "List",
  Tableau: "Board",
  "Glissez une carte pour changer son statut.": "Drag a card to change its status.",
  Langue: "Language",
  Devise: "Currency",
  "Format de date": "Date format",
  "Préférences générales": "General preferences",
  "Mode sombre par défaut": "Dark mode by default",
  "Passer en clair": "Switch to light",
  "Passer en sombre": "Switch to dark",
  Marque: "Brand",
  "Rôles et permissions": "Roles and permissions",
  Sécurité: "Security",
};

const AR: Record<string, string> = {
  "Tableau de bord": "لوحة القيادة",
  Entreprise: "الشركة",
  Roadmap: "خارطة الطريق",
  Produits: "المنتجات",
  Ingénierie: "الهندسة",
  Projets: "المشاريع",
  Tâches: "المهام",
  Recherche: "البحث",
  Business: "الأعمال",
  CRM: "إدارة العلاقات",
  Financement: "التمويل",
  Finance: "المالية",
  Réunions: "الاجتماعات",
  Marketing: "التسويق",
  Équipe: "الفريق",
  Médias: "الوسائط",
  Réalisations: "الإنجازات",
  Documents: "الوثائق",
  "Juridique & PI": "القانون والملكية الفكرية",
  Concours: "المسابقات",
  Université: "الجامعة",
  Paramètres: "الإعدادات",
  Pilotage: "القيادة",
  "Produit & ingénierie": "المنتج والهندسة",
  Organisation: "التنظيم",
  "Rechercher dans PlastiFind OS…": "ابحث في PlastiFind OS…",
  "Rechercher…": "بحث…",
  Créer: "إنشاء",
  Thème: "المظهر",
  Notifications: "الإشعارات",
  "Aucune notification.": "لا توجد إشعارات.",
  "Se déconnecter": "تسجيل الخروج",
  Réduire: "طيّ",
  Menu: "القائمة",
  Navigation: "التنقل",
  "Aucun résultat.": "لا نتائج.",
  "Actions rapides": "إجراءات سريعة",
  Modules: "الوحدات",
  "Changer de thème": "تغيير المظهر",
  "Rechercher un module ou une action…": "ابحث عن وحدة أو إجراء…",
  Modifier: "تعديل",
  Supprimer: "حذف",
  Annuler: "إلغاء",
  Enregistrer: "حفظ",
  "Tous les statuts": "كل الحالات",
  "Toutes les échéances": "كل الآجال",
  "Échéance dépassée": "متأخر",
  "Sous 30 jours": "خلال 30 يومًا",
  "Sous 90 jours": "خلال 90 يومًا",
  "Sans date": "بدون تاريخ",
  "élément(s)": "عنصر",
  "Aucun résultat": "لا نتائج",
  "Ajustez votre recherche ou vos filtres.": "عدّل البحث أو عوامل التصفية.",
  "Sélectionner…": "اختر…",
  Oui: "نعم",
  Non: "لا",
  Aucun: "لا شيء",
  "Téléverser un fichier": "رفع ملف",
  "Téléversement…": "جارٍ الرفع…",
  "Ouvrir le fichier": "فتح الملف",
  Retirer: "إزالة",
  "Cette action est irréversible.": "لا يمكن التراجع عن هذا الإجراء.",
  "Supprimer cet élément ?": "حذف هذا العنصر؟",
  Statut: "الحالة",
  Priorité: "الأولوية",
  Échéance: "الأجل",
  Liste: "قائمة",
  Tableau: "لوحة",
  "Glissez une carte pour changer son statut.": "اسحب بطاقة لتغيير حالتها.",
  Langue: "اللغة",
  Devise: "العملة",
  "Format de date": "صيغة التاريخ",
  "Préférences générales": "التفضيلات العامة",
  "Mode sombre par défaut": "الوضع الداكن افتراضيًا",
  "Passer en clair": "التبديل إلى الفاتح",
  "Passer en sombre": "التبديل إلى الداكن",
  Marque: "العلامة",
  "Rôles et permissions": "الأدوار والصلاحيات",
  Sécurité: "الأمان",
};

const DICTS: Record<Lang, Record<string, string>> = { fr: {}, en: EN, ar: AR };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string; dir: "ltr" | "rtl" };

const I18nContext = createContext<Ctx>({ lang: "fr", setLang: () => {}, t: (s) => s, dir: "ltr" });

export const langBootScript = `(function(){try{var l=localStorage.getItem('pf-lang')||'fr';document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';}catch(e){}})();`;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = (localStorage.getItem("pf-lang") as Lang | null) ?? "fr";
    setLangState(stored);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem("pf-lang", l);
    setLangState(l);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t: (s: string) => DICTS[lang][s] ?? s,
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export const useT = () => useI18n().t;
