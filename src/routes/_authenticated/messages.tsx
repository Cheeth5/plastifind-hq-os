import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowLeft,
  Hash,
  Loader2,
  MessageSquare,
  MoreVertical,
  Phone,
  Pin,
  Plus,
  Search,
  Send,
  Star,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui-kit";
import { Composer, type PendingFile } from "@/components/chat/composer";
import { MessageItem } from "@/components/chat/message-item";
import { InfoSidebar, ThreadPanel } from "@/components/chat/side-panels";
import { CallModal } from "@/components/chat/call-modal";
import {
  displayName,
  formatClock,
  initialsOf,
  timeAgo,
  useConversations,
  useCreateConversation,
  useCurrentUser,
  useDeleteMessage,
  useMarkRead,
  useMessages,
  useMyMembership,
  usePresence,
  useProfiles,
  useProfileMap,
  useRealtimeConversations,
  useRealtimeMessages,
  useSendMessage,
  useSetConversationFlags,
  useToggleReaction,
  useUpdateMessage,
  type ConversationFilter,
  type Row,
} from "@/lib/collab";
import { uploadFile } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({
    meta: [
      { title: "Messagerie interne — PlastiFind OS" },
      {
        name: "description",
        content:
          "Messagerie temps réel de l'équipe PlastiFind : conversations directes, groupes, canaux et fichiers.",
      },
      { property: "og:title", content: "Messagerie interne — PlastiFind OS" },
      { property: "og:description", content: "Discussions temps réel de l'équipe PlastiFind." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessagesPage,
});

function convTitle(c: Row, profiles: Record<string, Row>, meId?: string) {
  if (c["name"]) return c["name"] as string;
  const others = ((c["conversation_members"] ?? []) as Row[]).filter((m) => m["user_id"] !== meId);
  if (!others.length) return "Note personnelle";
  return others.map((m) => displayName(profiles[m["user_id"] as string])).join(", ");
}

function convLastMessage(c: Row): { body: string; at: string } | null {
  const at = c["last_message_at"] as string | undefined;
  if (!at) return null;
  return { body: String(c["last_message_preview"] ?? ""), at };
}

function NewConversation({
  meId,
  onCreated,
}: {
  meId?: string;
  onCreated: (conversationId: string) => void;
}) {
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
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ingénierie Labi-Bot"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}
          <div className="grid gap-1.5">
            <Label>Membres</Label>
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
              {people.length === 0 && (
                <p className="p-2 text-xs text-muted-foreground">
                  Aucun autre membre pour le moment.
                </p>
              )}
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

const FILTERS: { value: ConversationFilter; label: string; icon?: React.ReactNode }[] = [
  { value: "all", label: "Toutes" },
  { value: "dm", label: "Directs", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { value: "group", label: "Groupes", icon: <Users className="h-3.5 w-3.5" /> },
  { value: "channel", label: "Canaux", icon: <Hash className="h-3.5 w-3.5" /> },
  { value: "favorites", label: "Favoris", icon: <Star className="h-3.5 w-3.5" /> },
  { value: "archived", label: "Archivés", icon: <Archive className="h-3.5 w-3.5" /> },
];

function MessagesPage() {
  const { data: me } = useCurrentUser();
  const meId = me?.id;
  const profiles = useProfileMap();
  const { data: conversations, isLoading } = useConversations();
  useRealtimeConversations();

  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const initializedSelection = useRef(false);
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [replyTo, setReplyTo] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [threadRoot, setThreadRoot] = useState<Row | null>(null);
  const [threadDraft, setThreadDraft] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [call, setCall] = useState<{ open: boolean; video: boolean }>({
    open: false,
    video: false,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = useSendMessage(activeId);
  const update = useUpdateMessage(activeId);
  const remove = useDeleteMessage(activeId);
  const react = useToggleReaction(activeId);
  const flags = useSetConversationFlags(activeId);
  const markRead = useMarkRead(activeId, meId);

  const list = useMemo(() => {
    let rows = conversations ?? [];
    if (filter === "favorites")
      rows = rows.filter(
        (c) =>
          ((c["conversation_members"] ?? []) as Row[]).find((m) => m["user_id"] === meId)?.[
            "favorited"
          ],
      );
    else if (filter === "archived")
      rows = rows.filter(
        (c) =>
          ((c["conversation_members"] ?? []) as Row[]).find((m) => m["user_id"] === meId)?.[
            "archived"
          ],
      );
    else
      rows = rows.filter(
        (c) =>
          (filter === "all" ? true : c["type"] === filter) &&
          !((c["conversation_members"] ?? []) as Row[]).find((m) => m["user_id"] === meId)?.[
            "archived"
          ],
      );
    if (q.trim()) {
      const needle = q.toLowerCase();
      rows = rows.filter((c) => convTitle(c, profiles, meId).toLowerCase().includes(needle));
    }
    return rows;
  }, [conversations, filter, q, profiles, meId]);

  useEffect(() => {
    const rows = conversations ?? [];
    if (activeId && !rows.some((c) => c["id"] === activeId)) setActiveId(undefined);
    if (!initializedSelection.current && !isLoading) {
      initializedSelection.current = true;
      if (rows.length) setActiveId(rows[0]!["id"] as string);
    }
  }, [conversations, activeId, isLoading]);

  const active = (conversations ?? []).find((c) => c["id"] === activeId);
  const { data: messages } = useMessages(activeId);
  useRealtimeMessages(activeId);
  const membership = useMyMembership(activeId, meId);
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
    return rows.filter((m) =>
      String(m["body"] ?? "")
        .toLowerCase()
        .includes(n),
    );
  }, [messages, search]);

  const rootMessages = visible.filter((m) => !m["parent_id"]);

  const handleFilesPicked = (files: File[]) => {
    const items = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    setPendingFiles((prev) => [...prev, ...items]);
  };

  const flushFiles = async () => {
    if (!pendingFiles.length) return;
    setUploadingFiles(true);
    try {
      for (const p of pendingFiles) {
        const path = await uploadFile(p.file, "messages");
        await send.mutateAsync({
          body: p.file.name,
          attachment_path: path,
          attachment_name: p.file.name,
          attachment_type: p.file.type,
          parent_id: (replyTo?.["id"] as string) ?? null,
        });
      }
      setPendingFiles([]);
      setReplyTo(null);
    } catch (e) {
      toast.error("Envoi des fichiers impossible", { description: (e as Error).message });
    } finally {
      setUploadingFiles(false);
    }
  };

  const submit = async () => {
    if (!pendingFiles.length) {
      const body = draft.trim();
      if (!body) return;
      if (editing) {
        await update.mutateAsync({
          id: editing["id"] as string,
          values: { body, edited_at: new Date().toISOString() },
        });
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
      return;
    }
    await flushFiles();
  };

  const submitThreadReply = async () => {
    if (!threadRoot || !threadDraft.trim()) return;
    await send.mutateAsync({ body: threadDraft.trim(), parent_id: threadRoot["id"] as string });
    setThreadDraft("");
  };

  const activeTitle = active ? convTitle(active, profiles, meId) : "";

  return (
    <div className="-m-4 flex h-[calc(100vh-6rem)] gap-0 overflow-hidden lg:m-0 lg:h-[calc(100vh-4rem)]">
      {/* ------------------------------ LEFT RAIL ------------------------------ */}
      <aside
        className={cn(
          "flex w-80 min-w-72 flex-col border-r border-border bg-card",
          activeId && "hidden lg:flex",
        )}
      >
        <div className="space-y-3 border-b border-border p-3">
          <NewConversation meId={meId} onCreated={(id) => setActiveId(id)} />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une conversation…"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent/60 text-muted-foreground hover:bg-accent",
                )}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-1.5">
          {isLoading && <p className="p-3 text-xs text-muted-foreground">Chargement…</p>}
          {!isLoading && list.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">Aucune conversation dans cette vue.</p>
          )}
          {list.map((c) => {
            const on = c["id"] === activeId;
            const isChannel = c["type"] === "channel";
            const last = convLastMessage(c);
            const member = ((c["conversation_members"] ?? []) as Row[]).find(
              (m) => m["user_id"] === meId,
            );
            const unread = member ? false : false;
            const other = ((c["conversation_members"] ?? []) as Row[]).find(
              (m) => m["user_id"] !== meId,
            );
            const avatar = isChannel
              ? null
              : (profiles[other?.["user_id"] as string]?.["avatar_url"] as string | undefined);
            return (
              <button
                key={c["id"]}
                onClick={() => {
                  setActiveId(c["id"] as string);
                  setThreadRoot(null);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                  on ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-accent/50",
                )}
              >
                <span className="relative shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-full border border-border text-[10px] font-bold",
                        on ? "bg-primary/15 text-primary" : "bg-surface",
                      )}
                    >
                      {isChannel ? (
                        <Hash className="h-4 w-4" />
                      ) : (
                        initialsOf(convTitle(c, profiles, meId))
                      )}
                    </span>
                  )}
                  {c["type"] === "dm" && other && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {convTitle(c, profiles, meId)}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatClock(last?.at ?? c["updated_at"])}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-muted-foreground">
                      {last?.body ||
                        `${((c["conversation_members"] ?? []) as Row[]).length} membre(s)`}
                    </span>
                    {member?.["favorited"] && (
                      <Star className="h-3 w-3 shrink-0 fill-warning text-warning" />
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ------------------------------ CENTER CHAT ---------------------------- */}
      <section
        className={cn("flex min-w-0 flex-1 flex-col bg-background", !activeId && "hidden lg:flex")}
      >
        {!active ? (
          <div className="grid flex-1 place-items-center p-6">
            <EmptyState
              title="Aucune conversation sélectionnée"
              description="Créez une conversation directe, un groupe ou un canal pour commencer à collaborer."
            />
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setActiveId(undefined)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{activeTitle}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {typingNames.length ? (
                    <span className="text-primary">{typingNames.join(", ")} écrit…</span>
                  ) : active["type"] === "dm" ? (
                    "En ligne"
                  ) : (
                    `${((active["conversation_members"] ?? []) as Row[]).length} membres`
                  )}
                </p>
              </div>
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher dans la conversation"
                  className="h-8 w-48 pl-8 text-xs"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Appel audio"
                onClick={() => setCall({ open: true, video: false })}
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Appel vidéo"
                onClick={() => setCall({ open: true, video: true })}
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button
                variant={infoOpen ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                title="Informations"
                onClick={() => setInfoOpen((o) => !o)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Options"
                >
                  <Archive className="h-4 w-4" />
                </Button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-lg border border-border bg-popover py-1 text-sm shadow-lg">
                      <button
                        className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-accent"
                        onClick={() => {
                          flags.mutate({ flag: "favorited", value: !membership?.["favorited"] });
                          setMenuOpen(false);
                        }}
                      >
                        <Star className="h-3.5 w-3.5" />{" "}
                        {membership?.["favorited"] ? "Retirer des favoris" : "Ajouter aux favoris"}
                      </button>
                      <button
                        className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-accent"
                        onClick={() => {
                          flags.mutate({ flag: "archived", value: !membership?.["archived"] });
                          setMenuOpen(false);
                          setActiveId(undefined);
                        }}
                      >
                        <Archive className="h-3.5 w-3.5" />{" "}
                        {membership?.["archived"] ? "Désarchiver" : "Archiver"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </header>

            {(messages ?? []).some((m) => m["pinned"]) && (
              <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-1.5 text-xs">
                <Pin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">
                  {(messages ?? []).filter((m) => m["pinned"]).slice(-1)[0]?.["body"]}
                </span>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto py-3">
              {rootMessages.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Aucun message. Dites bonjour 👋
                </p>
              )}
              {rootMessages.map((m) => {
                const mine = m["user_id"] === meId;
                const reactions = ((m["message_reactions"] ?? []) as Row[]).reduce<
                  Record<string, Row[]>
                >((acc, r) => {
                  (acc[r["emoji"] as string] ||= []).push(r);
                  return acc;
                }, {});
                const threadCount = (messages ?? []).filter(
                  (x) => x["parent_id"] === m["id"],
                ).length;
                return (
                  <MessageItem
                    key={m["id"]}
                    message={m}
                    mine={mine}
                    author={profiles[m["user_id"] as string]}
                    parent={null}
                    reactions={reactions}
                    meId={meId}
                    threadCount={threadCount}
                    onReply={() => setThreadRoot(m)}
                    onReact={(emoji, existingId) =>
                      react.mutate({
                        messageId: m["id"] as string,
                        emoji,
                        ...(existingId ? { existingId } : {}),
                      })
                    }
                    onEdit={() => {
                      setEditing(m);
                      setDraft(m["body"] as string);
                    }}
                    onDelete={() => remove.mutate(m["id"] as string)}
                    onPin={() =>
                      update.mutate({ id: m["id"] as string, values: { pinned: !m["pinned"] } })
                    }
                    onOpenThread={() => setThreadRoot(m)}
                  />
                );
              })}
              <div ref={bottomRef} />
            </div>

            <Composer
              draft={draft}
              onDraftChange={setDraft}
              onSend={() => void submit()}
              onTyping={setTyping}
              sending={send.isPending}
              replyPreview={
                replyTo
                  ? {
                      author: displayName(profiles[replyTo["user_id"] as string], "Membre"),
                      body: replyTo["body"] as string,
                    }
                  : null
              }
              editingPreview={editing ? { body: editing["body"] as string } : null}
              onCancelContext={() => {
                setReplyTo(null);
                setEditing(null);
                setDraft("");
              }}
              onFilesPicked={handleFilesPicked}
              pendingFiles={pendingFiles}
              onRemoveFile={(id) => setPendingFiles((prev) => prev.filter((p) => p.id !== id))}
              uploadingFiles={uploadingFiles}
            />
          </>
        )}
      </section>

      {/* ------------------------------ RIGHT PANEL ---------------------------- */}
      {active && threadRoot && (
        <ThreadPanel
          root={threadRoot}
          allMessages={messages ?? []}
          profiles={profiles}
          meId={meId}
          onClose={() => setThreadRoot(null)}
          onSendReply={() => void submitThreadReply()}
          sending={send.isPending}
          replyDraft={threadDraft}
          onReplyDraft={setThreadDraft}
        />
      )}
      {active && infoOpen && !threadRoot && (
        <InfoSidebar
          conversation={active}
          profiles={profiles}
          meId={meId}
          messages={messages ?? []}
          onClose={() => setInfoOpen(false)}
        />
      )}

      <CallModal
        open={call.open}
        onOpenChange={(open) => setCall((c) => ({ ...c, open }))}
        calleeName={activeTitle || "Conversation"}
        calleeAvatar={
          (profiles[
            ((active?.["conversation_members"] ?? []) as Row[]).find(
              (m) => m["user_id"] !== meId,
            )?.["user_id"] as string
          ]?.["avatar_url"] as string) ?? undefined
        }
        isVideo={call.video}
      />
    </div>
  );
}
