import { useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Paperclip, Plus, Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["👍", "🎉", "🚀", "❤️", "😄", "👀", "🔥", "✅", "❓", "🙏", "😅", "🤖"];

export type PendingFile = { id: string; file: File; previewUrl?: string };

export function Composer({
  draft,
  onDraftChange,
  onSend,
  onTyping,
  sending,
  replyPreview,
  editingPreview,
  onCancelContext,
  onFilesPicked,
  pendingFiles,
  onRemoveFile,
  uploadingFiles,
}: {
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onTyping: (typing: boolean) => void;
  sending: boolean;
  replyPreview?: { author: string; body: string } | null;
  editingPreview?: { body: string } | null;
  onCancelContext: () => void;
  onFilesPicked: (files: File[]) => void;
  pendingFiles: PendingFile[];
  onRemoveFile: (id: string) => void;
  uploadingFiles: boolean;
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  const canSend =
    (draft.trim().length > 0 || pendingFiles.length > 0) && !sending && !uploadingFiles;

  return (
    <div
      className={cn(
        "border-t border-border p-3 transition-colors",
        dragOver && "bg-primary/5 ring-2 ring-inset ring-primary/40",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length) onFilesPicked(files);
      }}
    >
      {(replyPreview || editingPreview) && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border-l-2 border-primary bg-accent/50 px-3 py-1.5 text-xs">
          <span className="font-semibold text-primary">
            {editingPreview ? "Modification" : `Réponse à ${replyPreview?.author}`}
          </span>
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            {(editingPreview ?? replyPreview)?.body}
          </span>
          <button
            className="rounded p-0.5 hover:bg-accent"
            onClick={onCancelContext}
            aria-label="Annuler"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {pendingFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map((p) => (
            <div
              key={p.id}
              className="group relative flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5"
            >
              {p.previewUrl ? (
                <img src={p.previewUrl} alt="" className="h-8 w-8 rounded object-cover" />
              ) : (
                <FileText className="h-4 w-4 text-primary" />
              )}
              <span className="max-w-40 truncate text-xs">{p.file.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {(p.file.size / 1024).toFixed(0)} Ko
              </span>
              <button
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-destructive"
                onClick={() => onRemoveFile(p.id)}
                aria-label="Retirer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5">
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onFilesPicked(files);
            e.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground"
          disabled={uploadingFiles}
          aria-label="Joindre un fichier"
          onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}
        >
          {uploadingFiles ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground"
          aria-label="Image"
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling
              ?.previousElementSibling as HTMLInputElement | null;
            if (input) {
              input.accept = "image/*";
              input.click();
              input.accept = "";
            }
          }}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Textarea
          ref={textRef}
          value={draft}
          rows={1}
          onChange={(e) => {
            onDraftChange(e.target.value);
            onTyping(!!e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder="Écrire un message…  (@ pour mentionner, glissez-déposez des fichiers)"
          className="max-h-40 min-h-9 flex-1 resize-none border-0 bg-accent/40 focus-visible:ring-1 focus-visible:ring-primary/40"
        />

        <div className="relative shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            aria-label="Emoji"
            onClick={() => setEmojiOpen((o) => !o)}
          >
            <Smile className="h-4 w-4" />
          </Button>
          {emojiOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setEmojiOpen(false)} />
              <div className="absolute bottom-11 right-0 z-50 grid w-56 grid-cols-6 gap-1 rounded-xl border border-border bg-popover p-2 shadow-lg">
                {QUICK_EMOJIS.map((e) => (
                  <button
                    key={e}
                    className="rounded p-1 text-lg hover:bg-accent"
                    onClick={() => {
                      onDraftChange(draft + e);
                      setEmojiOpen(false);
                      textRef.current?.focus();
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          disabled={!canSend}
          onClick={onSend}
          aria-label="Envoyer"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <p className="mt-1.5 flex items-center gap-1 pl-1 text-[11px] text-muted-foreground">
        <Plus className="h-3 w-3" /> <kbd className="rounded border border-border px-1">Entrée</kbd>{" "}
        envoyer · <kbd className="rounded border border-border px-1">Maj+Entrée</kbd> nouvelle ligne
        · glisser-déposer accepté
      </p>
    </div>
  );
}
