import { useEffect, useState } from "react";
import {
  CornerUpLeft,
  Copy,
  FileText,
  Forward,
  Loader2,
  MessageSquare,
  MoreVertical,
  Pencil,
  Pin,
  Smile,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { displayName, formatClock, initialsOf, type Row } from "@/lib/collab";
import { resolveFileUrl } from "@/lib/db";
import { cn } from "@/lib/utils";

const REACTIONS = ["👍", "🎉", "❤️", "😄", "👀"];

export function AttachmentPreview({
  path,
  name,
  type,
}: {
  path: string;
  name?: string | null;
  type?: string | null;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    resolveFileUrl(path)
      .then((u) => alive && setUrl(u))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [path]);
  const isImage =
    /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(path) || (type ?? "").startsWith("image/");
  const isVideo = /\.(mp4|webm|mov)$/i.test(path) || (type ?? "").startsWith("video/");

  if (loading) return <Loader2 className="mt-2 h-4 w-4 animate-spin text-muted-foreground" />;
  if (!url)
    return (
      <span className="mt-1 block text-xs text-muted-foreground">Pièce jointe indisponible</span>
    );

  if (isImage)
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mt-2 block">
        <img
          src={url}
          alt={name ?? "Pièce jointe"}
          loading="lazy"
          className="max-h-72 rounded-lg border border-border object-cover"
        />
      </a>
    );
  if (isVideo)
    return (
      <video
        src={url}
        controls
        className="mt-2 max-h-72 rounded-lg border border-border"
        preload="metadata"
      />
    );
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs transition-colors hover:border-primary/40"
    >
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/12">
        <FileText className="h-4 w-4 text-primary" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{name ?? "Fichier"}</span>
        <span className="text-[10px] text-muted-foreground">Télécharger</span>
      </span>
    </a>
  );
}

export function MessageItem({
  message,
  mine,
  author,
  parent,
  reactions,
  meId,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onPin,
  onOpenThread,
  threadCount,
}: {
  message: Row;
  mine: boolean;
  author?: Row;
  parent?: Row | null;
  reactions: Record<string, Row[]>;
  meId?: string;
  onReply: () => void;
  onReact: (emoji: string, existingId?: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
  onOpenThread: () => void;
  threadCount: number;
}) {
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const authorName = displayName(author, mine ? "Vous" : "Membre");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(message["body"] ?? ""));
      toast.success("Message copié");
    } catch {
      toast.error("Copie impossible");
    }
  };

  return (
    <div className="group relative flex gap-3 px-4 py-1 transition-colors hover:bg-accent/30">
      <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-[11px] font-bold">
        {initialsOf(authorName === "Vous" ? "Moi" : authorName)}
      </span>

      <div className="min-w-0 flex-1 pb-1">
        <p className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{authorName}</span>
          <span className="text-[11px] text-muted-foreground">
            {formatClock(message["created_at"])}
          </span>
          {message["pinned"] && <Pin className="h-3 w-3 text-primary" />}
          {message["edited_at"] && (
            <span className="text-[10px] italic text-muted-foreground">(modifié)</span>
          )}
        </p>

        {parent && (
          <button
            onClick={onOpenThread}
            className="mt-0.5 flex max-w-md items-center gap-1.5 truncate rounded-md border-l-2 border-primary/50 bg-accent/40 px-2 py-1 text-left text-[11px] text-muted-foreground hover:bg-accent"
          >
            <CornerUpLeft className="h-3 w-3 shrink-0" />
            <span className="truncate">{parent["body"]}</span>
          </button>
        )}

        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message["body"]}
        </div>

        {message["attachment_path"] && (
          <AttachmentPreview
            path={message["attachment_path"]}
            name={message["attachment_name"]}
            type={message["attachment_type"]}
          />
        )}

        <div className="mt-1 flex flex-wrap items-center gap-1">
          {Object.entries(reactions).map(([emoji, rows]) => {
            const mineR = rows.find((r) => r["user_id"] === meId);
            return (
              <button
                key={emoji}
                onClick={() => onReact(emoji, mineR?.["id"] as string | undefined)}
                className={cn(
                  "rounded-full border px-1.5 py-0.5 text-[11px] transition-colors",
                  mineR
                    ? "border-primary bg-primary/12 text-primary"
                    : "border-border hover:bg-accent",
                )}
              >
                {emoji} {rows.length}
              </button>
            );
          })}
          {threadCount > 0 && (
            <button
              onClick={onOpenThread}
              className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] text-primary hover:bg-primary/10"
            >
              <MessageSquare className="h-3 w-3" /> {threadCount} réponse
              {threadCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      {/* Floating hover toolbar */}
      <div
        className="absolute right-3 top-0 z-10 hidden -translate-y-1/2 items-center gap-0.5 rounded-lg border border-border bg-popover p-0.5 shadow-md group-hover:flex"
        onMouseEnter={() => setToolbarOpen(true)}
        onMouseLeave={() => setToolbarOpen(false)}
      >
        {REACTIONS.slice(0, 3).map((e) => (
          <button
            key={e}
            className="rounded p-1 text-sm hover:bg-accent"
            title={`Réagir ${e}`}
            onClick={() => onReact(e)}
          >
            {e}
          </button>
        ))}
        <span className="mx-0.5 h-4 w-px bg-border" />
        <button
          className="rounded p-1 hover:bg-accent"
          title="Répondre en thread"
          onClick={onReply}
        >
          <CornerUpLeft className="h-3.5 w-3.5" />
        </button>
        <button className="rounded p-1 hover:bg-accent" title="Copier" onClick={copy}>
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button className="rounded p-1 hover:bg-accent" title="Épingler" onClick={onPin}>
          <Pin className="h-3.5 w-3.5" />
        </button>
        <div className="relative">
          <button
            className={cn("rounded p-1 hover:bg-accent", toolbarOpen && "bg-accent")}
            title="Plus"
            onClick={() => setToolbarOpen((o) => !o)}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
          {toolbarOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setToolbarOpen(false)} />
              <div className="absolute right-0 top-8 z-50 w-40 overflow-hidden rounded-lg border border-border bg-popover py-1 text-sm shadow-lg">
                <button
                  className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-accent"
                  onClick={() => {
                    setToolbarOpen(false);
                    onOpenThread();
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Fil de discussion
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-accent"
                  onClick={() => {
                    setToolbarOpen(false);
                    copy();
                  }}
                >
                  <Forward className="h-3.5 w-3.5" /> Copier / Transférer
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-accent"
                  onClick={() => {
                    setToolbarOpen(false);
                    onReact("👍");
                  }}
                >
                  <Smile className="h-3.5 w-3.5" /> Réagir
                </button>
                {mine && (
                  <>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-accent"
                      onClick={() => {
                        setToolbarOpen(false);
                        onEdit();
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Modifier
                    </button>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-destructive hover:bg-accent"
                      onClick={() => {
                        setToolbarOpen(false);
                        onDelete();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Supprimer
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
