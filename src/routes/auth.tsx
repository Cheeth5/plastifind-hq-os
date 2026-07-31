import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Connexion — PlastiFind OS" },
      { name: "description", content: "Accès sécurisé au système interne de PlastiFind, robotique environnementale autonome." },
      { property: "og:title", content: "Connexion — PlastiFind OS" },
      { property: "og:description", content: "Accès sécurisé au système interne de PlastiFind." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) return setError("Adresse e-mail invalide.");
    if (mode !== "reset" && password.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères.");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Compte créé", { description: "Vérifiez votre e-mail pour confirmer votre inscription." });
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("E-mail envoyé", { description: "Consultez votre boîte de réception." });
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setError("Connexion Google indisponible.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border bg-sidebar lg:block">
        <div className="grid-backdrop absolute inset-0 opacity-40" />
        <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-success/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Robotique environnementale</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight">
              La robotique autonome au service d'un environnement plus propre.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              PlastiFind OS centralise la stratégie, l'ingénierie, le financement et les opérations autour de Labi-Bot,
              robot autonome de détection et de collecte des déchets.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-border pt-6">
            {[
              ["1re place", "Robofest Tunisie 2025"],
              ["2e place", "Robofest International"],
              ["1 prototype", "vendu"],
            ].map(([a, b]) => (
              <div key={b}>
                <dt className="text-sm font-bold text-primary">{a}</dt>
                <dd className="mt-0.5 text-[11px] text-muted-foreground">{b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Connexion" : mode === "signup" ? "Créer un compte" : "Mot de passe oublié"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "reset"
              ? "Nous vous enverrons un lien de réinitialisation."
              : "Accès réservé à l'équipe PlastiFind."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-mail professionnel</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom@plastifind.com"
                required
              />
            </div>
            {mode !== "reset" && (
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Veuillez patienter…"
                : mode === "signin"
                  ? "Se connecter"
                  : mode === "signup"
                    ? "Créer mon compte"
                    : "Envoyer le lien"}
            </Button>
          </form>

          {mode !== "reset" && (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">ou</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" className="w-full" onClick={google} type="button">
                Continuer avec Google
              </Button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Pas encore de compte ?{" "}
                <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <button onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
