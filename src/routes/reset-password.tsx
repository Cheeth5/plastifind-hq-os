import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — PlastiFind OS" },
      {
        name: "description",
        content: "Définissez un nouveau mot de passe pour accéder au système interne de PlastiFind.",
      },
      { property: "og:title", content: "Nouveau mot de passe — PlastiFind OS" },
      { property: "og:description", content: "Réinitialisation sécurisée de votre accès PlastiFind OS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setHasSession(Boolean(data.session));
      setReady(true);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!active) return;
      setHasSession(Boolean(session));
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères.");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Mot de passe mis à jour", { description: "Vous pouvez maintenant vous connecter." });
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "La mise à jour a échoué. Redemandez un lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold tracking-tight">Nouveau mot de passe</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {!ready
            ? "Vérification du lien…"
            : hasSession
              ? "Choisissez un mot de passe pour votre compte PlastiFind."
              : "Ce lien est expiré ou déjà utilisé. Demandez un nouveau lien depuis la page de connexion."}
        </p>

        {ready && hasSession && (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="new-password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pe-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={show}
                  className="absolute inset-y-0 end-0 flex w-10 items-center justify-center rounded-e-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Veuillez patienter…" : "Enregistrer le mot de passe"}
            </Button>
          </form>
        )}

        {ready && !hasSession && (
          <Button className="mt-7 w-full" onClick={() => navigate({ to: "/auth" })}>
            Retour à la connexion
          </Button>
        )}
      </div>
    </div>
  );
}
