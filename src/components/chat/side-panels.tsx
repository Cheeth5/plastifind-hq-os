import { useMemo, useState } from "react";
import {
  FileText,
  Hash,
  Info,
  Link2,
  Loader2,
  MessageSquare,
  Paperclip,
  Pin,
  Send,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { displayName, initialsOf, formatClock, timeAgo, type Row } from "@/lib/collab";
import { cn } from "@/lib/utils";
import { AttachmentPreview } from "./message-item";

/* ------------------------------ THREAD PANEL ------------------------------ */

export function ThreadPanel({
  root,
  allMessages,
  profiles,
  meId,
  onClose,
  onSendReply,
  sending,
  replyDraft,
  onReplyDraft,
}: {
  root: Row;
  allMessages: Row[];
  profiles: Record<string, Row>;
  meId?: string;
  onClose: () => void;
  onSendReply: () => void;
  sending: boolean;
  replyDraft: string;
  onReplyDraft: (v: string) => void;
}) {
  const replies = useMemo(
    () => allMessages.filter((m) => m["parent_id"] === root["id"]),
    [allMessages, root],
  );
  const authorName = displayName(profiles[root["user_id"] as string], "Membre");

  return (
    <div className="flex h-full w-80 min-w-72 flex-col border-l border-border bg-card">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <MessageSquare className="h-4 w-4 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Fil de discussion</p>
          <p className="text-[11px] text-muted-foreground">
            {replies.length} réponse{replies.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        <div className="border-b border-border px-3 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{authorName}</span>
            <span className="text-[11px] text-muted-foreground">
              {formatClock(root["created_at"])}
            </span>
          </div>
          <div className="mt-1 whitespace-pre-wrap break-words text-sm">{root["body"]}</div>
          {root["attachment_path"] && (
            <AttachmentPreview
              path={root["attachment_path"]}
              name={root["attachment_name"]}
              type={root["attachment_type"]}
            />
          )}
        </div>

        <div className="px-3 pt-3">
          {replies.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Aucune réponse pour l'instant.
            </p>
          )}
          {replies.map((m) => (
            <div key={m["id"]} className="flex gap-2 py-1.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface text-[10px] font-bold">
                {initialsOf(displayName(profiles[m["user_id"] as string], "?"))}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold">
                    {displayName(profiles[m["user_id"] as string], "Membre")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatClock(m["created_at"])}
                  </span>
                </p>
                <div className="whitespace-pre-wrap break-words text-xs">{m["body"]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-border p-2.5">
        <div className="flex items-end gap-1.5">
          <Textarea
            value={replyDraft}
            rows={1}
            onChange={(e) => onReplyDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (replyDraft.trim()) onSendReply();
              }
            }}
            placeholder="Répondre dans le fil…"
            className="max-h-28 min-h-9 flex-1 resize-none"
          />
          <Button
            size="icon"
            className="h-9 w-9"
            disabled={sending || !replyDraft.trim()}
            onClick={onSendReply}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}

/* ----------------------------- INFO SIDEBAR ------------------------------ */

export function InfoSidebar({
  conversation,
  profiles,
  meId,
  messages,
  onClose,
}: {
  conversation: Row;
  profiles: Record<string, Row>;
  meId?: string;
  messages: Row[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"details" | "files" | "pinned">("details");
  const members = ((conversation["conversation_members"] ?? []) as Row[]).filter(
    (m) => m["user_id"] !== meId,
  );
  const isDm = conversation["type"] === "dm";
  const attachments = messages.filter((m) => m["attachment_path"]);
  const pinned = messages.filter((m) => m["pinned"]);

  return (
    <div className="flex h-full w-72 min-w-64 flex-col border-l border-border bg-card">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Info className="h-4 w-4 text-primary" />
        <p className="flex-1 text-sm font-semibold">Informations</p>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex border-b border-border text-xs">
        {(
          [
            ["details", isDm ? "Profil" : "Membres"],
            ["files", "Fichiers"],
            ["pinned", "Épinglés"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              "flex-1 border-b-2 px-2 py-2 transition-colors",
              tab === value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 text-sm">
        {tab === "details" && (
          <div className="space-y-3">
            {isDm ? (
              members.slice(0, 1).map((m) => {
                const p = profiles[m["user_id"] as string];
                return (
                  <div key={m["id"]} className="space-y-2 text-center">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-border bg-surface text-xl font-bold">
                      {initialsOf(displayName(p, "?"))}
                    </span>
                    <p className="font-semibold">{displayName(p, "Membre")}</p>
                    <p className="text-xs text-muted-foreground">
                      {(p?.["title"] as string) ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(p?.["department"] as string) ?? ""}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="space-y-2">
                {members.map((m) => {
                  const p = profiles[m["user_id"] as string];
                  return (
                    <div
                      key={m["id"]}
                      className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-accent/50"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-[10px] font-bold">
                        {initialsOf(displayName(p, "?"))}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{displayName(p, "Membre")}</p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {(p?.["title"] as string) ?? ""}
                        </p>
                      </div>
                      <span className="ml-auto text-[10px] text-muted-foreground">{m["role"]}</span>
                    </div>
                  );
                })}
                <p className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                  <Users className="h-3 w-3" /> {members.length + 1} membres
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "files" && (
          <div className="space-y-2">
            {attachments.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Aucun fichier partagé.
              </p>
            )}
            {attachments.map((m) => (
              <div key={m["id"]} className="rounded-lg border border-border p-2">
                <p className="flex items-center gap-1.5 truncate text-xs font-medium">
                  {/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(String(m["attachment_path"])) ? (
                    <Hash className="h-3 w-3 shrink-0 text-primary" />
                  ) : (
                    <FileText className="h-3 w-3 shrink-0 text-primary" />
                  )}
                  {String(m["attachment_name"] ?? "Fichier")}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {displayName(profiles[m["user_id"] as string], "?")} · {timeAgo(m["created_at"])}
                </p>
                <div className="mt-1.5">
                  <AttachmentPreview
                    path={m["attachment_path"] as string}
                    name={m["attachment_name"]}
                    type={m["attachment_type"]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "pinned" && (
          <div className="space-y-2">
            {pinned.length === 0 && (
              <p className="flex items-center justify-center gap-1.5 py-4 text-center text-xs text-muted-foreground">
                <Pin className="h-3 w-3" /> Aucun message épinglé
              </p>
            )}
            {pinned.map((m) => (
              <div key={m["id"]} className="rounded-lg border-l-2 border-primary bg-accent/40 p-2">
                <p className="text-[10px] font-semibold text-primary">
                  {displayName(profiles[m["user_id"] as string], "?")} ·{" "}
                  {formatClock(m["created_at"])}
                </p>
                <p className="mt-0.5 line-clamp-3 text-xs">{m["body"]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
