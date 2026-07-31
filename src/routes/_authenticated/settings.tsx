import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Chip } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres — PlastiFind OS" },
      { name: "description", content: "Marque, thème, langue, devise, rôles et sécurité de PlastiFind OS." },
      { property: "og:title", content: "Paramètres — PlastiFind OS" },
      { property: "og:description", content: "Marque, thème, langue, devise, rôles et sécurité de PlastiFind OS." },
    ],
  }),
  component: Page,
});

const ROLES: [string, string][] = [
  ["Fondateur / Admin", "Accès complet à tous les modules"],
  ["Membre ingénierie", "Produits, ingénierie, projets, tâches, recherche, documents, réunions"],
  ["Membre business", "Business, CRM, financement, finance, marketing, réunions, documents"],
  ["Mentor / Conseiller", "Lecture des pages sélectionnées et commentaires"],
  ["Lecteur", "Lecture seule du contenu assigné"],
];

function Page() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <PageHeader title="Paramètres" description="Préférences de l'espace de travail PlastiFind OS." />
      <section className="panel p-5">
        <h2 className="text-sm font-bold">Préférences générales</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5"><Label>Langue</Label><Input defaultValue="Français" readOnly /></div>
          <div className="grid gap-1.5"><Label>Devise</Label><Input defaultValue="EUR (€)" readOnly /></div>
          <div className="grid gap-1.5"><Label>Format de date</Label><Input defaultValue="JJ/MM/AAAA" readOnly /></div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-3">
          <div><p className="text-sm font-medium">Thème</p><p className="text-xs text-muted-foreground">Mode sombre par défaut</p></div>
          <Button size="sm" variant="outline" onClick={toggle}>{theme === "dark" ? "Passer en clair" : "Passer en sombre"}</Button>
        </div>
      </section>
      <section className="panel p-5">
        <h2 className="text-sm font-bold">Marque</h2>
        <p className="mt-1 text-xs text-muted-foreground">Renseignez les URL de vos visuels (logo, favicon, couverture, photos Labi-Bot).</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5"><Label>Logo de l'entreprise</Label><Input placeholder="https://…" /></div>
          <div className="grid gap-1.5"><Label>Favicon</Label><Input placeholder="https://…" /></div>
          <div className="grid gap-1.5"><Label>Image de couverture</Label><Input placeholder="https://…" /></div>
          <div className="grid gap-1.5"><Label>Photos produit Labi-Bot</Label><Input placeholder="https://…" /></div>
        </div>
      </section>
      <section className="panel p-5">
        <h2 className="text-sm font-bold">Rôles et permissions</h2>
        <ul className="mt-3 divide-y divide-border">
          {ROLES.map(([r, d]) => (
            <li key={r} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
              <div className="min-w-0"><p className="text-sm font-medium">{r}</p><p className="text-xs text-muted-foreground">{d}</p></div>
              <Chip tone={r.startsWith("Fondateur") ? "success" : "neutral"}>{r.startsWith("Fondateur") ? "Actif" : "Prévu"}</Chip>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel p-5">
        <h2 className="text-sm font-bold">Sécurité</h2>
        <Button
          className="mt-3"
          variant="outline"
          size="sm"
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }}
        >
          Se déconnecter
        </Button>
      </section>
    </div>
  );
}
