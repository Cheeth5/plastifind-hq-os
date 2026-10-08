import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const KEY = "pf-cookie-choice";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const choose = (v: "essential" | "all") => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice: v, at: new Date().toISOString() }));
    } catch {
      // ignore storage failures
    }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Information cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-border bg-card p-4 shadow-xl sm:inset-x-6 sm:bottom-6 sm:p-5"
    >
      <p className="text-sm font-semibold">Cookies — choix simple et réversible</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
        PlastiFind OS n'utilise que des cookies et stockages strictement nécessaires (session,
        thème, langue). Aucune publicité, aucune mesure d'audience tierce.{" "}
        <Link to="/cookies" className="text-primary underline">
          En savoir plus
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => choose("essential")}>
          Continuer avec le nécessaire
        </Button>
        <Button size="sm" variant="outline" onClick={() => choose("all")}>
          Tout accepter
        </Button>
      </div>
    </div>
  );
}
