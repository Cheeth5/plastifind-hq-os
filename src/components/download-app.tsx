import { useEffect, useState } from "react";
import { Download, MonitorDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * "Télécharger l'app" — two paths:
 *  1. PWA install (Chrome/Edge): shows "Installer l'app" when the browser offers it.
 *  2. Windows setup: links to the hosted PlastiFind-Setup.exe.
 * Hidden entirely when running inside the desktop app itself.
 */
type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    plastifindDesktop?: { isDesktop: boolean; version: string };
    __pfInstallPrompt?: PromptEvent;
  }
}

/** Hosted installer URL — swap to your own hosting if the repo goes private. */
export const DESKTOP_INSTALLER_URL =
  "https://github.com/Cheeth5/plastifind-hq-os/releases/latest/download/PlastiFind-Setup.exe";

export function DownloadAppButton({ compact = false }: { compact?: boolean }) {
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isDesktop] = useState(() => typeof window !== "undefined" && !!window.plastifindDesktop?.isDesktop);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      window.__pfInstallPrompt = event as PromptEvent;
      setInstallable(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallable(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (isDesktop) return null;

  const installPwa = async () => {
    const promptEvent = window.__pfInstallPrompt;
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") setInstalled(true);
    window.__pfInstallPrompt = undefined;
    setInstallable(false);
  };

  if (installed) return null;

  return (
    <div className={compact ? "flex gap-1.5" : "flex flex-wrap items-center gap-2"}>
      {installable && (
        <Button size={compact ? "icon" : "sm"} variant="secondary" onClick={installPwa} title="Installer l'app sur cet appareil">
          <MonitorDown className={compact ? "h-4 w-4" : "mr-1.5 h-4 w-4"} />
          {!compact && "Installer l'app"}
        </Button>
      )}
      <Button
        size={compact ? "icon" : "sm"}
        variant="outline"
        asChild
        title="Télécharger PlastiFind-Setup.exe (Windows)"
      >
        <a href={DESKTOP_INSTALLER_URL} rel="noopener">
          <Download className={compact ? "h-4 w-4" : "mr-1.5 h-4 w-4"} />
          {!compact && "Télécharger (.exe)"}
        </a>
      </Button>
    </div>
  );
}
