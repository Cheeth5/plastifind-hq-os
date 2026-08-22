import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { COMPANY_ROLES } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Configuration du compte — PlastiFind OS" },
      { name: "description", content: "Complétez votre profil PlastiFind OS : identité, rôle et préférences." },
      { property: "og:title", content: "Configuration du compte — PlastiFind OS" },
      { property: "og:description", content: "Créez votre profil membre de l'équipe PlastiFind." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.onboarding_completed) throw redirect({ to: "/dashboard" });
    return { user: data.user };
  },
  component: OnboardingPage,
});

const GENDERS = [
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "autre", label: "Autre" },
  { value: "non_precise", label: "Je préfère ne pas préciser" },
];

const STEPS = ["Identité", "Informations", "Rôle", "Confirmation"];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    job_role: "viewer",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid = [
    form.first_name.trim().length >= 2 && form.last_name.trim().length >= 2,
    !!form.date_of_birth && !!form.gender,
    !!form.job_role,
    true,
  ];

  const submit = async () => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Session expirée");
      const full = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          full_name: full,
          date_of_birth: form.date_of_birth,
          gender: form.gender,
          company_role: form.job_role,
          job_role: form.job_role,
          onboarding_completed: true,
        })
        .eq("id", user.id);
      if (error) throw error;
      setWelcome(true);
    } catch (e) {
      toast.error("Enregistrement impossible", { description: (e as Error).message });
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!welcome) return;
    const id = setTimeout(() => navigate({ to: "/dashboard", replace: true }), 2200);
    return () => clearTimeout(id);
  }, [welcome, navigate]);

  if (welcome) {
    return (
      <div className="atmosphere grid min-h-screen place-items-center bg-background px-6 text-center">
        <div className="rise flex flex-col items-center gap-5">
          <Logo />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Bonjour, {form.first_name.trim()} <span className="align-middle">👋</span>
          </h1>
          <p className="text-lg text-muted-foreground">Bienvenue dans PlastiFind OS</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Préparation de votre espace de travail…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="atmosphere flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="glass w-full max-w-xl overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Première configuration
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold transition-colors",
                    i < step
                      ? "border-primary bg-primary text-primary-foreground"
                      : i === step
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <span className={cn("h-px flex-1 transition-colors", i < step ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
            Étape {step + 1} / {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        <div key={step} className="rise mt-6 space-y-4">
          {step === 0 && (
            <>
              <h2 className="text-xl font-bold tracking-tight">Comment devons-nous vous appeler ?</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Prénom</Label>
                  <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="John" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Nom</Label>
                  <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Doe" />
                </div>
              </div>
              {!valid[0] && <p className="text-xs text-muted-foreground">Renseignez votre prénom et votre nom (2 caractères minimum).</p>}
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold tracking-tight">Quelques informations</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Date de naissance</Label>
                  <Input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Sexe</Label>
                  <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold tracking-tight">Votre rôle dans l'entreprise</h2>
              <p className="text-sm text-muted-foreground">
                Le rôle demandé oriente votre espace de travail. Les permissions effectives sont validées par un
                administrateur.
              </p>
              <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
                {COMPANY_ROLES.filter((r) => r.key !== "founder").map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => set("job_role", r.key)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      form.job_role === r.key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40 hover:bg-accent/40",
                    )}
                  >
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.hint}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold tracking-tight">Tout est prêt</h2>
              <dl className="divide-y divide-border rounded-xl border border-border">
                {[
                  ["Nom complet", `${form.first_name} ${form.last_name}`],
                  ["Date de naissance", form.date_of_birth],
                  ["Sexe", GENDERS.find((g) => g.value === form.gender)?.label ?? "—"],
                  ["Rôle", COMPANY_ROLES.find((r) => r.key === form.job_role)?.label ?? "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                    <dd className="truncate text-sm font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" disabled={step === 0 || saving} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Retour
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" disabled={!valid[step]} onClick={() => setStep((s) => s + 1)}>
              Continuer <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" disabled={saving} onClick={submit}>
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
              Terminer la configuration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
