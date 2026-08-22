import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CornerUpLeft,
  Hash,
  Loader2,
  MessageSquare,
  Paperclip,
  Pencil,
  Pin,
  Plus,
  Search,
  Send,
  SmilePlus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  displayName,
  initialsOf,
  timeAgo,
  useConversations,
  useCreateConversation,
  useCurrentUser,
  useDeleteMessage,
  useMarkRead,
  useMessages,
  usePresence,
  useProfiles,
  useProfileMap,
  useRealtimeMessages,
  useSendMessage,
  useToggleReaction,
  useUpdateMessage,
  type Row,
} from "@/lib/collab";
import { uploadFile, resolveFileUrl } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({
    meta: [
      { title: "Messagerie interne — PlastiFind OS" },
      {
        name: "description",
        content: "Messagerie temps réel de l'équipe PlastiFind : conversations directes, groupes, canaux et fichiers.",
      },
      { property: "og:title", content: "Messagerie interne — PlastiFind OS" },
      { property: "og:description", content: "Discussions temps réel de l'équipe PlastiFind." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessagesPage,
});

const EMOJIS = ["👍", "🎉", "🚀", "❤️", "😄", "👀"];

function convTitle(c: Row, profiles: Record<string, Row>, meId?: string) {
  if (c["name"]) return c["name"] as string;
  const others = ((c["conversation_members"] ?? []) as Row[]).filter((m) => m["user_id"] !== meId);
  if (!others.length) return "Note personnelle";
  return others.map((m) => displayName(profiles[m["user_id"] as string])).join(", ");
}

function Attachment({ path, name }: { path: string; name?: string | null }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    let alive = true;
    resolveFileUrl(path).then((u) => alive && setUrl(u)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [path]);
  const isImage = /\.(png|jpe?g|gif|webp|avif)$/i.test(path);
  if (!url) return <span className="text-xs text-muted-foreground">Chargement de la pièce jointe…</span>;
  if (isImage)
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <img src={url} alt={name ?? "Pièce jointe"} loading="lazy" className="mt-2 max-h-64 rounded-lg border border-border" />
      </a>
    );
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:border-primary/40"
    >
      <Paperclip className="h-3.5 w-3.5 text-primary" /> {name ?? "Fichier"}
    </a>
  );
}

