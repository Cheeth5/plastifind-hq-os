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
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as PromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const onClick = async () => {
    if (evt) {
      await evt.prompt();
      await evt.userChoice;
      setEvt(null);
      return;
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    toast.info("Installer PlastiFind OS", {
      description: ios
        ? "Dans Safari : bouton Partager → « Sur l'écran d'accueil »."
        : "Ouvrez l'app publiée dans Chrome ou Edge, puis cliquez sur l'icône d'installation dans la barre d'adresse.",
    });
  };

  return (
    <Button variant="outline" size="sm" className="hidden gap-1.5 md:inline-flex" onClick={onClick}>
      <Download className="h-4 w-4" /> Télécharger l'app
    </Button>
  );
}
