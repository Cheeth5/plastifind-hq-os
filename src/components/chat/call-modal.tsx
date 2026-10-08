import { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Users,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Chip } from "@/components/ui-kit";
import { initialsOf } from "@/lib/rbac";

export function CallModal({
  open,
  onOpenChange,
  calleeName,
  calleeAvatar,
  isVideo = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calleeName: string;
  calleeAvatar?: string;
  isVideo?: boolean;
}) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(isVideo);
  const [screenSharing, setScreenSharing] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!open) {
      setDuration(0);
      return;
    }
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, [open]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden border-border/80 bg-[#070d14] p-0 text-foreground">
        <div className="flex h-[460px] flex-col justify-between p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Chip tone="success" dot>
                {isVideo ? "Appel vidéo" : "Appel audio"} en cours
              </Chip>
              <span className="font-mono text-xs text-muted-foreground">
                {formatDuration(duration)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground/80">Architecture WebRTC prête</div>
          </div>

          {/* Center Stage */}
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            {isVideo && cameraOn ? (
              <div className="relative h-48 w-72 overflow-hidden rounded-2xl border border-primary/30 bg-surface/50 shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Video className="h-10 w-10 text-primary/60 animate-pulse" />
                <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">
                  {calleeName}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {calleeAvatar ? (
                  <img
                    src={calleeAvatar}
                    alt={calleeName}
                    className="h-24 w-24 rounded-full border-2 border-primary object-cover shadow-2xl"
                  />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-primary/40 bg-primary/15 text-2xl font-bold text-primary shadow-2xl">
                    {initialsOf(calleeName)}
                  </div>
                )}
                <h3 className="text-lg font-bold">{calleeName}</h3>
                <p className="text-xs text-muted-foreground">
                  Chiffré de bout en bout · PlastiFind HQ
                </p>
              </div>
            )}

            {screenSharing && (
              <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-1 text-xs text-warning">
                Vous partagez votre écran
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-center gap-3 border-t border-border/40 pt-4">
            <Button
              size="icon"
              variant={micOn ? "outline" : "destructive"}
              className="h-11 w-11 rounded-full"
              onClick={() => setMicOn((m) => !m)}
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            {isVideo && (
              <Button
                size="icon"
                variant={cameraOn ? "outline" : "secondary"}
                className="h-11 w-11 rounded-full"
                onClick={() => setCameraOn((c) => !c)}
              >
                {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            )}

            <Button
              size="icon"
              variant={screenSharing ? "secondary" : "outline"}
              className="h-11 w-11 rounded-full"
              onClick={() => setScreenSharing((s) => !s)}
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              variant="destructive"
              className="h-11 w-11 rounded-full bg-red-600 hover:bg-red-700"
              onClick={() => onOpenChange(false)}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
