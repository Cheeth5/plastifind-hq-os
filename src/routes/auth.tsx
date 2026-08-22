import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Apple, Chrome, Eye, EyeOff, Phone } from "lucide-react";
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
  const [mode, setMode] = useState<"signin" | "signup" | "reset" | "phone">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);

  const readableError = (value: unknown) => {
    if (value instanceof Error && value.message) return value.message;
    if (value && typeof value === "object") {
      const candidate = value as Record<string, unknown>;
      const message = candidate["message"] ?? candidate["error_description"] ?? candidate["msg"];
      if (typeof message === "string" && message) return message;
      try {
        const serialized = JSON.stringify(value);
        if (serialized && serialized !== "{}") return serialized;
      } catch {
        // Keep the generic message below for non-serializable provider errors.
      }
    }
    return "Une erreur est survenue. Vérifiez que ce fournisseur est activé dans Lovable Cloud.";
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalizedPhone = phone.replace(/\s+/g, "");
    if (mode === "phone") {
      if (!phoneCodeSent && !/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
        return setError("Utilisez un numéro international, par exemple +33 7 69 89 20 18.");
      }
      if (phoneCodeSent && !/^\d{6}$/.test(password.trim())) return setError("Saisissez le code à 6 chiffres reçu par SMS.");
    } else {
      if (!email.includes("@")) return setError("Adresse e-mail invalide.");
      if (mode !== "reset" && password.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères.");
    }
    setLoading(true);
    try {
      if (mode === "phone") {
        if (!phoneCodeSent) {
          const { error } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
          if (error) throw error;
          setPhoneCodeSent(true);
          toast.success("Code envoyé", { description: "Consultez vos SMS pour continuer." });
        } else {
          const { error } = await supabase.auth.verifyOtp({ phone: normalizedPhone, token: password.trim(), type: "sms" });
          if (error) throw error;
          navigate({ to: "/dashboard", replace: true });
        }
      } else if (mode === "signin") {
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
      setError(readableError(err));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError(null);
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (error) {
      setError("Connexion Google indisponible.");
      setLoading(false);
    }
  };

  const apple = async () => {
    setError(null);
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("apple", { redirect_uri: `${window.location.origin}/auth` });
    if (error) {
      setError("Connexion Apple indisponible.");
      setLoading(false);
    }
  };

  const switchMode = (next: "signin" | "signup" | "reset" | "phone") => {
    setMode(next);
    setError(null);
    setPhoneCodeSent(false);
    setPassword("");
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
            {mode === "phone"
              ? phoneCodeSent
                ? "Saisissez le code reçu par SMS."
                : "Connexion sécurisée avec votre numéro de téléphone."
              : mode === "reset"
              ? "Nous vous enverrons un lien de réinitialisation."
              : "Accès réservé à l'équipe PlastiFind."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "phone" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 7 69 89 20 18"
                  disabled={phoneCodeSent}
                  required
                />
              </div>
            ) : (
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
            )}
            {mode !== "reset" && mode !== "phone" && (
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pe-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 end-0 flex w-10 items-center justify-center rounded-e-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                      : mode === "phone"
                        ? phoneCodeSent
                          ? "Vérifier le code"
                          : "Envoyer le code"
                        : "Envoyer le lien"}
            </Button>
          </form>

          {mode !== "reset" && mode !== "phone" && (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">ou</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" className="w-full" onClick={google} type="button" disabled={loading}>
                  <Chrome className="mr-2 h-4 w-4" /> Google
                </Button>
                <Button variant="outline" className="w-full" onClick={apple} type="button" disabled={loading}>
                  <Apple className="mr-2 h-4 w-4" /> Apple
                </Button>
              </div>
              <Button variant="ghost" className="mt-2 w-full" onClick={() => switchMode("phone")} type="button">
                <Phone className="mr-2 h-4 w-4" /> Continuer avec un téléphone
              </Button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "phone" ? (
              <button onClick={() => switchMode("signin")} className="font-medium text-primary hover:underline">
                Retour à la connexion par e-mail
              </button>
            ) : mode === "signin" ? (
              <>
                Pas encore de compte ?{" "}
                <button onClick={() => switchMode("signup")} className="font-medium text-primary hover:underline">
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <button onClick={() => switchMode("signin")} className="font-medium text-primary hover:underline">
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
