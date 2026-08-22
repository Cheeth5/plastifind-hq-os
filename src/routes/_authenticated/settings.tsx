import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, Chip } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/lib/theme";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, LogOut, ShieldCheck, UserRound } from "lucide-react";
import {
  COMPANY_ROLES,
  FOUNDER_EMAIL,
  fullNameOf,
  roleLabel,
  useMyPermissions,
  useMyRole,
  useSetUserDisabled,
  useSetUserRole,
  useTeamAccounts,
} from "@/lib/rbac";
import { Switch } from "@/components/ui/switch";

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
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { can } = useMyPermissions();
  const { data: myRole } = useMyRole();
  const isFounder = myRole === "founder" || can("*");
  const team = useTeamAccounts(can("users.manage"));
  const setRole = useSetUserRole();
  const setDisabled = useSetUserDisabled();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="space-y-5">
      <PageHeader title={t("Paramètres")} description="Préférences de l'espace de travail PlastiFind OS." />

      <section className="panel p-5">
        <h2 className="text-sm font-bold">{t("Préférences générales")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label>{t("Langue")}</Label>
            <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{l.flag}</span>
                      {l.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>{t("Devise")}</Label>
            <Input defaultValue="EUR (€)" readOnly />
          </div>
          <div className="grid gap-1.5">
            <Label>{t("Format de date")}</Label>
            <Input defaultValue="JJ/MM/AAAA" readOnly />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">{t("Thème")}</p>
            <p className="text-xs text-muted-foreground">{t("Mode sombre par défaut")}</p>
          </div>
          <Button size="sm" variant="outline" onClick={toggle}>
            {theme === "dark" ? <Sun className="mr-1.5 h-4 w-4" /> : <Moon className="mr-1.5 h-4 w-4" />}
            {theme === "dark" ? t("Passer en clair") : t("Passer en sombre")}
          </Button>
        </div>
      </section>

      {can("users.manage") && (
        <section className="panel overflow-hidden p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="h-4 w-4 text-primary" /> Gestion des utilisateurs
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">Rôles et accès des comptes membres.</p>
            </div>
            <Chip tone="success" dot>Accès administrateur</Chip>
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[680px] divide-y divide-border rounded-lg border border-border">
              {(team.data ?? []).map((member) => {
                const email = String(member["email"] ?? "");
                const founder = email.toLowerCase() === FOUNDER_EMAIL;
                const name = fullNameOf(member, email);
                return (
                  <div key={member["id"]} className="grid grid-cols-[minmax(220px,1fr)_220px_110px] items-center gap-4 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="truncate text-xs text-muted-foreground">{email || "Compte sans email"}</p>
                      </div>
                    </div>
                    <Select
                      value={String(member["role"] ?? "viewer")}
                      disabled={founder || setRole.isPending}
                      onValueChange={(role) => setRole.mutate({ userId: String(member["id"]), role })}
                    >
                      <SelectTrigger><SelectValue placeholder={roleLabel(member["role"])} /></SelectTrigger>
                      <SelectContent>
                        {COMPANY_ROLES.filter((role) => isFounder || (role.key !== "founder" && role.key !== "administrator")).map((role) => (
                          <SelectItem key={role.key} value={role.key}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-muted-foreground">{member["disabled"] ? "Désactivé" : "Actif"}</span>
                      <Switch
                        checked={!member["disabled"]}
                        disabled={founder || setDisabled.isPending}
                        onCheckedChange={(enabled) =>
                          setDisabled.mutate({ userId: String(member["id"]), disabled: !enabled })
                        }
                        aria-label={`Activer ${name}`}
                      />
                    </div>
                  </div>
                );
              })}
              {team.isLoading && <p className="px-4 py-6 text-center text-sm text-muted-foreground">Chargement des comptes…</p>}
              {!team.isLoading && (team.data ?? []).length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">Aucun compte trouvé.</p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="panel p-5">
        <h2 className="text-sm font-bold">{t("Marque")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Renseignez les URL de vos visuels (logo, favicon, couverture, photos Labi-Bot).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5"><Label>Logo de l'entreprise</Label><Input placeholder="https://…" /></div>
          <div className="grid gap-1.5"><Label>Favicon</Label><Input placeholder="https://…" /></div>
          <div className="grid gap-1.5"><Label>Image de couverture</Label><Input placeholder="https://…" /></div>
          <div className="grid gap-1.5"><Label>Photos produit Labi-Bot</Label><Input placeholder="https://…" /></div>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-bold">{t("Rôles et permissions")}</h2>
        <ul className="mt-3 divide-y divide-border">
          {ROLES.map(([r, d]) => (
            <li key={r} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{r}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
              <Chip tone={r.startsWith("Fondateur") ? "success" : "neutral"}>
                {r.startsWith("Fondateur") ? "Actif" : "Prévu"}
              </Chip>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-bold">{t("Sécurité")}</h2>
        <Button className="mt-3" variant="outline" size="sm" onClick={signOut}>
          <LogOut className="mr-1.5 h-4 w-4" /> {t("Se déconnecter")}
        </Button>
      </section>
    </div>
  );
}