function NewConversation({ meId, onCreated }: { meId?: string; onCreated: (conversationId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"dm" | "group" | "channel">("dm");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const { data: profiles } = useProfiles();
  const create = useCreateConversation();

  const people = (profiles ?? []).filter((p) => p["id"] !== meId);

  const submit = async () => {
    if (type !== "dm" && !name.trim()) {
      toast.error("Nom requis");
      return;
    }
    if (!members.length) {
      toast.error("Sélectionnez au moins un membre");
      return;
    }
    const conversation = await create.mutateAsync({
      type,
      name: type === "dm" ? null : name.trim(),
      description: description.trim() || null,
      memberIds: type === "dm" ? members.slice(0, 1) : members,
    });
    setOpen(false);
    setName("");
    setDescription("");
    setMembers([]);
    onCreated(String(conversation["id"]));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <Plus className="mr-1.5 h-4 w-4" /> Nouvelle conversation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dm">Message direct</SelectItem>
                <SelectItem value="group">Groupe</SelectItem>
                <SelectItem value="channel">Canal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type !== "dm" && (
            <>
              <div className="grid gap-1.5">
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingénierie Labi-Bot" />
              </div>
              <div className="grid gap-1.5">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>
            </>
          )}
          <div className="grid gap-1.5">
            <Label>Membres</Label>
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
              {people.length === 0 && <p className="p-2 text-xs text-muted-foreground">Aucun autre membre pour le moment.</p>}
              {people.map((p) => {
                const id = p["id"] as string;
                const on = members.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setMembers((m) =>
                        on ? m.filter((x) => x !== id) : type === "dm" ? [id] : [...m, id],
                      )
                    }
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      on ? "bg-primary/12 text-primary" : "hover:bg-accent/50",
                    )}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-border text-[10px] font-bold">
                      {initialsOf(displayName(p))}
                    </span>
                    <span className="truncate">{displayName(p)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MessagesPage() {
  const { data: me } = useCurrentUser();
  const meId = me?.id;
  const profiles = useProfileMap();
  const { data: conversations, isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const initializedSelection = useRef(false);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    const rows = conversations ?? [];
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((c) => convTitle(c, profiles, meId).toLowerCase().includes(needle));
  }, [conversations, q, profiles, meId]);

  useEffect(() => {
    const rows = conversations ?? [];
    if (activeId && !rows.some((conversation) => conversation["id"] === activeId)) setActiveId(undefined);
    if (!initializedSelection.current && !isLoading) {
      initializedSelection.current = true;
      if (rows.length) setActiveId(rows[0]!["id"] as string);
    }
  }, [conversations, activeId, isLoading]);

  const active = (conversations ?? []).find((c) => c["id"] === activeId);
  const { data: messages } = useMessages(activeId);
  useRealtimeMessages(activeId);
  const send = useSendMessage(activeId);
  const update = useUpdateMessage(activeId);
  const remove = useDeleteMessage(activeId);
  const react = useToggleReaction(activeId);
  const markRead = useMarkRead(activeId, meId);
  const myName = displayName(profiles[meId ?? ""], me?.email ?? "Membre");
  const { state: presence, setTyping } = usePresence(activeId, meId, myName);

  useEffect(() => {
    if (activeId && meId) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, meId, messages?.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, activeId]);

  const typingNames = Object.entries(presence)
    .flatMap(([key, metas]) => (key === meId ? [] : (metas as Row[])))
    .filter((m) => m["typing"])
    .map((m) => m["name"] as string);

  const visible = useMemo(() => {
    const rows = messages ?? [];
    if (!search.trim()) return rows;
    const n = search.toLowerCase();
    return rows.filter((m) => String(m["body"] ?? "").toLowerCase().includes(n));
  }, [messages, search]);

  const pinned = (messages ?? []).filter((m) => m["pinned"]);

  const submit = async () => {
    const body = draft.trim();
    if (!body) return;
    if (editing) {
      await update.mutateAsync({ id: editing["id"] as string, values: { body, edited_at: new Date().toISOString() } });
      setEditing(null);
      setDraft("");
      return;
    }
    const mentions = Object.values(profiles)
      .filter((p) => body.includes(`@${displayName(p).split(" ")[0]}`))
      .map((p) => p["id"] as string);
    await send.mutateAsync({ body, parent_id: (replyTo?.["id"] as string) ?? null, mentions });
    setDraft("");
    setReplyTo(null);
    setTyping(false);
  };

  const onFile = async (file: File) => {
    setUploading(true);
    try {
      const path = await uploadFile(file, "messages");
      await send.mutateAsync({
        body: file.name,
        attachment_path: path,
        attachment_name: file.name,
        attachment_type: file.type,
      });
    } catch (e) {
      toast.error("Envoi du fichier impossible", { description: (e as Error).message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Collaboration"
        title="Messagerie interne"
        icon={<MessageSquare className="h-5 w-5" />}
        description="Conversations directes, groupes et canaux de l'équipe PlastiFind, en temps réel."
      />

      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Conversation list */}
        <aside className={cn("panel flex max-h-[70vh] flex-col p-3", activeId && "hidden lg:flex")}>
          <NewConversation meId={meId} onCreated={(conversationId) => setActiveId(conversationId)} />
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="pl-8" />
          </div>
          <div className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto">
            {isLoading && <p className="p-3 text-xs text-muted-foreground">Chargement…</p>}
            {!isLoading && list.length === 0 && (
              <p className="p-3 text-xs text-muted-foreground">Aucune conversation. Créez-en une pour démarrer.</p>
            )}
            {list.map((c) => {
              const on = c["id"] === activeId;
              const Icon = c["type"] === "channel" ? Hash : c["type"] === "group" ? Users : MessageSquare;
              return (
                <button
                  key={c["id"]}
                  onClick={() => setActiveId(c["id"] as string)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                    on ? "bg-primary/12 text-primary" : "hover:bg-accent/50",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{convTitle(c, profiles, meId)}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{timeAgo(c["updated_at"])}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat */}
        <section className={cn("panel flex max-h-[70vh] min-h-[520px] flex-col", !activeId && "hidden lg:flex")}>
          {!active ? (
            <div className="grid flex-1 place-items-center p-6">
              <EmptyState
                title="Aucune conversation sélectionnée"
                description="Créez une conversation directe, un groupe ou un canal pour commencer à collaborer."
              />
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setActiveId(undefined)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{convTitle(active, profiles, meId)}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {typingNames.length ? `${typingNames.join(", ")} écrit…` : `${((active["conversation_members"] ?? []) as Row[]).length} membre(s)`}
                  </p>
                </div>
                <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un message"
                    className="h-8 w-48 pl-8 text-xs"
                  />
                </div>
              </header>

              {pinned.length > 0 && (
                <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-2 text-xs">
                  <Pin className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{pinned[pinned.length - 1]!["body"]}</span>
                </div>
              )}

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {visible.length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">Aucun message. Dites bonjour 👋</p>
                )}
                {visible.map((m) => {
                  const mine = m["user_id"] === meId;
                  const author = profiles[m["user_id"] as string];
                  const parent = (messages ?? []).find((x) => x["id"] === m["parent_id"]);
                  const reactions = ((m["message_reactions"] ?? []) as Row[]).reduce<Record<string, Row[]>>((acc, r) => {
                    (acc[r["emoji"] as string] ||= []).push(r);
                    return acc;
                  }, {});
                  return (
                    <div key={m["id"]} className={cn("group flex gap-2.5", mine && "flex-row-reverse")}>
                      <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-[10px] font-bold">
                        {initialsOf(displayName(author, "?"))}
                      </span>
                      <div className={cn("min-w-0 max-w-[85%]", mine && "text-right")}>
                        <p className="text-[11px] text-muted-foreground">
                          {displayName(author, mine ? "Vous" : "Membre")} · {timeAgo(m["created_at"])}
                          {m["edited_at"] && " · (modifié)"}
                        </p>
                        {parent && (
                          <p className="mt-1 truncate rounded-md border-l-2 border-primary/50 bg-accent/40 px-2 py-1 text-left text-[11px] text-muted-foreground">
                            {parent["body"]}
                          </p>
                        )}
                        <div
                          className={cn(
                            "mt-1 inline-block rounded-2xl px-3.5 py-2 text-left text-sm",
                            mine ? "bg-primary text-primary-foreground" : "border border-border bg-surface",
                          )}
                        >
                          <span className="whitespace-pre-wrap break-words">{m["body"]}</span>
                          {m["attachment_path"] && <Attachment path={m["attachment_path"]} name={m["attachment_name"]} />}
                        </div>

                        <div className={cn("mt-1 flex flex-wrap items-center gap-1", mine && "justify-end")}>
                          {Object.entries(reactions).map(([emoji, rows]) => {
                            const mineR = rows.find((r) => r["user_id"] === meId);
                            return (
                              <button
                                key={emoji}
                                onClick={() =>
                                  react.mutate({
                                    messageId: m["id"] as string,
                                    emoji,
                                    ...(mineR ? { existingId: mineR["id"] as string } : {}),
                                  })
                                }
                                className={cn(
                                  "rounded-full border px-1.5 py-0.5 text-[11px] transition-colors",
                                  mineR ? "border-primary bg-primary/12 text-primary" : "border-border hover:bg-accent",
                                )}
                              >
                                {emoji} {rows.length}
                              </button>
                            );
                          })}
                          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            {EMOJIS.map((e) => (
                              <button
                                key={e}
                                onClick={() => react.mutate({ messageId: m["id"] as string, emoji: e })}
                                className="rounded px-1 text-[13px] hover:bg-accent"
                                aria-label={`Réagir ${e}`}
                              >
                                {e}
                              </button>
                            ))}
                            <button className="rounded p-1 hover:bg-accent" title="Répondre" onClick={() => setReplyTo(m)}>
                              <CornerUpLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="rounded p-1 hover:bg-accent"
                              title="Épingler"
                              onClick={() => update.mutate({ id: m["id"] as string, values: { pinned: !m["pinned"] } })}
                            >
                              <Pin className="h-3.5 w-3.5" />
                            </button>
                            {mine && (
                              <>
                                <button
                                  className="rounded p-1 hover:bg-accent"
                                  title="Modifier"
                                  onClick={() => {
                                    setEditing(m);
                                    setDraft(m["body"] as string);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  className="rounded p-1 text-destructive hover:bg-accent"
                                  title="Supprimer"
                                  onClick={() => remove.mutate(m["id"] as string)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <footer className="border-t border-border p-3">
                {(replyTo || editing) && (
                  <div className="mb-2 flex items-center gap-2 rounded-md bg-accent/50 px-2.5 py-1.5 text-xs">
                    <span className="truncate">
                      {editing ? "Modification" : "Réponse"} : {(editing ?? replyTo)?.["body"]}
                    </span>
                    <button
                      className="ml-auto"
                      onClick={() => {
                        setReplyTo(null);
                        setEditing(null);
                        setDraft("");
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void onFile(f);
                      e.target.value = "";
                    }}
                  />
                  <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                  </Button>
                  <Textarea
                    value={draft}
                    rows={1}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      setTyping(!!e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void submit();
                      }
                    }}
                    placeholder="Écrire un message… (@ pour mentionner)"
                    className="max-h-32 min-h-10 flex-1 resize-none"
                  />
                  <Button size="icon" onClick={() => void submit()} disabled={send.isPending || !draft.trim()}>
                    {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <SmilePlus className="h-3 w-3" /> Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne
                </p>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
