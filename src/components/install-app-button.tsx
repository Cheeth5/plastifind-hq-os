import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallAppButton() {
  const [evt, setEvt] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    const w = window as unknown as { __pfInstall?: PromptEvent };
    if (w.__pfInstall) setEvt(w.__pfInstall);
    const onReady = () => w.__pfInstall && setEvt(w.__pfInstall);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as PromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("pf-install-ready", onReady);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("pf-install-ready", onReady);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const onClick = async () => {
    if (evt) {
      await evt.prompt();
      await evt.userChoice;
      (window as unknown as { __pfInstall?: PromptEvent }).__pfInstall = undefined;
      setEvt(null);
      return;
    }
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const edge = /edg\//i.test(ua);
    toast.info("Installer PlastiFind OS", {
      duration: 12000,
      description: ios
        ? "Dans Safari : bouton Partager → « Sur l'écran d'accueil »."
        : edge
          ? "Menu ⋯ en haut à droite → Applications → « Installer PlastiFind OS »."
          : "Menu ⋮ en haut à droite → « Caster, enregistrer et partager » → « Installer la page en tant qu'application ». Si l'app est déjà installée, ouvrez-la depuis le menu Démarrer.",
    });
  };

  return (
    <Button variant="outline" size="sm" className="hidden gap-1.5 md:inline-flex" onClick={onClick}>
      <Download className="h-4 w-4" /> Télécharger l'app
    </Button>
  );
}
